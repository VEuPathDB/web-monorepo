---
name: ui-mockup-planner
description: Creates ChatGPT-ready mockup prompt packages from implementation plans or feature specs. Use this skill whenever the user wants to turn a plan, spec, or design document into UI mockup images for a presentation or slide deck — especially when they mention "mockup", "wireframe", "screenshots for ChatGPT", "mockup prompt", or want to visualise a feature before it's built. Also trigger when the user says things like "let's do the mockups for this" or "what would this look like as a screen". The skill guides a structured workflow: Claude explores the codebase to find the best screenshots to take, the user takes those screenshots, and Claude writes precise per-frame prompt files that the user pastes into ChatGPT to generate polished PNG mockups.
---

# UI Mockup Planner

You bridge the gap between a written implementation plan and visual mockup images. Claude's role is to understand the codebase and write precise, context-aware image-generation prompts. ChatGPT's role is to actually produce the images — it's excellent at reproducing UI style from reference screenshots.

The output of each mockup group is a folder containing reference screenshots and a set of per-frame prompt files, which the user pastes into a ChatGPT session one at a time.

## The workflow at a glance

1. **Identify mockup groups** from the plan
2. **Pick a group** to work on
3. **Find existing UI** in the codebase to use as style reference
4. **Agree on output directory**
5. **Tell the user what to screenshot** (and what to name the files)
6. **Read the screenshots**, then **generate all frame prompts** for the group in one go
7. **User reviews prompts** in their editor; iterate with Claude until satisfied
8. **ChatGPT session**: upload base images, then paste frame prompts one at a time
9. **After frame-01**: Claude reviews remaining prompts against the returned image; adjust if needed
10. **Continue frame-by-frame** until the group is done
11. **Iterate** with `v2` prompt files if needed

---

## Step 1: Identify mockup groups

Read the plan. Extract each distinct UI state or flow that needs a visual. For each, note:

- A short screen name
- Where it sits in the user flow
- The key UI elements visible

Present these as a numbered list. Suggest a natural order (usually the user flow order) and ask which group to start with. For example (these are illustrative, not literal — extract the actual groups from the plan at hand):

```
Mockup groups I see in this plan:

1. Add form — input mode (source radio, PMID / PDF fields, option checkboxes)
2. Add form — progress view (stage checklist, cancel button, elapsed time)
3. Review/edit form (provenance panel, review-level selector, editable content)

Suggest starting with #1. Want to go in that order, or start somewhere else?
```

---

## Step 2: Explore the codebase for UI starting points

For the chosen mockup group, search the codebase for:

- Existing pages or components with similar layout (forms, modals, multi-step flows)
- The closest page the user can navigate to right now in their browser

Read the relevant component files to understand what the page actually looks like — nav structure, heading style, form layout conventions. This informs how specific you can be in the ChatGPT prompts.

If there's no close analogue, find _any_ page that has the right outer chrome (navigation sidebar, header, footer). The user can blank irrelevant page content with browser devtools (`element.style.visibility='hidden'` or similar) before screenshotting, leaving just the chrome as the style shell.

Tell the user what you found and why it's a good starting point.

---

## Step 3: Agree on output directory

Propose a directory based on the plan file's location:

```
mockups/<feature-name>/<NN>-<short-group-name>/
```

For example: `mockups/ai-user-comments/01-add-form-input/`

State the suggestion clearly and wait for the user to approve or propose an alternative. Create the directory once agreed.

---

## Step 4: Tell the user what to screenshot

Be specific:

- **URL to navigate to**
- **Page state** (which tab, which form option selected, what to type to get a realistic-looking state)
- **Filename** for each screenshot (e.g. `base-form.png`)
- Whether to hide anything with devtools first

Full-page screenshots including all browser chrome are the default — no cropping needed.

Where possible, choose reference screenshots that can be **reused across multiple mockup groups** — this is the main lever for visual consistency across the full set. Encourage the user to take one good base screenshot early on and reuse it rather than taking fresh ones for each group.

