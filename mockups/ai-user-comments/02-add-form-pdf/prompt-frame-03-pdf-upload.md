# Frame 03 — Add form: PDF upload (initial state)

## Reference images

Two images are uploaded in this chat — use both as style references for all frames in this session:

- `mockup-frame-01-pubmed-input.png` — provides the full page layout, chrome, form styles, button styles, and example data (this is a single-column layout)
- `mockup-breadcrumb-design.png` — provides the exact breadcrumb trail style

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `mockup-frame-01-pubmed-input.png` exactly.

Key style notes:

- **Chrome**: Deep maroon/burgundy top nav bar, PlasmoDB logo top-left, light grey secondary bar below
- **Page heading**: `AI-assisted comment for gene PF3D7_0315200` — same position and style as in the reference
- **Single-column layout**: no left sidebar; content sits directly below the page heading and breadcrumb
- **Breadcrumb trail**: use the style from `mockup-breadcrumb-design.png`; step 1 is active (see below)
- **Buttons**: solid teal/green primary, white outlined secondary

## Content

Same page heading ("AI-assisted comment for gene PF3D7_0315200") and breadcrumb with step 1 (Publication source) active, with the following changes from the PubMed variant:

- **Source radio group**: "Upload PDF" is now selected, "PubMed ID" is unselected
  - ○ PubMed ID
  - ● Upload PDF
- **PubMed ID field is gone** — replaced by the PDF upload section (see below)

### PDF upload section (replaces the PubMed ID field)

**File picker row** (label left, control right):

- Label: `PDF file`
- Control: file-input button labelled `Choose file` (grey outlined button) with the text `No file chosen` beside it, scoped to `.pdf` files

**Privacy notice** — a visually distinct notice box directly below the file picker (light yellow or light blue background, thin border, small info icon on the left):

> Your PDF is processed entirely in your browser — only the extracted text is sent to our servers, never the file itself. For provenance, optionally add a public link to the publication below.

**Optional link fields** (label left, field right, below the notice):

- Label: `Publication URL` — empty text input, placeholder `https://biorxiv.org/…`
- Label: `Link text` — empty text input, placeholder `e.g. Smith et al. 2024 (bioRxiv)`

**Submit button**:

- Label: `Generate AI comment`
- State: **disabled** — muted grey fill, no file chosen yet
- Small text: `Submitting will create a draft comment for your review`

## Annotations

- ① **File picker** — Accepts a PDF file; the file is held in memory for the job only and is never persisted on the server
- ② **Privacy notice** — Explains the transient nature of the upload and prompts the user to add a public URL for provenance
- ③ **Publication URL / Link text** — Optional fields; if provided they are stored in `aiProvenance` and displayed in the review form so readers can trace the source
- ④ **Generate AI comment** — Disabled until a PDF is chosen

Save as: `mockup-frame-03-pdf-upload.png`
