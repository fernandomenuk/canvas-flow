<h1 align="center">canvas-flow</h1>

<h3 align="center">For when a rich editor is not rich enough.</h3>

HTML is the new markdown. Canvas Flow is the new editor for your HTML artifacts.

Agents are good at producing rich HTML artifacts, but the human-agent collaboration loop on such artifacts is lacking and falls back into screenshots and long responses for “tell me what to change.”
That loses the thing HTML is best at: interactivity.

Canvas Flow opens agent-generated HTML files in a local browser, lets you pinpoint elements, selected text, or Mermaid diagram nodes and send feedback to the agent to address.

- **Local-first** - Review local HTML artifacts with a local CLI and no cloud dependency in the core feedback loop; hosted sharing through third-party ht-ml.app is explicit and opt-in.
- **Human-AI collaboration** - Annotate elements, selected text ranges, and Mermaid diagram nodes, and send messages to the agent without leaving Canvas Flow.
- **Battery included** - Canvas Flow teaches your agent good visualization for common use cases such as product or technical plans, design explorations and more out of the box.

Canvas Flow is an [AXI](https://axi.md), which means -

- It's just a CLI any capable agent can run without setup.
- It's optimized for agent ergonomics. TOON output, long polling, and contextual disclosure making it highly token efficient.
- The skill and hooks below only handle discovery; agents learn to use the AXI by using it.

## Quick Start

Install the CanvasFlow skill in the [Agent Skills](https://agentskills.io) format with [`npx skills`](https://github.com/vercel-labs/skills):

```sh
npx skills add fernandomenuk/canvas-flow --skill canvasflow
```

That is the entire setup - no npm install needed.
The skill teaches your agent to run CanvasFlow through `npx -y @menukfernandoo/canvas-flow`, so the CLI comes along on demand.
Its frontmatter also includes Hermes Agent metadata, so Hermes-compatible harnesses can categorize and surface it as a first-class productivity skill.
This installs the public `canvasflow` skill.
The repository also contains an internal `canvasflow-design` brand skill for maintainers; default `npx skills add ... --list` and skills.sh discovery hide it unless `INSTALL_INTERNAL_SKILLS=1` is set.

Then, in agents that expose skills as slash commands (Claude Code, for example), invoke it directly:

```
/canvasflow let's discuss our plan here
```

Or just ask for anything that is easier to grasp visually - a plan, comparison, diagram, table, code view, or report - and the agent loads the skill on its own when it recognizes the task.

By default the skill lands in the current project's skills directory (`.claude/skills/`, for example); add `-g` to install it for all projects (`~/.claude/skills/`).

## Other Ways to Use CanvasFlow

The skill is the recommended path, but it is not the only one.

### Zero setup

CanvasFlow is an AXI, so any capable agent can run the CLI directly with nothing installed at all.
Just tell your agent:

```
Use `npx @menukfernandoo/canvas-flow` to write a product or technical plan for what we discussed.
```

### Session hook

Want CanvasFlow's ambient context - including your live open sessions - fed into every agent session instead of loading on demand?
Install the CLI globally and opt into the hook:

```sh
npm install -g @menukfernandoo/canvas-flow
canvas-flow setup hooks
```

This installs a `SessionStart` hook for **Claude Code**, **Codex**, **OpenCode**, and **GitHub Copilot CLI** that surfaces open sessions, visualization playbooks, and usage guidance at the start of each session.
Unlike the skill, the hook also shows your live open sessions, so a fresh agent session can resume an in-flight review.
**Restart your agent session after running this** so the new hook takes effect.

### From source

```sh
git clone https://github.com/fernandomenuk/canvas-flow.git
cd canvas-flow
pnpm install --frozen-lockfile
pnpm run build
pnpm link
```

## How It Works

```
┌───────────────┐
│ Agent writes  │
│ artifact.html │
└───────┬───────┘
        ▼
┌────────────────────────┐
│ canvas-flow <file_path> │
│ opens local browser UI │
└───────┬────────────────┘
        ▼
┌────────────────────────┐
│ Human annotates text   │
│ or elements, sends     │
│ chat, or browser audit │
│ reports layout issues  │
└───────┬────────────────┘
        ▼
┌────────────────────────┐
│ canvas-flow poll waits  │
│ and returns prompts    │
│ or layout warnings     │
└────────────────────────┘
```

- **File-path identity** - Sessions are keyed by the canonical HTML file path, so agents do not need opaque IDs.
- **Portable artifacts** - The artifact runs in an iframe while CanvasFlow injects a small SDK for annotations, snapshots, feedback controls, and render-time layout checks.
  CanvasFlow does not inject any design system, so the saved HTML file renders identically whether you open it through `canvas-flow` or directly in a browser.
  Before writing HTML, choose a design system in strict priority order: follow a user-requested look first; otherwise inspect the project the artifact is about - the subject or product whose content or UI it represents, which may differ from your current working directory - and match that project's Tailwind or theme config, CSS variables or design tokens, component library, brand assets, or existing styled pages.
  If the artifact previews, proposes, or mocks a specific app's UI, render it in that app's own design system so it faithfully shows the product, even when you are running in a different repo.
  Only when both come up empty, run `canvas-flow design` for a copy-pasteable Tailwind CSS v4 + DaisyUI v5 CDN fallback, a content-to-playbook router, and Mermaid diagram tooling.
  That fallback guidance recommends DaisyUI's `luxury` theme by default, warns not to `@apply` DaisyUI classes inside Tailwind browser-runtime style blocks, includes an optional layout safety CSS snippet for dense nested grid/flex layouts, and provides a pinned Mermaid CDN snippet with initialization for flows, architecture, state, and sequence diagrams.
- **Open-time layout gate** - The browser chrome masks each artifact until the real in-iframe layout audit reports no error-severity findings.
  Warning-only artifacts reveal normally; error findings notify the agent through the same `layout_warnings` poll path and keep the curtain up until a clean reload.
  The user can click **Show anyway**, and a bounded safety timeout reveals with a persistent layout-issues banner so review is never blocked indefinitely.
- **Layout warnings** - After fonts load and layout settles, the injected SDK audits the real browser render for page horizontal overflow, element overflow, clipped or visibly spilling text, and overlapping text.
  Intentional horizontal scrollers using `overflow-x: auto` or `scroll` are excluded from horizontal checks, and `overflow-y: auto` or `scroll` is treated as intentional for vertical overflow.
  Current findings are returned from `canvas-flow poll` as `layout_warnings` with `selector`, `kind`, `overflowPx`, `viewportWidth`, `severity`, and `persistent`.
  Fresh error-severity findings should be fixed and rechecked before asking the human to review; repeated or warning-only findings can be surfaced to the human with a note when the cause is not obvious.
- **Local assets** - Copy local images, CSS, fonts, and scripts next to the HTML artifact and reference them with relative paths from that directory; root-prefixed paths such as `/assets/logo.png` will not resolve through CanvasFlow's artifact route.
- **Export and sharing** - `canvas-flow export` writes `<name>.export.html` by inlining local assets only, stripping the annotation SDK, and leaving remote CDN/font references as links that still need network access.
  `canvas-flow share` publishes the same local-inlined HTML to [ht-ml.app](https://ht-ml.app), a third-party hosting service not part of CanvasFlow.
  Publishing sends the artifact to ht-ml.app's servers, public by default, or private and password-protected with `--password`; the response includes a secret `update_key` shown once for later management.
  Bundling never fetches remote URLs, CanvasFlow itself does not set a CSP, local reads stay confined and size-capped, and absolute `file://` paths outside safe inlined asset references are redacted before output.
  Per-asset and per-bundle inline caps default to 10 MB and 25 MB, overridable with `CANVAS_FLOW_EXPORT_MAX_ASSET_BYTES` and `CANVAS_FLOW_EXPORT_MAX_BUNDLE_BYTES`.
  Unresolved local assets or export notices such as author-set CSP meta tags and redacted file URLs are surfaced in command or browser output.
  Use `--token` or `CANVAS_FLOW_HTML_APP_TOKEN` for an optional bearer token; set `CANVAS_FLOW_HTML_APP_API_URL` only when overriding the ht-ml.app API base.
- **Live reload** - CanvasFlow watches the HTML artifact file by default and preserves the artifact iframe scroll position across reloads. To also reload on sibling asset changes, add `data-canvasflow-live-reload-root` to the root element or `<meta name="canvasflow-live-reload" content="root">`.
- **Feedback controls** - Native controls (radios, checkboxes, inputs, selects, buttons, labels, disclosure summaries, contenteditable) are interactive automatically, so they do not need `data-canvasflow-action`.
  For reversible choices, let option clicks update local state, then queue exactly one final answer from a per-question submit or Queue answer button with `window.canvasflow.queuePrompt()`.
  Mark only custom (non-native) clickable elements with `data-canvasflow-action` so CanvasFlow does not annotate them, and use `data-canvasflow-question` or `queueKey` when pre-send updates for the same question should replace each other.
  The browser chrome keeps editing actions in the overflow menu (copy path, reload artifact, copy DOM snapshot, export standalone HTML, publish link, end session) and can submit queued prompts with **Send & end session**, which sends the prompts and user-ended attribution together.
- **Keyboard shortcuts** - In the chrome composer, Enter sends queued prompts and Shift+Enter inserts a newline.
  In the annotation card, Enter queues the annotation, Shift+Enter inserts a newline, and Ctrl+Enter (Cmd+Enter on macOS) queues it and sends all queued prompts immediately.
  Cmd+I or Ctrl+I toggles between annotate and explore mode from either the browser chrome or the artifact iframe, including while focus is in a textarea or control.
- **Agent presence** - The browser shows when no agent is listening, keeps queued feedback and fresh layout warnings for the next successful `canvas-flow poll` send even across reloads, and only blocks human sends while the agent is working on delivered feedback. The no-timeout poll writes an immediate stderr banner and periodic stderr heartbeats while stdout stays reserved for the final response; if the poll is interrupted or times out, re-run it because queued feedback is never lost.
- **Session end etiquette** - CanvasFlow tracks who ended a session: a human clicking **End session** (or **Send & end session**) in the browser is a user-initiated end, while `canvas-flow end <html-file>` is agent-initiated.
  A plain `canvas-flow <html-file>` after a user-initiated end refuses to reopen the browser and returns guidance instead; pass `--reopen` only when the user asks for further review or something important needs their visual attention.
  Agent-initiated ends keep reopening normally, same as before.
  `canvas-flow poll`'s `ended` response and the `feedback` response for the final batch before an end both carry `next_step` guidance telling the agent to stop polling and deliver remaining updates in chat instead of reopening.
- **Precise targets** - Text annotations include selected text plus range anchors, so agents are not limited to whole-element selectors.
- **Mermaid diagrams** - Rendered Mermaid diagrams become pannable and zoomable while you explore (drag to pan, scroll to zoom) and freeze when you turn on annotation so a click lands on a single node. Clicking a node annotates the whole node and sends the agent its diagram id, node id, and rendered label instead of just a CSS selector. CanvasFlow only enhances the live render, so the saved HTML still opens identically anywhere.
- **Server cleanup** - The detached server stops after the last session ends when nothing is connected, or after `CANVAS_FLOW_IDLE_TIMEOUT_MS` (default 30 minutes) with no browser or poll connections.
  Set `CANVAS_FLOW_IDLE_TIMEOUT_MS=0` or `off` to disable idle self-shutdown.
- **Local-first state** - Session state stays under `~/.canvas-flow/` by default, or `CANVAS_FLOW_STATE_DIR` when set.
- **Network binding** - The server binds to loopback (`127.0.0.1`) by default. Set `CANVAS_FLOW_HOST` to bind elsewhere; a wildcard (`0.0.0.0` or `::`) binds every interface. Binding beyond loopback exposes an unauthenticated server that can read and serve arbitrary local files to anything that can reach it, so only do so on a trusted network. Set `CANVAS_FLOW_LINK_HOST` to control the hostname written into generated session links (defaults to the bind address, or loopback when bound to a wildcard).

## CLI Reference

| Command                          | Description                                                                                                                                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas-flow`                    | Show current sessions and usage guidance.                                                                                                                                                                                                                                     |
| `canvas-flow update`             | Check for or apply the latest npm release through the AXI SDK self-updater.                                                                                                                                                                                                   |
| `canvas-flow <html-file>`        | Open or resume a Canvas Flow session, with the open-time layout gate enabled by default. Refuses to reopen a session the user explicitly ended from the browser unless `--reopen` is passed.                                                                                  |
| `canvas-flow poll <html-file>`   | Long-poll until the user sends feedback, ends the session, or the browser reports fresh `layout_warnings`; leave no-timeout polls running, or re-run them if interrupted. On `status: ended`, stop polling and do not reopen uninvited.                                       |
| `canvas-flow end <html-file>`    | End a session as the agent; unlike a user-initiated end from the browser, this still allows a plain reopen later.                                                                                                                                                             |
| `canvas-flow export <html-file>` | Write a portable copy of the artifact: one HTML file with its local assets inlined, so it opens with no server and no sibling files. Remote CDN/font references are left as links.                                                                                            |
| `canvas-flow share <html-file>`  | Publish the artifact (local assets inlined) to [ht-ml.app](https://ht-ml.app), a third-party host not part of CanvasFlow, and print a visitable URL plus a secret update key; shares are public by default, and `--password` makes viewers enter the password before viewing. |
| `canvas-flow stop`               | Shut down the background server.                                                                                                                                                                                                                                              |
| `canvas-flow playbook [id]`      | List focused artifact guidance or show one playbook; agents must open each matching playbook before writing HTML.                                                                                                                                                             |
| `canvas-flow design`             | Show the Tailwind + DaisyUI CDN fallback, content-to-playbook router, Mermaid diagram tooling, `luxury` default theme, DaisyUI `@apply` warning, and layout safety snippet.                                                                                                   |
| `canvas-flow setup hooks`        | Install or repair optional SessionStart hooks for Claude Code, Codex, OpenCode, and GitHub Copilot CLI; restart the agent session afterward.                                                                                                                                  |
| `canvas-flow server`             | Run the local Canvas Flow server.                                                                                                                                                                                                                                             |

Known playbook IDs: `diagram`, `table`, `comparison`, `plan`, `code`, `input`, `slides`.
One artifact often combines several playbooks, such as a plan that includes a comparison and a diagram, so agents must match against each `use_when` trigger and open every matching playbook before writing HTML.
For flows, architecture, state, or sequence diagrams, open the diagram playbook and use the Mermaid tooling from `canvas-flow design` unless SVG is needed for richly annotated nodes; avoid hand-built div/flexbox boxes-and-arrows.

### Flags

| Command                   | Flag                  | Description                                                                                                                                                                                                                            |
| ------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas-flow <html-file>` | `--no-open`           | Ensure the server/session exists without opening another browser window.                                                                                                                                                               |
| `canvas-flow <html-file>` | `--no-gate`           | Skip the open-time layout curtain for this browser open.                                                                                                                                                                               |
| `canvas-flow <html-file>` | `--reopen`            | Reopen a session the user explicitly ended from the browser; without it, a plain open refuses and explains why instead of reopening uninvited.                                                                                         |
| `canvas-flow update`      | `--check`             | Report current vs latest npm version without installing an update.                                                                                                                                                                     |
| `canvas-flow export`      | `--out <path>`        | Write the export to a specific path instead of `<name>.export.html` next to the source.                                                                                                                                                |
| `canvas-flow share`       | `--password <pw>`     | Make the third-party ht-ml.app page private; viewers must supply the password.                                                                                                                                                         |
| `canvas-flow share`       | `--token <t>`         | Attach an optional bearer token (`CANVAS_FLOW_HTML_APP_TOKEN`); never required to publish.                                                                                                                                             |
| `canvas-flow poll`        | `--agent-reply "..."` | Show the agent's reply in the existing browser chat before polling again.                                                                                                                                                              |
| `canvas-flow poll`        | `--timeout-ms <ms>`   | Test/debug escape hatch only; agents should normally omit it and leave the long poll running.                                                                                                                                          |
| `canvas-flow stop`        | `--port <port>`       | Shut down a server running on a non-default port.                                                                                                                                                                                      |
| `canvas-flow server`      | `--verbose`           | Log session and watcher events to stderr; can also be enabled with `CANVAS_FLOW_DEBUG=1`. Detached server output is appended to `~/.canvas-flow/server.log` (or `CANVAS_FLOW_STATE_DIR/server.log`) for startup and crash diagnostics. |

## Development

```sh
pnpm run check          # Run all verification commands
pnpm run build          # Bundle the publishable CLI, chrome, and design assets
pnpm run build:skill    # Regenerate the installable canvasflow skill
pnpm test               # Run node:test tests
pnpm run lint           # Run ESLint
pnpm run format:check   # Check Prettier formatting
pnpm run typecheck      # Run TypeScript checkJs validation
```