Wait for the user to confirm the screenshots are saved before continuing.

---

## Step 5: Read screenshots and generate all frame prompts

Read each screenshot. Look for:

- Color scheme, font style, component conventions
- Navigation structure (enumerate existing nav items precisely so you can describe additions or replacements accurately)
- Form layout patterns (label position, field width, button placement)

Then, **in one thinking pass**, plan and write all frame prompt files for this group. Doing this in one go produces more consistent prompts — you can think through the full sequence of deltas, annotation numbering, and cross-frame references coherently.

### File naming

| File type            | Pattern                        | Example                              |
| -------------------- | ------------------------------ | ------------------------------------ |
| Reference screenshot | `base-<slug>.png`              | `base-form.png`                      |
| Frame prompt         | `prompt-frame-NN-<slug>.md`    | `prompt-frame-01-pubmed-input.md`    |
| Generated mockup     | `mockup-frame-NN-<slug>.png`   | `mockup-frame-01-pubmed-input.png`   |
| Revised prompt       | `prompt-frame-NN-<slug>-v2.md` | `prompt-frame-01-pubmed-input-v2.md` |

### Frame prompt structure

**Frame 01** carries the full style guide. Subsequent frames are concise — they describe only the delta from what's already established in the ChatGPT session.

**`prompt-frame-01-<slug>.md`:**

```markdown
# Frame 01 — [descriptive name]

## Reference image

`base-form.png` is uploaded in this chat — use it as the style reference for all frames in this session.

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `base-form.png` exactly. These screenshots are from a real production application — reproduce their look and feel faithfully.

Key style notes:

- [Specific observation from the screenshot, e.g. "White content area, clean sans-serif font"]
- [Another, e.g. "Buttons: solid teal for primary action, outlined for secondary"]
- [etc.]

## What to create

[Full description of the frame — heading, layout, all UI elements, realistic example data]

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line, purple rounded-rectangle callout bubble.

- ① **[Label]** — [explanation]
- ② **[Label]** — [explanation]

Save as: `mockup-frame-01-<slug>.png`
```

**`prompt-frame-02-<slug>.md` and beyond:**

```markdown
# Frame 02 — [descriptive name]

Continue with the same PlasmoDB chrome and style established in the previous frame.

**Base**: this frame shows the same form as `mockup-frame-01-<slug>.png` with the following changes:

- [Delta 1 — e.g. "Upload PDF radio button is now selected instead of PubMed ID"]
- [Delta 2]

## Annotations

- ① **[Label]** — [explanation]
- ② **[Label]** — [explanation]

Save as: `mockup-frame-02-<slug>.png`
```

### Writing instructions ChatGPT will act on

ChatGPT is very capable at UI mockup generation — the more specific you are, the better the output. Be precise about:

- **Exact text** for headings, labels, buttons, placeholder values
- **Enabled/disabled/loading states** for interactive elements
- **Conditional content** (sections that appear or disappear)
- **Realistic example data** (real-looking gene IDs, PubMed IDs, filenames, dates)
- **Layout changes** — new sections, removed sections, reordered elements

### When to use annotations vs when to add a new frame

Use Figma-style annotations freely for:

- Behaviors triggered by interaction ("button shows spinner on click")
- Conditional visibility ("this section only appears when Upload PDF is selected")
- Validation states ("red border and error text appear here on invalid input")

Add a new numbered frame when the visual change is substantial enough that annotation alone would be confusing or cluttered.

---

## Step 6: User reviews prompts in their editor

Once all frame prompts are written, give a brief **prompt review summary**: one short paragraph covering what the group shows across its frames, followed by any specific decision points the user should resolve before sending to ChatGPT. Focus on genuine choices or ambiguities — things where you left a decision open, or where ChatGPT's interpretation could go either way. Keep it practical, not exhaustive.

Good examples of decision points to flag:

- A color or style choice you left underspecified ("I left the notice box as 'light yellow or light blue' — worth deciding before generating")
- An annotation that could be read two ways
- A layout detail that depends on a design preference you don't have a clear answer for

