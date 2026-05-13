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
- **Buttons**: solid teal/green primary, white outlined secondary

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

### Provenance panel (read-only)

A compact read-only card below the breadcrumb, labelled "Source publication" (bold section header above the card). Uses the same two-column grid chip style as the PubMed metadata preview in the reference:

| Label   | Value                                                                                        |
| ------- | -------------------------------------------------------------------------------------------- |
| PMID    | `38429021` (blue underlined link)                                                            |
| Title   | `A Plasmodium falciparum kinase required for gametocyte development and blood-stage fitness` |
| Author  | `Chauhan M et al.`                                                                           |
| Journal | `Nature Communications, 2024`                                                                |

### Review level

A radio group directly below the provenance panel, labelled "Review level" (bold section label):

- ● Unreviewed ○ Reviewed ○ Edited

"Unreviewed" is selected (the default when the comment first arrives from the AI pipeline).

Small italic hint text below the radio group:

> Editing the comment content below will automatically set this to "Edited".

### Headline

Label: `Headline` (bold, left-aligned)
Text input field (single line, full width), pre-filled with:

> `PfCDPK1 is required for gametocyte development and asexual blood-stage fitness in P. falciparum`

### Comment content

Label: `Content` (bold, left-aligned)
Large text area (full width, ~8 lines tall), pre-filled with:

> `This study demonstrates that PF3D7_0315200 (PfCDPK1), a calcium-dependent protein kinase, plays essential roles in both asexual blood-stage proliferation and sexual differentiation in Plasmodium falciparum. Conditional knockdown of PfCDPK1 significantly impaired parasite growth and blocked gametocyte development, indicating that this kinase is required at multiple life-cycle stages. PfCDPK1 phosphorylates key substrates involved in calcium signalling cascades, and its kinase activity is indispensable for these functions. Its plant-like kinase domain has no close human ortholog, positioning PfCDPK1 as a potential drug target.`

### Action buttons

Two buttons below the content textarea, left-aligned:

- `Publish comment` — primary button, **disabled and visually greyed out** (not teal) because review level is "Unreviewed". Small hint below: `Set review level to "Reviewed" or "Edited" to publish.`
- `Keep as draft` — white outlined secondary button, always enabled

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line, purple rounded-rectangle callout bubble.

- ① **Breadcrumb at step 3** — advances to "Review & publish" when the user lands here after the redirect from the add form; both prior steps shown as completed (grey circles)
- ② **Provenance panel** — read-only; records the source publication that the AI used; stored in `aiProvenance` and always visible to the reviewer
- ③ **Review level** — must be set to "Reviewed" or "Edited" before publishing; unreviewed comments are never shown to other users
- ④ **AI-generated content** — fully editable; the user is expected to review, correct, and refine before publishing; editing the textarea auto-bumps review level to "Edited"
- ⑤ **Publish comment disabled** — greyed out while review level is "Unreviewed"; becomes active once the user sets a non-unreviewed level
- ⑥ **Keep as draft** — always enabled escape hatch; saves the current state without publishing

Save as: `mockup-frame-08-review-edit.png`
