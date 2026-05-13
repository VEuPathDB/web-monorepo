# Frame 08 — AI comment review & edit form

## Reference images

Two images are uploaded in this chat — use both as style references for this session:

- `mockup-frame-02-pubmed-preview.png` — provides the full page layout, chrome, form styles, button styles, and example data
- `mockup-breadcrumb-design.png` — provides the exact breadcrumb trail style

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `mockup-frame-02-pubmed-preview.png` exactly.

Key style notes:

- **Chrome**: Deep maroon/burgundy top nav bar, PlasmoDB logo top-left, light grey secondary bar below
- **Single-column layout**: no left sidebar; content sits directly below the page heading and breadcrumb
- **IMPORTANT — ignore the left panel**: if the reference shows a left-hand navigation panel, do NOT reproduce it. The layout is single-column with a horizontal breadcrumb trail at the top.
- **Provenance chip**: use the same two-column grid chip style as the PubMed metadata preview in `mockup-frame-02-pubmed-preview.png`
- **Primary button**: solid teal/green fill with white text
- **Secondary button**: white background with grey outlined border
- **Danger button**: red or dark red fill with white text (for the Delete action)

## Page heading

> Review AI-assisted comment for gene PF3D7_0315200

(Same position and style as "AI-assisted comment for gene PF3D7_0315200" in the reference.)

## Breadcrumb trail

All three steps are present; step 3 is active. Match `mockup-breadcrumb-design.png` Row 3 exactly:

- ① Publication source — mid-grey circle, normal weight, full opacity (completed)
- → mid-grey arrow
- ② Generating comment — mid-grey circle, normal weight, full opacity (completed)
- → mid-grey arrow
- ③ **Review & publish** — deep maroon circle, **bold** label, full opacity (active)

## Content — Review & edit form

Layout top to bottom, in this exact order:

### 1. Provenance panel (read-only)

A compact read-only card, labelled "Source publication" (bold section header above the card). Two-column grid chip style matching the PubMed metadata preview:

| Label   | Value                                                                                        |
| ------- | -------------------------------------------------------------------------------------------- |
| PMID    | `38429021` (blue underlined link)                                                            |
| Title   | `A Plasmodium falciparum kinase required for gametocyte development and blood-stage fitness` |
| Author  | `Chauhan M et al.`                                                                           |
| Journal | `Nature Communications, 2024`                                                                |

### 2. Headline

Label: `Headline` (bold, left-aligned)
Text input field (single line, full width), pre-filled with:

> `PfCDPK1 is required for gametocyte development and asexual blood-stage fitness in P. falciparum`

### 3. Comment content

Label: `Content` (bold, left-aligned)
Large text area (full width, ~8 lines tall), pre-filled with:

> `This study demonstrates that PF3D7_0315200 (PfCDPK1), a calcium-dependent protein kinase, plays essential roles in both asexual blood-stage proliferation and sexual differentiation in Plasmodium falciparum. Conditional knockdown of PfCDPK1 significantly impaired parasite growth and blocked gametocyte development, indicating that this kinase is required at multiple life-cycle stages. PfCDPK1 phosphorylates key substrates involved in calcium signalling cascades, and its kinase activity is indispensable for these functions. Its plant-like kinase domain has no close human ortholog, positioning PfCDPK1 as a potential drug target.`

### 4. Encouragement copy

Small italic grey text directly below the content textarea:

> Please review the AI-generated content above and edit as needed before publishing.

### 5. Restore original button

A white outlined secondary button, below the encouragement copy, left-aligned:

- Label: `Restore original`
- State: **disabled** (greyed out) — shown in this initial state because the fields have not yet been edited
- Tooltip or small text beside it: `Resets headline and content to the original AI-generated text`

### 6. Confirmation checkbox

A single checkbox with a label, below the restore button. A small gap above to visually separate it from the restore action:

☐ **I have reviewed this content and it is appropriate for public release.**

The checkbox is **unchecked** in this initial state.

### 7. Action buttons

Two buttons below the checkbox, left-aligned, with a small gap between them:

- `Publish comment` — primary button, **disabled and visually greyed out** (not teal) because the confirmation checkbox is unchecked. Small hint text below: `Check the box above to confirm your review before publishing.`
- `Delete comment` — danger button (red or dark red fill, white text), right-aligned or below the publish button. Opens a confirmation dialog before acting.

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line, purple rounded-rectangle callout bubble.

- ① **Breadcrumb at step 3** — advances to "Review & publish" when the user lands here after the redirect from the add form; both prior steps shown as completed (grey circles)
- ② **Provenance panel** — read-only; always visible so the reviewer knows which publication sourced the AI output
- ③ **Editable content** — the user is expected to review and refine the AI-generated headline and content before publishing
- ④ **Restore original** — disabled until the user makes an edit; resets both fields to the AI-generated originals stored in `aiProvenance`
- ⑤ **Confirmation checkbox** — must be checked before the publish button activates; replaces the old review-level radio group
- ⑥ **Publish disabled** — greyed out until the checkbox is checked; the back end automatically records whether the content was edited or left unchanged
- ⑦ **Delete comment** — discards the draft entirely; triggers a "Are you sure?" confirmation dialog before acting

Save as: `mockup-frame-08-review-edit.png`
