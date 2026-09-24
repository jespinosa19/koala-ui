/**
 * Dependency-free QR Code generator.
 *
 * A compact TypeScript port of Project Nayuki's QR Code generator reference implementation
 * (MIT / public domain, https://www.nayuki.io/page/qr-code-generator-library), trimmed to
 * byte mode (UTF-8). Byte mode covers URLs, plain text and `otpauth://` URIs — the cases a
 * UI library renders — so the alphanumeric/numeric/kanji segment machinery is dropped.
 *
 * Keeping this in-house matches the rest of Koala's hard primitives (Chart, Calendar, the
 * Command palette are all hand-rolled and dependency-free) and keeps the gated-CLI source
 * self-contained: no runtime dependency to vendor.
 *
 * `encodeQR(text, ecc)` returns a square `boolean[][]` of modules (`true` = dark), already
 * masked and with format/version info drawn. The quiet zone is *not* included — the React
 * component adds it as padding so it can be styled.
 */

export type QRErrorCorrection = "L" | "M" | "Q" | "H"

// Per-ECC metadata. `ordinal` indexes the tables below (L,M,Q,H = 0..3); `formatBits` is the
// 2-bit code the spec assigns each level (note it is *not* the same order as the ordinal).
const ECC: Record<QRErrorCorrection, { ordinal: number; formatBits: number }> = {
  L: { ordinal: 0, formatBits: 1 },
  M: { ordinal: 1, formatBits: 0 },
  Q: { ordinal: 2, formatBits: 3 },
  H: { ordinal: 3, formatBits: 2 },
}

const MIN_VERSION = 1
const MAX_VERSION = 40
const PENALTY_N1 = 3
const PENALTY_N2 = 3
const PENALTY_N3 = 40
const PENALTY_N4 = 10

// Number of error-correction codewords per block, indexed [eccOrdinal][version]. Index 0 of
// each row is an unused placeholder so `version` indexes directly.
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
]

// Number of error-correction blocks, indexed [eccOrdinal][version].
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
]

// ─── Galois field GF(256) arithmetic (for Reed-Solomon) ──────────────────────────

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xff
}

function reedSolomonComputeDivisor(degree: number): number[] {
  const result: number[] = new Array(degree).fill(0)
  result[degree - 1] = 1
  // Compute the product polynomial (x - r^0)(x - r^1)...(x - r^(degree-1)) over GF(256),
  // where r = 0x02. The coefficients are stored from highest to lowest power.
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root)
      if (j + 1 < result.length) result[j] ^= result[j + 1]
    }
    root = reedSolomonMultiply(root, 0x02)
  }
  return result
}

function reedSolomonComputeRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = new Array(divisor.length).fill(0)
  for (const b of data) {
    const factor = b ^ (result.shift() as number)
    result.push(0)
    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= reedSolomonMultiply(divisor[i], factor)
    }
  }
  return result
}

// ─── Capacity helpers ────────────────────────────────────────────────────────────

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (ver >= 7) result -= 36
  }
  return result
}

function getNumDataCodewords(ver: number, ecc: QRErrorCorrection): number {
  const o = ECC[ecc].ordinal
  return (
    Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[o][ver] * NUM_ERROR_CORRECTION_BLOCKS[o][ver]
  )
}

// Byte-mode character-count indicator width grows with version.
function byteModeCountBits(ver: number): number {
  return ver <= 9 ? 8 : 16
}

function toUtf8(text: string): number[] {
  // TextEncoder is available in browsers and modern Node; encodeURIComponent is the portable
  // fallback that yields the same UTF-8 byte sequence.
  if (typeof TextEncoder !== "undefined") {
    return Array.from(new TextEncoder().encode(text))
  }
  const escaped = encodeURIComponent(text)
  const bytes: number[] = []
  for (let i = 0; i < escaped.length; i++) {
    if (escaped[i] === "%") {
      bytes.push(parseInt(escaped.substring(i + 1, i + 3), 16))
      i += 2
    } else {
      bytes.push(escaped.charCodeAt(i))
    }
  }
  return bytes
}

// ─── Encoder ─────────────────────────────────────────────────────────────────────

export interface QRMatrix {
  size: number
  modules: boolean[][]
}

