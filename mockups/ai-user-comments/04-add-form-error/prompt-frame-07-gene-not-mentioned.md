# Frame 07 — Add form: terminal error (gene not mentioned)

Continue with the same PlasmoDB chrome, page heading, and two-column layout established in the previous frames.

**Base**: same as `mockup-frame-05-progress.png` — step 2 active in the sidebar, submission summary at the top — with the following changes:

### Left sidebar — Step navigation

Unchanged — step 2 (Generating comment) remains active. The error occurred during the job; the user has not advanced to step 3.

### Right column — Error view

**Stage checklist**: the job failed during "Scanning gene mentions". Show stages as:

| Icon          | Stage label                                  |
| ------------- | -------------------------------------------- |
| ✓ green tick  | Fetching article                             |
| ✓ green tick  | Fetching gene synonyms                       |
| ✗ red cross   | Scanning gene mentions                       |
| ○ grey circle | Generating summary (pending — never reached) |
| ○ grey circle | Validating (pending — never reached)         |
| ○ grey circle | Creating comment (pending — never reached)   |

**Error message box** — directly below the checklist. Light red/pink background, thin red border, warning icon on the left:

> **Gene not mentioned in this article**
>
> Neither PF3D7_0315200 nor any of its known synonyms were found in the article text. Synonyms checked: PfCDPK1, calcium-dependent protein kinase 1, CDPK1, PF3D7_0315200.
>
> Please try a different publication that discusses this gene's function.

**Action buttons** below the error box (left-aligned):

- `Try a different publication` — solid teal/green primary button; clears the job and returns to the input form with the previous values preserved so the user can enter a new PMID or PDF
- `Back to gene page` — white outlined secondary button; navigates the user back to the gene record page they came from

## Annotations

- ① **Failed stage** — red cross marks exactly where the pipeline stopped; stages after it remain greyed/pending
- ② **Synonyms listed** — the error message shows every alias that was checked, helping the user understand why the match failed and which publication to try instead
- ③ **Try a different publication** — resets phase to idle and returns to the input form; the gene ID (from the URL) is unchanged, only the publication field needs updating
- ④ **Back to gene page** — escape hatch for users who decide not to proceed at all

Save as: `mockup-frame-07-gene-not-mentioned.png`
