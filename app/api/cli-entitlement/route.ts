/**
 * Entitlement proxy for the `koalaui` CLI.
 *
 * The CLI POSTs { key, repo, path } here and gets back { content } for an active license, or a
 * 403 it can turn into a paywall message. All this route does is forward to the Supabase Edge
 * Function that holds the real logic (license lookup, registry check, private-repo fetch).
 *
 * Why the hop exists: the CLI is published to npm, so whatever URL it ships with is baked into
 * every installed copy forever. Pointing it at a domain we own means the backend can move
 * (different Supabase project, different provider) without republishing the CLI or stranding
 * anyone who already installed it. Set $KOALA_FUNCTIONS_URL to repoint it.
 *
 * No secret is used or needed here: the license key travels in the body and the Edge Function
 * runs with verify_jwt = false, authenticating the caller by the key itself.
 */

const FUNCTIONS =
  process.env.KOALA_FUNCTIONS_URL ?? "https://vhoyhiazehpgswtxapxm.supabase.co/functions/v1"

/** Upstream can be slow to cold-start; give up before the platform kills us with no message. */
const TIMEOUT_MS = 20_000

export async function POST(request: Request): Promise<Response> {
  // Read as text and forward verbatim: this route has no opinion on the payload shape, so the
  // Edge Function stays the single place that validates it.
  const body = await request.text()

  let upstream: Response
  try {
    upstream = await fetch(`${FUNCTIONS}/cli-entitlement`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError"
    return Response.json(
      { error: timedOut ? "entitlement service timed out" : "entitlement service unreachable" },
      { status: 504 },
    )
  }

  // Pass the status through untouched. The CLI keys its paywall message off 403, so rewriting
  // status codes here would turn "invalid license" into an opaque failure.
  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  })
}
