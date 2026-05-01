# Frame 03 — Add form: PDF upload (initial state)

Continue with the same PlasmoDB chrome, page heading, and two-column layout established in the previous frames.

**Base**: same as `mockup-frame-01-pubmed-input.png` — same page heading ("AI-assisted comment for gene PF3D7_0315200"), same step sidebar with step 1 (Publication source) active — with the following changes:

- **Source radio group**: "Upload PDF" is now selected, "PubMed ID" is unselected
  - ○ PubMed ID
  - ● Upload PDF
- **PubMed ID field is gone** — replaced by the PDF upload section (see below)

### PDF upload section (replaces the PubMed ID field)

**File picker row** (label left, control right, matching the label/field grid):

- Label: `PDF file`
- Control: a file-input button labelled `Choose file` (grey outlined button style) with the text `No file chosen` beside it, scoped to `.pdf` files

**Privacy notice** — a visually distinct notice box directly below the file picker (light blue background, thin border, small info icon on the left):

> This PDF will be sent to our AI service for analysis only and will not be stored. For provenance, optionally add a public link to the publication below.

**Optional link fields** (label left, field right, below the notice):

- Label: `Publication URL` — empty text input, placeholder `https://biorxiv.org/…` (optional, greyed placeholder)
- Label: `Link text` — empty text input, placeholder `e.g. Smith et al. 2024 (bioRxiv)` (optional, greyed placeholder)

**Options section** (identical to frame 01):

- ☐ Generate product description
- ☑ Validate output

**Submit button**:

- Label: `Generate AI comment`
- State: **disabled** — muted grey fill, because no file has been chosen yet
- Small text: `Submitting will create a draft comment for your review`

## Annotations

- ① **File picker** — Accepts a PDF file; the file is held in memory for the job only and is never persisted on the server
- ② **Privacy notice** — Explains the transient nature of the upload and prompts the user to add a public URL for provenance
- ③ **Publication URL / Link text** — Optional fields; if provided they are stored in `aiProvenance` and displayed in the review form so readers can trace the source
- ④ **Generate AI comment** — Disabled until a PDF is chosen

Save as: `mockup-frame-03-pdf-upload.png`
