import { createHomeOutput } from "./cli.js";
import { PLAYBOOK_ROUTER_HELP } from "./playbooks.js";

// Trigger string Claude Code (and other agents) match against to auto-load the skill.
// Kept terse and outcome-focused so it fires on "about to show something visual" intents.
export const SKILL_DESCRIPTION =
  "Turn complex or visual agent responses into rich, reviewable HTML artifacts the user can " +
  "annotate and send feedback on, using the canvas-flow CLI. Use when about to give a plan, " +
  "comparison, diagram, table, code diff, report, or anything easier to grasp visually than as prose.";

function bullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function playbookList(playbooks) {
  return playbooks.map((p) => `- \`${p.id}\` - ${p.use_when}`).join("\n");
}

function skillCommandText(text) {
  return text.replaceAll("`canvas-flow", "`npx -y @menukfernandoo/canvas-flow");
}

/**
 * Render the installable SKILL.md for the canvasflow skill. The body mirrors what
 * `canvas-flow` prints with no arguments (minus live session state), while the
 * frontmatter adds discovery metadata for Agent Skills and Hermes Agent.
 *
 * @returns {string} full SKILL.md contents including YAML frontmatter
 */
export function createSkillMarkdown() {
  const home = createHomeOutput({ bin: "canvas-flow", sessions: [], includeSessions: false });

  return `---
name: canvasflow
description: ${SKILL_DESCRIPTION}
argument-hint: <what the artifact should show>
author: Menuk Fernando (fernandomenuk)
metadata:
  hermes:
    tags: [html, review, artifacts, visualization]
    category: productivity
---

# Canvas Flow

${skillCommandText(home.description)}

You do not need canvas-flow installed globally - invoke it with \`npx -y @menukfernandoo/canvas-flow <html-file>\`.
If canvas-flow output shows a follow-up command starting with \`canvas-flow\`, run it as \`npx -y @menukfernandoo/canvas-flow ...\` instead.

## Request

$ARGUMENTS

If the request above is non-empty, the user invoked \`/canvasflow\` explicitly - build an HTML artifact for that request now, following the workflow below.
If it is empty, infer what to visualize from the conversation.

## When to use

${home.help[home.help.length - 1]}

## Workflow

1. Create the HTML artifact (default location \`.canvasflow/<name>.html\` in the working directory).
2. Run \`npx -y @menukfernandoo/canvas-flow <html-file>\` to open or resume a review session in the browser.
3. Run \`npx -y @menukfernandoo/canvas-flow poll <html-file>\` to long-poll for the user's annotations, queued prompts, and browser-reported \`layout_warnings\`.
   The poll stays silent until the user acts or the real browser reports fresh layout warnings - leave it running, never kill it.
   If your harness limits how long a foreground command may run, run the poll as a background task; if it gets killed or times out anyway, just re-run it - queued feedback is never lost.
4. If poll returns \`layout_warnings\`, follow the returned \`next_step\`: fix and re-check fresh error-severity findings, but proceed with a note instead of looping when every current warning is persistent or low-severity.
5. Apply human feedback, then poll again with \`--agent-reply "<message>"\` to reply in the browser and keep the loop going.
6. Run \`npx -y @menukfernandoo/canvas-flow end <html-file>\` when the review is finished.
7. If the user ends the session from the browser instead, \`npx -y @menukfernandoo/canvas-flow <html-file>\` refuses to reopen it and says so - only pass \`--reopen\` when the user asks for further review or something genuinely important needs their visual attention. Otherwise deliver remaining updates directly in this conversation.

## Visual guidance

${bullets(home.visual_guidance)}

## Playbooks

Run \`npx -y @menukfernandoo/canvas-flow playbook <id>\` for focused, detailed guidance on any of these.
${PLAYBOOK_ROUTER_HELP}
For flows, architecture, state, or sequence diagrams, do not hand-build boxes-and-arrows from div/flexbox; open the diagram playbook and use Mermaid unless SVG is needed for richly annotated nodes.

${playbookList(home.playbooks)}

## Commands & rules

${bullets(home.help.map(skillCommandText))}
`;
}
