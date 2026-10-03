# Koala UI

A polished React design system: components built on Tailwind CSS v4, Radix UI and
`tailwind-variants`, with four themes (light, cream, dark, moonlight) and a density system.
Explore every component at [koalaui.com](https://www.koalaui.com).

This repository holds the **free tier**: 125 components, 0 sample
sections (one of each family), the lib helpers and the design tokens. The CLI copies the source into your project, so you own and edit the code; Koala UI is
not a runtime dependency.

## Install

```bash
npx koalaui-cli@latest init                      # tokens, helpers, theme provider, base deps
npx koalaui-cli@latest add button card dialog    # components, dependencies pulled along
npx koalaui-cli@latest update                    # later: updates, files you edited are kept
```

Requires React 19 and Tailwind CSS v4. Full guide:
[koalaui.com/docs/installation](https://www.koalaui.com/docs/installation).

## For coding agents

`npx koalaui-cli@latest skill` writes the Koala UI agent skill ([skills/koala-ui](./skills/koala-ui)) into
`.claude/skills/koala-ui/`: the house rules plus one reference per component, generated from the
docs. Every docs page is also served as markdown at its URL plus `.md`, indexed by
[llms.txt](https://www.koalaui.com/llms.txt).

## Free and Pro

| Tier | What | Install |
| --- | --- | --- |
| **Free** | components, lib helpers, tokens | `npx koalaui-cli@latest add <name>`, no account |
| **Pro** | every section, page examples, templates | a license, then `npx koalaui-cli@latest login <key>` |

Pro source lives in a private repository and reaches buyers through the licensing API, so a
license is the only thing that grants access. [See the plans](https://www.koalaui.com/pro).

## License

Koala UI is commercial software, not open source. The free tier is free to use in any number of
projects, yours and your clients', commercial or not. You may not resell it or build a competing
component library, UI kit or template from it. See [LICENSE](./LICENSE).

The `koalaui` CLI in [packages/koalaui](./packages/koalaui) is MIT.
