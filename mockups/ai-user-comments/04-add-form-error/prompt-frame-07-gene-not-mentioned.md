# Frame 07 — Add form: terminal error (gene not mentioned)

## Reference images

Two images are uploaded in this chat — use both as style references for this session:

- `mockup-frame-05-progress.png` — provides the page layout, chrome, progress checklist style, and submission summary style
- `mockup-breadcrumb-design.png` — provides the exact breadcrumb trail style

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `mockup-frame-05-progress.png` exactly.

Key style notes:

- **Chrome**: Deep maroon/burgundy top nav bar, PlasmoDB logo top-left, light grey secondary bar below
- **Page heading**: `AI-assisted comment for gene PF3D7_0315200`
- **Single-column layout**: no left sidebar; breadcrumb sits directly below the page heading
- **Buttons**: solid teal/green primary, white outlined secondary

## Content

Same as `mockup-frame-05-progress.png` — step 2 active in the breadcrumb, submission summary at the top — with the following changes:

### Breadcrumb trail

Unchanged — step 2 (Generating comment) remains active. The error occurred during the job; the user has not advanced to step 3.

### Content — Error view

**Stage checklist**: the job failed during "Scanning gene mentions". Show stages as:

| Icon          | Stage label                                  |
| ------------- | -------------------------------------------- |
| ✓ green tick  | Fetching article                             |
| ✓ green tick  | Fetching gene synonyms                       |
| ✗ red cross   | Scanning gene mentions                       |
| ○ grey circle | Generating summary (pending — never reached) |
| ○ grey circle | Persisting (pending — never reached)         |

**Error message box** — directly below the checklist. Light red/pink background, thin red border, warning icon on the left:

> **Gene not mentioned in this article**
>
> Neither PF3D7_0315200 nor any of its known synonyms were found in the article text. Synonyms checked: PfCDPK1, calcium-dependent protein kinase 1, CDPK1, PF3D7_0315200.
>
> Please try a different publication that discusses this gene's function.

**Action buttons** below the error box (left-aligned):

- `Try a different publication` — solid teal/green primary button; clears the job and returns to the input form with the previous values preserved
- `Back to gene page` — white outlined secondary button; navigates the user back to the gene record page

## Annotations

- ① **Failed stage** — red cross marks exactly where the pipeline stopped; stages after it remain greyed/pending
- ② **Synonyms listed** — the error message shows every alias that was checked, helping the user understand why the match failed and which publication to try instead
- ③ **Try a different publication** — resets breadcrumb to step 1 and returns to the input form; the gene ID (from the URL) is unchanged, only the publication field needs updating
- ④ **Back to gene page** — escape hatch for users who decide not to proceed at all

Save as: `mockup-frame-07-gene-not-mentioned.png`