Then tell the user:

> Open them in your editor and let me know if anything needs adjusting before we move to ChatGPT.

**Do not proceed to the ChatGPT session until the user confirms the prompts look good.** This is the right moment to refine wording, add or remove annotations, or rethink the frame breakdown — editing a markdown file is cheap; regenerating images is not.

---

## Step 7: ChatGPT session

Tell the user:

> **To generate the mockups (one frame at a time):**
>
> 1. Open a brand-new ChatGPT chat
> 2. Upload all base reference screenshots (`base-*.png`) at the start of the session
> 3. Open `prompt-frame-01-<slug>.md` in your editor, copy the contents, and paste into ChatGPT
> 4. Review the result. Regenerate in the same chat for a stochastic alternative if you want options.
> 5. Download the image and save it as `mockup-frame-01-<slug>.png` in `[directory]/`
> 6. Come back here so I can review it before you continue

**Important**: copy prompt contents from your editor or IDE, not from the Claude Code terminal — terminal rendering mangles indentation and formatting.

---

## Step 8: Review frame-01 and checkpoint remaining prompts

When the user shares frame-01's generated PNG, read it. Check:

- Does the layout match what was specified?
- Are all UI elements present and correctly labelled?
- Do the annotations appear in purple Figma style?
- Does the visual style match the reference screenshot?
- Is the example data realistic and legible?

Then do a quick scan of the remaining frame prompts and ask yourself: given what ChatGPT produced in frame-01, does anything in frame-02+ need adjusting? Common things to catch:

- A style detail that came out differently than expected — update the delta description to compensate
- An opportunity to reference the actual generated image by name in subsequent prompts (you can tell the user to also upload `mockup-frame-01-<slug>.png` to the ChatGPT session as an additional anchor for frame-02)

This checkpoint is lightweight and advisory — if frame-01 looks as expected, tell the user "looks good, carry on with frame-02" and they paste immediately.

---

## Step 9: Continue frame-by-frame

For each subsequent frame:

1. User pastes `prompt-frame-NN-<slug>.md` into the same ChatGPT chat
2. User downloads and saves as `mockup-frame-NN-<slug>.png`
3. User lets Claude know; Claude reviews and either confirms or flags issues

---

## Step 10: Iterate with v2 prompts

If a frame needs rework, write `prompt-frame-NN-<slug>-v2.md` in the same directory.

For v2, use the existing generated mockup as the starting point rather than the original base screenshot — ChatGPT already matched the style; now it just needs to refine. Be explicit about what was wrong and what to change.

```markdown
# Frame 01 — [name] (v2)

**Base**: use `mockup-frame-01-<slug>.png` as your starting point (upload this alongside the base screenshots if starting a new chat).

**Issue with current version**: [e.g. "The stage checklist items are too small to read at presentation size"]

**Fix**: [e.g. "Increase the font size of checklist items so each label is clearly legible; keep everything else identical"]

Save as: `mockup-frame-01-<slug>.png` (replacing the previous version)
```

Note: ChatGPT regenerates the whole image — it doesn't do surgical edits. For UX discussion mockups, the result is good enough.

If the same type of correction keeps recurring, flag this pattern to the user — it's a signal to update the skill's prompting guidance.

---

## Moving to the next group

When a group is done, list the mockups directory to see what's been completed and what remains:

> That's `NN-group-name` done. Remaining: `NN-group-name`, `NN-group-name`. Would you like to continue with the next group now? If the session context is getting long, it's fine to start a fresh Claude Code session — just point me at the plan file and the `mockups/` directory and I'll pick up where we left off.

Keep group directories numbered sequentially (`01-`, `02-`, etc.) to reflect the user flow order.

## Consistency across groups

Reuse the **same base screenshots** across multiple mockup groups wherever possible — this is the primary lever for visual consistency. If all ChatGPT sessions reference the same reference images, the style stays coherent across the full mockup set.