export function encodeQR(text: string, ecc: QRErrorCorrection = "M"): QRMatrix {
  const data = toUtf8(text)

  // Pick the smallest version that holds the data at the requested ECC level.
  let version = MIN_VERSION
  for (; ; version++) {
    if (version > MAX_VERSION) {
      throw new Error("Data too long to encode in a QR code")
    }
    const dataCapacityBits = getNumDataCodewords(version, ecc) * 8
    const usedBits = 4 + byteModeCountBits(version) + data.length * 8
    if (usedBits <= dataCapacityBits) break
  }

  // Build the data bit stream: mode indicator (byte = 0b0100), char count, then the bytes.
  const bits: number[] = []
  const appendBits = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1)
  }
  appendBits(0b0100, 4)
  appendBits(data.length, byteModeCountBits(version))
  for (const b of data) appendBits(b, 8)

  const dataCapacityBits = getNumDataCodewords(version, ecc) * 8
  // Terminator (up to 4 zero bits), then pad to a byte boundary.
  appendBits(0, Math.min(4, dataCapacityBits - bits.length))
  appendBits(0, (8 - (bits.length % 8)) % 8)
  // Pad with the two alternating pad codewords until the capacity is filled.
  for (let pad = 0xec; bits.length < dataCapacityBits; pad ^= 0xec ^ 0x11) {
    appendBits(pad, 8)
  }

  // Pack bits into codewords.
  const dataCodewords: number[] = new Array(bits.length / 8).fill(0)
  bits.forEach((bit, i) => {
    dataCodewords[i >>> 3] |= bit << (7 - (i & 7))
  })

  const allCodewords = addEccAndInterleave(dataCodewords, version, ecc)
  return drawMatrix(version, ecc, allCodewords)
}

function addEccAndInterleave(
  data: number[],
  ver: number,
  ecc: QRErrorCorrection,
): number[] {
  const o = ECC[ecc].ordinal
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[o][ver]
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[o][ver]
  const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)

  const blocks: number[][] = []
  const rsDiv = reedSolomonComputeDivisor(blockEccLen)
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1)
    const dat = data.slice(k, k + datLen)
    k += datLen
    const eccBlock = reedSolomonComputeRemainder(dat, rsDiv)
    if (i < numShortBlocks) dat.push(0) // padding cell, skipped during interleave
    blocks.push(dat.concat(eccBlock))
  }

  // Interleave the codewords across blocks, skipping each short block's padding cell.
  const result: number[] = []
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(blocks[j][i])
      }
    }
  }
  return result
}

// ─── Matrix drawing ────────────────────────────────────────────────────────────

function drawMatrix(
  version: number,
  ecc: QRErrorCorrection,
  allCodewords: number[],
): QRMatrix {
  const size = version * 4 + 17
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  )
  // Tracks which modules are function patterns (never masked, never carry data).
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  )

  const setFunction = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark
    isFunction[y][x] = true
  }

  // Finder pattern (7×7) plus its separator, centered at (cx, cy).
  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < size && y >= 0 && y < size) {
          setFunction(x, y, dist !== 2 && dist !== 4)
        }
      }
    }
  }

  // Alignment pattern (5×5), centered at (cx, cy).
  const drawAlignment = (cx: number, cy: number) => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
      }
    }
  }

  // Timing patterns.
  for (let i = 0; i < size; i++) {
    setFunction(6, i, i % 2 === 0)
    setFunction(i, 6, i % 2 === 0)
  }

  // Three finder patterns (top-left, top-right, bottom-left).
  drawFinder(3, 3)
  drawFinder(size - 4, 3)
  drawFinder(3, size - 4)

  // Alignment patterns at every intersection of the position list, except where they would
  // overlap a finder pattern.
  const alignPositions = getAlignmentPatternPositions(version)
  const numAlign = alignPositions.length
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      const skipCorner =
        (i === 0 && j === 0) ||
        (i === 0 && j === numAlign - 1) ||
        (i === numAlign - 1 && j === 0)
      if (!skipCorner) drawAlignment(alignPositions[i], alignPositions[j])
    }
  }

  // Reserve the format-info modules now (drawn for real after masking) so the data routing
  // skips them; pass a dummy mask here.
  drawFormatBits(modules, isFunction, ecc, 0, true)
  drawVersionInfo(modules, setFunction, version)

  // Route data + ECC codewords through the free modules in the zig-zag order.
  drawCodewords(modules, isFunction, size, allCodewords)

  // Try all 8 masks, keep the one with the lowest penalty.
  let bestMask = 0
  let minPenalty = Infinity
  for (let mask = 0; mask < 8; mask++) {
    applyMask(modules, isFunction, size, mask)
    drawFormatBits(modules, isFunction, ecc, mask, false)
    const penalty = getPenaltyScore(modules, size)
    if (penalty < minPenalty) {
      minPenalty = penalty
      bestMask = mask
    }
    applyMask(modules, isFunction, size, mask) // XOR again to undo
  }
  applyMask(modules, isFunction, size, bestMask)
  drawFormatBits(modules, isFunction, ecc, bestMask, false)

  return { size, modules }
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) return []
  const size = version * 4 + 17
  const numAlign = Math.floor(version / 7) + 2
  const step =
    version === 32
      ? 26
      : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2
  const result: number[] = [6]
  for (let pos = size - 7; result.length < numAlign; pos -= step) {
    result.splice(1, 0, pos)
  }
  return result
}

