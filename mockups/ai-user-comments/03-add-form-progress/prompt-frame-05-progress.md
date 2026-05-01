# Frame 05 — Add form: progress / polling view (mid-job)

## Reference image

`mockup-frame-02-pubmed-preview.png` is uploaded in this chat — use it as the style reference for all frames in this session.

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `mockup-frame-02-pubmed-preview.png` exactly.

Key style notes:

- **Chrome**: Deep maroon/burgundy top nav bar, PlasmoDB logo top-left, light grey secondary bar below
- **Page heading**: `AI-assisted comment for gene PF3D7_0315200` — same position and style as in the reference
- **Two-column layout**: left step navigation sidebar (~250px), right content area (flex: 1), matching the reference exactly
- **Sidebar items**: icon + label rows, active item has solid light blue (#d5eaf5) rounded fill
- **Buttons**: solid teal/green primary, white outlined secondary (both colours visible in the reference)

## Left sidebar — Step navigation

Step 2 is now active. Step 1 is complete (full opacity, no highlight). Step 3 is still future (greyed, opacity ~0.45):

| Step | Icon                  | Label              | State                                                   |
| ---- | --------------------- | ------------------ | ------------------------------------------------------- |
| 1    | book icon             | Publication source | Complete — full opacity, plain styling, no background   |
| 2    | hourglass icon        | Generating comment | **Active** — solid light blue (#d5eaf5) background fill |
| 3    | checkmark-circle icon | Review & publish   | Future — greyed out, opacity ~0.45                      |

## Right column — Progress view

The input form is gone entirely. The content pane now shows a progress view with three parts:

**1. Submission summary** — a compact read-only box at the top, light grey background, small text, rounded corners:

> PubMed ID: 38429021 · Gene: PF3D7_0315200 · Validate output: on

**2. Stage checklist** — a vertical list of pipeline stages. Each row has an icon on the left and a stage label on the right. The current stage also shows a smaller italic message line below its label:

| Icon                    | Stage label            | Detail text                                                                                        |
| ----------------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| ✓ green tick            | Fetching article       | (done — muted grey text)                                                                           |
| ✓ green tick            | Fetching gene synonyms | (done — muted grey text)                                                                           |
| ✓ green tick            | Scanning gene mentions | (done — muted grey text)                                                                           |
| ⟳ animated blue spinner | **Generating summary** | `Summarising PF3D7_0315200 function from article text…` (italic, dark text, slightly smaller font) |
| ○ grey circle           | Validating             | (pending — grey text, opacity ~0.5)                                                                |
| ○ grey circle           | Creating comment       | (pending — grey text, opacity ~0.5)                                                                |

**3. Footer row** below the checklist:

- Left: small grey text — `Running for 28 seconds`
- Right: `Cancel` button — white background, grey border, dark text (outlined/secondary style)

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line, purple rounded-rectangle callout bubble.

- ① **Step 2 active** — sidebar advances automatically on job submit; the user cannot click back to step 1
- ② **Submission summary** — read-only reminder of what was submitted
- ③ **Current stage + live message** — the back end returns a human-readable message string for the active stage; shown here in italic below the stage label
- ④ **Pending stages** — greyed until reached; only stages relevant to the submitted options appear (e.g. "Validating" is present because "Validate output" was on)
- ⑤ **Cancel** — fires a DELETE to the back end; UI waits for the next poll to confirm before showing the cancelled state

Save as: `mockup-frame-05-progress.png`
