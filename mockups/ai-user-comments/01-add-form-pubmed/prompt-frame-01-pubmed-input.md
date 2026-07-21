# Frame 01 — Add form: PubMed input (initial state)

## Reference images

Two images are uploaded in this chat — use both as style references for all frames in this session:

- `base-profile-page.png` — provides the PlasmoDB site chrome (top nav bar, logo, secondary bar, fonts, colours, form-field and button styles)
- `mockup-breadcrumb-design.png` — provides the exact breadcrumb trail style to use at the top of every frame

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `base-profile-page.png` exactly. These screenshots are from a real production application — reproduce their look and feel faithfully.

Key style notes:

- **Chrome**: Deep maroon/burgundy top navigation bar with white text links; PlasmoDB logo top-left with pink/magenta organism illustration; light grey secondary bar below
- **Page background**: White content area, clean sans-serif font throughout
- **IMPORTANT — ignore the left panel**: `base-profile-page.png` shows a left-hand profile navigation panel. **Do NOT include this panel.** The AI comment flow uses a single-column layout with a horizontal breadcrumb trail at the top instead (see below).
- **Form fields**: Light grey bordered rectangular text inputs, labels above or to the left
- **Primary button**: Solid teal/green fill with white text
- **Secondary button**: White background with grey outlined border

## Page layout

Single-column content area (no left sidebar). Structure from top to bottom:

1. **Page heading** — styled the same as "Account: Bob MacCallum" in the reference:

   > AI-assisted comment for gene PF3D7_0315200

2. **Breadcrumb trail** — immediately below the heading, styled exactly as shown in `mockup-breadcrumb-design.png` (Row 1 — Step 1 active):

   - ① **Publication source** — circle and label in deep maroon, label **bold**, full opacity (active)
   - → mid-grey arrow
   - ② Generating comment — faded, ~45% opacity
   - → faded arrow
   - ③ Review & publish — faded, ~45% opacity

3. **Form content** — below the breadcrumb (see below)

## Form content

**Sub-heading**: "Publication details" (bold section label)

**Source radio group** (two inline radio buttons):

- ● PubMed ID
- ○ Upload PDF

**PubMed ID input row**:

- Label: `PubMed ID`
- Input: empty text field, placeholder `e.g. 38429021`
- Below input: small grey hint text — `Enter a PubMed ID to look up the publication`

**Submit button** (left-aligned, below the PubMed field):

- Label: `Generate AI comment`
- State: **disabled** — muted grey fill, no PMID entered yet
- Small text beside or below: `Submitting will create a draft comment for your review`

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line to a purple rounded-rectangle callout bubble with white text.

- ① **Breadcrumb trail** — Step 1 "Publication source" is bold and active; steps 2 and 3 are grayed out to show the user's position in the flow
- ② **Source selector** — Radio group to choose between a PubMed ID or a PDF upload; selecting "Upload PDF" replaces the PMID field with a file picker
- ③ **PubMed ID field** — Accepts a numeric PubMed ID; once a valid ID is entered an inline metadata preview will appear confirming the publication
- ④ **Generate AI comment** — Disabled until a PMID is entered; submitting kicks off an async job and advances the breadcrumb to step 2

Save as: `mockup-frame-01-pubmed-input.png`
