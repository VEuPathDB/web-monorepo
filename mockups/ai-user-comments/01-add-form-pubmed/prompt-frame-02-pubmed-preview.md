# Frame 02 — Add form: PubMed input with metadata preview

Continue with the same PlasmoDB chrome, page heading, and layout established in frame 01.

**Base**: same as `mockup-frame-01-pubmed-input.png` with the following changes:

- **PubMed ID field**: now contains the value `38429021`
- **Metadata preview chip** appears directly below the PubMed ID field — a compact card with a two-column grid layout (grey-background narrow label column on the left ~10 characters wide, white value column on the right). Thin bottom borders between each row. Rows:
  - PMID | `38429021` (rendered as a blue underlined link)
  - Title | `A Plasmodium falciparum kinase required for gametocyte development and blood-stage fitness`
  - Author | `Chauhan M et al.`
  - Journal | `Nature Communications, 2024`
- **Generate AI comment** button is now **enabled** — full solid teal/green fill with white text

The breadcrumb (step 1 active) and everything else are identical to frame 01.

## Annotations

- ① **Metadata preview chip** — Appears automatically once a valid PMID is entered; confirms the user has the right publication before they submit the job
- ② **Enabled submit** — Now fully active in teal; clicking will POST the job to the back end and write `&jobId=…` into the URL so a page refresh can resume polling

Save as: `mockup-frame-02-pubmed-preview.png`
