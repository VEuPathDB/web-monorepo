# Frame 05 — Add form: progress / polling view (mid-job)

## Reference images

Two images are uploaded in this chat — use both as style references for all frames in this session:

- `mockup-frame-02-pubmed-preview.png` — provides the full page layout, chrome, form styles, button styles, and example data
- `mockup-breadcrumb-design.png` — provides the exact breadcrumb trail style

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `mockup-frame-02-pubmed-preview.png` exactly.

Key style notes:

- **Chrome**: Deep maroon/burgundy top nav bar, PlasmoDB logo top-left, light grey secondary bar below
- **Page heading**: `AI-assisted comment for gene PF3D7_0315200` — same position and style as in the reference
- **Single-column layout**: no left sidebar; content sits directly below the page heading and breadcrumb
- **IMPORTANT — ignore the left panel**: if the reference shows a left-hand navigation panel, do NOT reproduce it. The layout is single-column with a breadcrumb trail at the top.
- **Buttons**: solid teal/green primary, white outlined secondary

## Breadcrumb trail

Step 2 is now active. Step 1 is complete (full opacity, mid-grey circle, normal weight label). Step 3 is still future (faded, ~45% opacity). Match the styling from `mockup-breadcrumb-design.png` Row 2 exactly:

- ① Publication source — mid-grey circle, normal weight, full opacity (completed)
- → mid-grey arrow
- ② **Generating comment** — deep maroon circle, **bold** label, full opacity (active)
- → mid-grey arrow
- ③ Review & publish — faded, ~45% opacity (future)

## Content — Progress view

The input form is gone entirely. The content pane (below the breadcrumb) now shows a progress view with three parts:

**1. Submission summary** — a compact read-only box at the top, light grey background, small text, rounded corners:

> PubMed ID: 38429021 · Gene: PF3D7_0315200

**2. Stage checklist** — a vertical list of pipeline stages. Each row has an icon on the left and a stage label on the right. The current stage also shows a smaller italic message line below its label:

| Icon                    | Stage label            | Detail text                                                                                        |
| ----------------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| ✓ green tick            | Fetching article       | (done — muted grey text)                                                                           |
| ✓ green tick            | Fetching gene synonyms | (done — muted grey text)                                                                           |
| ✓ green tick            | Scanning gene mentions | (done — muted grey text)                                                                           |
| ⟳ animated blue spinner | **Generating summary** | `Summarising PF3D7_0315200 function from article text…` (italic, dark text, slightly smaller font) |
| ○ grey circle           | Persisting             | (pending — grey text, ~50% opacity)                                                                |

**3. Footer row** below the checklist:

- Left: small grey text — `Running for 28 seconds`
- Right: `Cancel` button — white background, grey border, dark text (outlined/secondary style)

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line, purple rounded-rectangle callout bubble.

- ① **Breadcrumb advances to step 2** — automatically on job submit; the user cannot click back to step 1
- ② **Submission summary** — read-only reminder of what was submitted
- ③ **Current stage + live message** — the back end returns a human-readable message string for the active stage; shown here in italic below the stage label
- ④ **Pending stages** — greyed until reached; only stages relevant to the submitted options appear
- ⑤ **Cancel** — fires a DELETE to the back end; UI waits for the next poll to confirm before showing the cancelled state

Save as: `mockup-frame-05-progress.png`
