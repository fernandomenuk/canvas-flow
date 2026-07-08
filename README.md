<div align="center">

# 🎨 Canvas Flow

### **Point at it. Don't screenshot it.**

The human-in-the-loop review layer for agent-generated HTML.

[![npm](https://img.shields.io/npm/v/@menukfernandoo/canvas-flow?color=6d5cff&label=npm)](https://www.npmjs.com/package/@menukfernandoo/canvas-flow)
[![node](https://img.shields.io/node/v/@menukfernandoo/canvas-flow?color=34e0cf)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@menukfernandoo/canvas-flow?color=6d5cff)](./LICENSE)

</div>

---

Agents write great HTML. Reviewing it shouldn't mean pasting screenshots and typing "make the button on the left a bit bigger." Canvas Flow opens your agent's HTML in a local browser, lets you **click the element**, **select the text**, or **pick the diagram node** you mean, and sends that feedback straight back to the agent — no cloud in the loop.

## 🚀 Quick start

Install the skill (no `npm install` needed — the CLI comes along on demand):

```sh
npx skills add fernandomenuk/canvas-flow --skill canvasflow
```

Then, in any agent that exposes skills as slash commands:

```
/canvasflow let's review our plan here
```

Or skip the skill entirely and just tell your agent:

> Use `npx @menukfernandoo/canvas-flow` to write a plan for what we discussed.

## ✨ What you get

- 🖊️ **Annotate anything** — click an element, highlight text, or select a Mermaid node; your feedback carries the exact target, not a vague description.
- 🕘 **Version history** — save checkpoints, restore any of them, and compare two side by side. Like git, but visual.
- 🔁 **Live reload** — file changes hit the browser instantly, scroll position preserved.
- 🚦 **Layout gate** — the real browser render is audited for overflow and overlap before you're asked to look.
- 📦 **Export & share** — collapse an artifact into one portable HTML file, or publish an opt-in link.
- 🏠 **Local-first** — a loopback server on your machine; the core feedback loop never leaves it.

## 🔎 How it works

```
1.  Agent writes  ──►  artifact.html
2.  You run       ──►  canvas-flow artifact.html   (opens the review browser)
3.  You annotate  ──►  canvas-flow poll artifact.html   (delivers feedback to the agent)
```

Sessions are keyed by the file path, so there are no opaque IDs to pass around. The artifact runs in a sandboxed iframe while Canvas Flow injects a small SDK for annotations and layout checks — the saved HTML still opens identically anywhere.

## 🛠️ Commands

| Command                          | What it does                                                                |
| -------------------------------- | --------------------------------------------------------------------------- |
| `canvas-flow <file.html>`        | Open or resume a review session in your browser                             |
| `canvas-flow poll <file.html>`   | Long-poll until the human sends feedback or ends the session                |
| `canvas-flow export <file.html>` | Write a self-contained, portable copy with local assets inlined             |
| `canvas-flow share <file.html>`  | Publish to [ht-ml.app](https://ht-ml.app) (third-party host) and get a link |
| `canvas-flow end <file.html>`    | End the session                                                             |
| `canvas-flow stop`               | Shut down the background server                                             |
| `canvas-flow design`             | Print the Tailwind + DaisyUI CDN design fallback                            |

<details>
<summary><b>Advanced</b> — session hook, sharing, and configuration</summary>

### Ambient session hook

Want Canvas Flow's context (including your live open sessions) fed into every agent session automatically?

```sh
npm install -g @menukfernandoo/canvas-flow
canvas-flow setup hooks
```

This installs a `SessionStart` hook for Claude Code, Codex, OpenCode, and GitHub Copilot CLI. Restart your agent session afterward.

### Sharing safety

`canvas-flow share` uploads the artifact (local assets inlined) to **ht-ml.app**, a separate third-party service. Pages are **public by default**; use `--password` to make one private. The response includes a secret `update_key`, shown once, needed to update or delete the page later. Remote assets are never fetched, and file paths outside safe asset references are redacted before upload. Don't publish secrets.

### Configuration

| Variable                      | Purpose                                               |
| ----------------------------- | ----------------------------------------------------- |
| `CANVAS_FLOW_STATE_DIR`       | Where session state lives (default `~/.canvas-flow/`) |
| `CANVAS_FLOW_HOST`            | Bind address (default loopback `127.0.0.1`)           |
| `CANVAS_FLOW_PORT`            | Server port (default `4387`)                          |
| `CANVAS_FLOW_IDLE_TIMEOUT_MS` | Idle self-shutdown; `0`/`off` to disable              |

> ⚠️ Binding beyond loopback exposes an unauthenticated server that can read and serve local files. Only do it on a trusted network.

</details>

## 🧑‍💻 Development

```sh
git clone https://github.com/fernandomenuk/canvas-flow.git
cd canvas-flow
pnpm install --frozen-lockfile
pnpm run build     # bundle the CLI, chrome, and design assets
pnpm run check     # build + lint + format + typecheck + test
```

## License

[MIT](./LICENSE)