function drawFormatBits(
  modules: boolean[][],
  isFunction: boolean[][],
  ecc: QRErrorCorrection,
  mask: number,
  reserveOnly: boolean,
) {
  const size = modules.length
  // 15-bit format info = 5 data bits (ecc<<3 | mask) + 10-bit BCH error correction.
  const data = (ECC[ecc].formatBits << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  const bits = ((data << 10) | rem) ^ 0x5412

  const set = (x: number, y: number, i: number) => {
    const dark = reserveOnly ? false : ((bits >>> i) & 1) !== 0
    modules[y][x] = dark
    isFunction[y][x] = true
  }

  // First copy (around the top-left finder).
  for (let i = 0; i <= 5; i++) set(8, i, i)
  set(8, 7, 6)
  set(8, 8, 7)
  set(7, 8, 8)
  for (let i = 9; i < 15; i++) set(14 - i, 8, i)

  // Second copy (split between the other two finders).
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, i)
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, i)

  // The lone always-dark module.
  modules[size - 8][8] = true
  isFunction[size - 8][8] = true
}

function drawVersionInfo(
  modules: boolean[][],
  setFunction: (x: number, y: number, dark: boolean) => void,
  version: number,
) {
  if (version < 7) return
  const size = version * 4 + 17
  // 18-bit version info = 6 data bits + 12-bit BCH.
  let rem = version
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
  const bits = (version << 12) | rem

  for (let i = 0; i < 18; i++) {
    const dark = ((bits >>> i) & 1) !== 0
    const a = size - 11 + (i % 3)
    const b = Math.floor(i / 3)
    setFunction(a, b, dark)
    setFunction(b, a, dark)
  }
}

function drawCodewords(
  modules: boolean[][],
  isFunction: boolean[][],
  size: number,
  data: number[],
) {
  let i = 0 // bit index into data
  // Walk up/down in vertical pairs of columns, right to left, skipping the vertical timing line.
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const upward = ((right + 1) & 2) === 0
        const y = upward ? size - 1 - vert : vert
        if (!isFunction[y][x] && i < data.length * 8) {
          modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0
          i++
        }
        // Remaining modules (when data runs out) stay false, as the spec requires.
      }
    }
  }
}

function applyMask(
  modules: boolean[][],
  isFunction: boolean[][],
  size: number,
  mask: number,
) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFunction[y][x]) continue
      let invert: boolean
      switch (mask) {
        case 0: invert = (x + y) % 2 === 0; break
        case 1: invert = y % 2 === 0; break
        case 2: invert = x % 3 === 0; break
        case 3: invert = (x + y) % 3 === 0; break
        case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break
        case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break
        case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break
        case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break
        default: invert = false
      }
      if (invert) modules[y][x] = !modules[y][x]
    }
  }
}

function getPenaltyScore(modules: boolean[][], size: number): number {
  let result = 0

  // Rule 1: runs of five or more same-colored modules in a row/column.
  for (let y = 0; y < size; y++) {
    let runColor = false
    let runLen = 0
    for (let x = 0; x < size; x++) {
      if (modules[y][x] === runColor) {
        runLen++
        if (runLen === 5) result += PENALTY_N1
        else if (runLen > 5) result++
      } else {
        runColor = modules[y][x]
        runLen = 1
      }
    }
  }
  for (let x = 0; x < size; x++) {
    let runColor = false
    let runLen = 0
    for (let y = 0; y < size; y++) {
      if (modules[y][x] === runColor) {
        runLen++
        if (runLen === 5) result += PENALTY_N1
        else if (runLen > 5) result++
      } else {
        runColor = modules[y][x]
        runLen = 1
      }
    }
  }

  // Rule 2: 2×2 blocks of the same color.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = modules[y][x]
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) {
        result += PENALTY_N2
      }
    }
  }

  // Rule 3: finder-like 1:1:3:1:1 patterns (with a 4-module light run on one side) in
  // rows and columns.
  const hasFinderRun = (line: boolean[]) => {
    let count = 0
    for (let i = 0; i <= line.length - 7; i++) {
      if (
        line[i] && !line[i + 1] && line[i + 2] && line[i + 3] && line[i + 4] &&
        !line[i + 5] && line[i + 6]
      ) {
        const before = i >= 4 && !line[i - 1] && !line[i - 2] && !line[i - 3] && !line[i - 4]
        const after =
          i + 10 < line.length &&
          !line[i + 7] && !line[i + 8] && !line[i + 9] && !line[i + 10]
        if (before || after) count++
      }
    }
    return count
  }
  for (let y = 0; y < size; y++) {
    result += hasFinderRun(modules[y]) * PENALTY_N3
  }
  for (let x = 0; x < size; x++) {
    const col: boolean[] = []
    for (let y = 0; y < size; y++) col.push(modules[y][x])
    result += hasFinderRun(col) * PENALTY_N3
  }

  // Rule 4: deviation of the dark-module ratio from 50%.
  let dark = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) dark++
    }
  }
  const total = size * size
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1
  result += k * PENALTY_N4

  return result
}
