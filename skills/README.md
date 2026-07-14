# Claude Code Skills

Shared Claude Code skills for the VEuPathDB web-monorepo team.

## Installing a skill

Copy the skill directory to your local Claude skills folder:

```bash
cp -r skills/ui-mockup-planner ~/.claude/skills/
```

Then restart Claude Code (or run `/reload-plugins` if already running).

## Skills

### `ui-mockup-planner`

Turns implementation plans and feature specs into ChatGPT-ready prompt packages for generating UI mockup images. Useful for preparing visuals for UX discussion meetings or presentations.

Workflow: Claude reads the plan → finds existing UI to screenshot → writes per-frame prompt files → you paste them into ChatGPT one at a time → Claude reviews the returned images.

Invoke by mentioning "mockup", "wireframe", or "let's do the mockups for this".
