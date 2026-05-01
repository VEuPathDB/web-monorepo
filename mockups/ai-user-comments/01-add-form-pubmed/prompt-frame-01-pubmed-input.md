# Frame 01 — Add form: PubMed input (initial state)

## Reference image

`base-profile-page.png` is uploaded in this chat — use it as the style reference for all frames in this session.

## Style guide

Match the visual style, fonts, colors, spacing, and UI component style shown in `base-profile-page.png` exactly. These screenshots are from a real production application — reproduce their look and feel faithfully.

Key style notes:

- **Chrome**: Deep maroon/burgundy top navigation bar with white text links (My Strategies, Searches, Tools, My Workspace, Data, About, Help, Subscriptions, Contact Us); PlasmoDB logo top-left with pink/magenta organism illustration; light grey secondary bar below with a teal "My Organism Preferences" link on the right
- **Page background**: White content area, clean sans-serif font throughout
- **Left step sidebar**: White background, ~250px wide; nav items are a small icon + label in a grid row; the active item has a solid light blue (#d5eaf5) background fill with rounded corners; future/inactive items are plain text, slightly muted
- **Form fields**: Light grey bordered rectangular text inputs, labels to the left or above in a consistent grid
- **Primary button**: Solid teal/green fill with white text (like the "Save" button in the reference)
- **Secondary button**: White background with grey/outlined border

## Page layout

Reproduce the **two-column flex layout** from the reference screenshot (the same pattern as the profile page):

- **Left column** (~250px wide): step navigation sidebar (described below)
- **Right column** (flex: 1, white content area): the add form

**Page heading** sits above the two columns — styled the same as "Account: Bob MacCallum" in the reference:

> AI-assisted comment for gene PF3D7_0315200

### Left sidebar — Step navigation

Three steps, styled exactly like the profile page sidebar (icon + label text, rounded items, active = light blue fill). The sidebar is a read-only progress indicator — no hover states needed.

| Step | Icon                    | Label              | State                                                                 |
| ---- | ----------------------- | ------------------ | --------------------------------------------------------------------- |
| 1    | book icon               | Publication source | **Active** — solid light blue (#d5eaf5) background fill, full opacity |
| 2    | hourglass or clock icon | Generating comment | Future — greyed out, opacity ~0.45                                    |
| 3    | checkmark-circle icon   | Review & publish   | Future — greyed out, opacity ~0.45                                    |

### Right column — Form content

**Sub-heading**: "Publication details" (bold section label, styled like the "Contact" / "Information" headers in the reference)

**Source radio group** (two inline radio buttons with labels, a little margin below):

- ● PubMed ID
- ○ Upload PDF

**PubMed ID input row** (label left, field right — matching the label/field grid in the reference):

- Label: `PubMed ID`
- Input: empty text field, placeholder text `e.g. 38429021`
- Below the input field: small grey hint text — `Enter a PubMed ID to look up the publication`

**Options section** (below the PubMed field, with a thin divider or small gap):

- Bold label: "Options"
- ☐ Generate product description
- ☑ Validate output ← checked (ticked checkbox)

**Submit button** (left-aligned, below the checkboxes):

- Label: `Generate AI comment`
- State: **disabled** — muted grey fill (not teal), because no PMID has been entered yet
- Small text beside or below: `Submitting will create a draft comment for your review`

## Annotations

Figma-style: purple-filled circle with white number label, thin connecting line to a purple rounded-rectangle callout bubble with white text.

- ① **Source selector** — Radio group to choose between a PubMed ID or a PDF upload; selecting "Upload PDF" replaces the PMID field with a file picker
- ② **PubMed ID field** — Accepts a numeric PubMed ID; once a valid ID is entered an inline metadata preview will appear confirming the publication
- ③ **Validate output** — On by default; adds an LLM validation step to the back-end pipeline before the draft comment is created
- ④ **Generate AI comment** — Disabled until a PMID is entered; submitting kicks off an async job and advances the sidebar to step 2

Save as: `mockup-frame-01-pubmed-input.png`
