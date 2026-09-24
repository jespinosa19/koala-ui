# Koala UI

A polished React design system: components built on Tailwind CSS v4, Radix UI and
`tailwind-variants`, with four themes (light, cream, dark, moonlight) and a density system.
Explore every component at [koala-ui.vercel.app](https://koala-ui.vercel.app).

This repository holds the **free tier**: 104 components, 6 sample
sections (one of each family), the lib helpers and the design tokens. The CLI copies the source into your project, so you own and edit the code; Koala UI is
not a runtime dependency.

## Install

```bash
npx koalaui-cli init                      # tokens, helpers, theme provider, base deps
npx koalaui-cli add button card dialog    # components, dependencies pulled along
npx koalaui-cli update                    # later: updates, files you edited are kept
```

Requires React 19 and Tailwind CSS v4. Full guide:
[koala-ui.vercel.app/docs/installation](https://koala-ui.vercel.app/docs/installation).

## Free and Pro

| Tier | What | Install |
| --- | --- | --- |
| **Free** | components, lib helpers, tokens | `koalaui add <name>`, no account |
| **Pro** | marketing sections, page examples, templates | a license, then `koalaui login <key>` |

Pro source lives in a private repository and reaches buyers through the licensing API, so a
license is the only thing that grants access. [See the plans](https://koala-ui.vercel.app/pro).

## License

Koala UI is commercial software, not open source. The free tier is free to use in any number of
projects, yours and your clients', commercial or not. You may not resell it or build a competing
component library, UI kit or template from it. See [LICENSE](./LICENSE).

The `koalaui` CLI in [packages/koalaui](./packages/koalaui) is MIT.
