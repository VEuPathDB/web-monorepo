# Frame 08 — AI comment review & edit form

Continue with the same PlasmoDB chrome and two-column layout established in the previous frames. The style reference for this session is `mockup-frame-02-pubmed-preview.png` — match its fonts, colours, spacing, and component style exactly.

## Page heading

> Review AI-assisted comment for gene PF3D7_0315200

(Same position and style as "AI-assisted comment for gene PF3D7_0315200" in the reference — large H1 above the two-column layout.)

## Left sidebar — Step navigation

All three steps are now present; step 3 is active:

| Step | Icon                  | Label              | State                                                   |
| ---- | --------------------- | ------------------ | ------------------------------------------------------- |
| 1    | book icon             | Publication source | Complete — full opacity, plain styling, no background   |
| 2    | hourglass icon        | Generating comment | Complete — full opacity, plain styling, no background   |
| 3    | checkmark-circle icon | Review & publish   | **Active** — solid light blue (#d5eaf5) background fill |

## Right column — Review & edit form

### Provenance panel (read-only)

A compact read-only card at the top of the content area, labelled "Source publication". Uses the same two-column grid chip style as the PubMed metadata preview in `mockup-frame-02-pubmed-preview.png` (grey label column ~10ch wide, white value column, thin bottom borders between rows, subtle outer border):

| Label   | Value                                                                                        |
| ------- | -------------------------------------------------------------------------------------------- |
| PMID    | `38429021` (blue underlined link)                                                            |
| Title   | `A Plasmodium falciparum kinase required for gametocyte development and blood-stage fitness` |
| Author  | `Chauhan M et al.`                                                                           |
| Journal | `Nature Communications, 2024`                                                                |

Small grey label above the card: "Source publication" (bold, like a section header).

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

- `Publish comment` — primary button, **disabled and visually greyed out** (not teal) because review level is currently "Unreviewed". Show a small hint below the button: `Set review level to "Reviewed" or "Edited" to publish.`
- `Keep as draft` — white outlined secondary button, always enabled; saves the comment without publishing it

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line, purple rounded-rectangle callout bubble.

- ① **Step 3 active** — the sidebar advances to "Review & publish" when the user lands on this page after the redirect from the add form
- ② **Provenance panel** — read-only; records the source publication that the AI used; stored in `aiProvenance` and always visible to the reviewer
- ③ **Review level** — must be set to "Reviewed" or "Edited" before publishing; unreviewed comments are never shown to other users
- ④ **AI-generated content** — fully editable; the user is expected to review, correct, and refine before publishing; editing the textarea auto-bumps review level to "Edited"
- ⑤ **Publish comment disabled** — greyed out while review level is "Unreviewed"; becomes active once the user sets a non-unreviewed level
- ⑥ **Keep as draft** — always enabled escape hatch; saves the current state without publishing (TODO: a "Delete comment" button should also be offered here — deferred pending back-end delete endpoint)

Save as: `mockup-frame-08-review-edit.png`
