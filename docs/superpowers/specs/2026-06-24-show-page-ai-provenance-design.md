# Design: Modernise `/user-comments/show` with cards + AI provenance

**Date:** 2026-06-24
**Branch:** feature-ai-user-comments
**Status:** Approved (design); ready for implementation plan

## Context

The AI-assisted user-comments feature (see `CLAUDE-plan-ai-user-comments-front-end.md`)
adds a new kind of published comment: an AI-generated gene-publication summary whose
provenance is recorded in an `aiProvenance` field on the comment record. The
`/user-comments/show` page does not currently render that provenance at all — the
field is loaded but ignored.

This spec covers modernising that show page so it:

1. makes clear which comments have AI provenance, and
2. surfaces the key provenance information for AI comments.

This is the "Show page modernisation" follow-up that was explicitly deferred in the
front-end plan. We are taking it up now at full scope: a **card layout** with a
**unified list + filter chips**, not the lighter in-place option.

## Data available on a loaded comment

From `types/userCommentTypes.ts`:

```ts
// On UserCommentGetResponse:
aiProvenance?: AiProvenance;          // present only on AI-assisted comments
pubMedRefs: PubmedPreview;            // rich entries (id, title, journal, author, url) — human path
// plus digitalObjectIds[], genBankAccessions[], relatedStableIds[], categories[],
//      attachments, location, externalDatabase, author, commentDate, reviewStatus, headline, content

export interface AiProvenance {
  isEdited: boolean;
  source: AiProvenanceSource;
  originalHeadline: string;
  originalContent: string;
}

export type AiProvenanceSource =
  | { kind: 'pubmed'; pubmedId: string }
  | { kind: 'upload'; externalUrl?: string; externalTitle?: string; pdfContentSha256?: string };
```

Key fact: a normal comment's `pubMedRefs` are rich `PubmedPreviewEntry` objects
(title/journal/author/url), but an AI comment's `aiProvenance.source.pubmedId` is a
**bare id string** with no preview metadata. The AI path does not populate the regular
`pubMedRefs` field.

Every published AI comment carries genuine AI-generated `originalContent` (the
`mentioned-in-passing` / `gene-not-mentioned` paths no longer ask the user to write a
comment from scratch, so they do not produce published comments). This removes the
need for any "AI-flow but human-written" special case.

## Component architecture

Today the rendering path is:
`UserCommentShowController` builds a `formGroupFields` (label/field rows) structure →
`UserCommentShowView` → `FormBody` → `FormGroup` (per comment) → `FormRow` (per field).

New structure:

```
UserCommentShowController     (keeps data loading; drops formGroupFields;
                               adds filter state; passes comment objects down)
  └─ UserCommentShowView      (renders chips + a list of cards)
       ├─ CommentFilterChips  (All / User-generated / AI-assisted, with counts)
       └─ UserCommentCard     (one per comment; branches on aiProvenance)
            ├─ AiProvenanceBanner  (only when aiProvenance != null)
            │    └─ LazyPubmedPreview  (pubmed source only; viewport-gated fetch)
            └─ CommentReferences   (PMIDs, DOIs, GenBank, related genes, attachments,
                                    categories — each row rendered only when present)
```

`UserCommentShowController` retains its existing data loading. It stops producing the
row structure and instead passes whole comment objects and the active filter down to
the view. It does **not** fetch PMID previews — that is delegated to
`LazyPubmedPreview` (see "AI-PMID preview: viewport-gated" below).

### New / changed files

| Action  | Path                                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| modify  | `controllers/UserCommentShowController.tsx` — drop `formGroupFields`; add filter state; pass comments down (no preview fetch) |
| rewrite | `components/userComments/UserCommentShow/UserCommentShowView.tsx` — chips + card list                                         |
| create  | `components/userComments/UserCommentShow/UserCommentCard.tsx`                                                                 |
| create  | `components/userComments/UserCommentShow/AiProvenanceBanner.tsx`                                                              |
| create  | `components/userComments/UserCommentShow/CommentReferences.tsx`                                                               |
| create  | `components/userComments/UserCommentShow/CommentFilterChips.tsx`                                                              |
| create  | `components/userComments/UserCommentShow/LazyPubmedPreview.tsx`                                                               |
| create  | `components/userComments/UserCommentShow/useIntersectionObserver.ts` (native `IntersectionObserver` hook, no new dependency)  |

All paths under
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/`.

## The card

We do **not** use CoreUI `Card`'s built-in coloured header bar for every comment: a
themed title bar per comment is visually loud for a stack of comments, and `Card`
requires an explicit `height` (its content pane is `overflowY: auto`), which fights
variable-length comment bodies.

Instead, `UserCommentCard` is a lightweight wrapper that **borrows `Card`'s style
tokens** — `1px solid gray[400]` border, **7px border radius** (matching `Banner`),
neutral background — and lays out flow content with no fixed height.

Card body, top → bottom:

1. **Header row**: headline (bold) + a small teal **"AI-assisted" pill** (mirroring
   the Beta pill from the add flow) when `aiProvenance != null`; author + date on the
   right.
2. **`AiProvenanceBanner`** (AI cards only) — see below.
3. **Content**: `white-space: pre-wrap`, as today. (Markdown rendering remains a
   separate follow-up.)
4. **`CommentReferences`**: compact rows, each rendered only when it has data — no
   more empty "GenBank Accessions:" rows. Full legacy reference set is preserved:
   PMIDs, DOIs, GenBank accessions, related genes, attachments, categories, location,
   external database, status.

## AI-PMID preview: viewport-gated (the load-bearing detail)

A normal comment arrives with rich `pubMedRefs` (`PubmedPreviewEntry[]`) already in the
GET payload — **no fetch needed**. An AI comment carries only a bare
`aiProvenance.source.pubmedId`, so to render it like a normal PMID we must call the
existing `getPubmedPreview` service.

`getPubmedPreview` hits **our backend** (`/cgi-bin/pmid2json`), which in turn talks to
NCBI. Eager-fetching every AI comment's preview on page load would load both servers
unnecessarily. So the fetch is **viewport-gated**:

- `LazyPubmedPreview({ pubmedId })` is a self-contained component. It attaches a ref to
  its root and uses `useIntersectionObserver` to detect the first time it scrolls into
  the viewport, then fetches `getPubmedPreview([Number(pubmedId)])` **once** and
  disconnects the observer.
- While idle / pending / on failure it renders a **bare PMID link**
  (`https://pubmed.ncbi.nlm.nih.gov/{id}`) — note `PubmedIdEntry` cannot render from a
  bare id (it requires the full preview fields), so the fallback is a small synthesized
  anchor, not `PubmedIdEntry`.
- Once the preview resolves it renders the full `PubmedIdEntry`.

`useIntersectionObserver` is a new ~15-line native-`IntersectionObserver` hook
(fetch-once semantics, cleanup on unmount); **no new dependency** is added
(`react-cool-dimensions` is ResizeObserver-based and unsuitable, and adding a dep
incurs the repo's supply-chain gate). The hook file must carry a comment noting
`react-cool-inview` (same author as the already-present `react-cool-dimensions`) as a
ready drop-in replacement should the hand-rolled observer prove troublesome.

No shared/dedup cache for now (YAGNI): distinct AI comments on a gene cite distinct
papers, so duplicate PMIDs across cards are rare. A shared preview cache is an easy
later addition if a gene ever accumulates many AI comments citing the same PMID.

This is the only new asynchronous work introduced by this feature, and it now scales
with what the user actually scrolls past, not with how many comments exist.

> Cleaner long-term alternative (out of FE scope): the backend could include the PMID
> title/preview in `aiProvenance` when serving the comment (or store it at publish
> time), eliminating the FE fetch entirely. Noted as a possible follow-up; not pursued
> here since it requires a backend change.

## `AiProvenanceBanner`

Built on CoreUI `Banner`, `type: 'info'`, not intense:

- **message**: disclosure + status.
  - Disclosure: "AI-assisted summary, generated from the source below."
  - Edited/as-is indicator from `aiProvenance.isEdited`: "Published as generated"
    (`false`) or "Edited by the author" (`true`).
- **source** (from `aiProvenance.source`):
  - `kind: 'pubmed'` → `<LazyPubmedPreview pubmedId={...} />` (viewport-gated; bare
    link until the preview resolves).
  - `kind: 'upload'` → the `externalUrl` / `externalTitle` link, with graceful
    fallback "User-uploaded PDF — not publicly available" when no link was given,
    plus the existing "processed in the author's browser — file not stored" note.
- **`CollapsibleContent`** (Banner's built-in collapsible): when
  `aiProvenance.isEdited === true`, show the original `originalHeadline` /
  `originalContent` under a "Show original AI-generated text" toggle. Omitted when not
  edited (the published text equals the original).

`pdfContentSha256` is **not** surfaced to readers.

## Filter chips & empty states

`CommentFilterChips` renders `All (5) · User-generated (3) · AI-assisted (2)`,
defaulting to **All**. Filtering is client-side over the already-loaded comments
(partition on `aiProvenance != null`). Each filter has its own empty state, e.g.
"No AI-assisted comments for this gene yet."

## Edge cases

- **Upload with no link**: fallback copy "User-uploaded PDF — not publicly available".
- **`pdfContentSha256`**: never shown to readers.
- **AI-PMID preview pending/failed/not-yet-scrolled-into-view**: bare synthesized PMID
  link fallback (`https://pubmed.ncbi.nlm.nih.gov/{id}`).

## Conventions

- Follow repo import style: regular imports, not `import type`.
- Emotion `css` styling, consistent with `Card` / `Banner`.
- Reuse without modification: `PubmedIdEntry` (PMID chip), `getPubmedPreview`
  (service), CoreUI `Banner`, CoreUI colour definitions (`gray`, etc.).

## Verification

1. `yarn workspace @veupathdb/genomics-site compile:check` type-checks cleanly.
2. Dev server checks:
   - **Human-only gene**: page looks ~unchanged; all reference types present render
     correctly (DOI, GenBank, related genes, attachments, categories, location,
     external db, status); empty reference rows are omitted.
   - **AI-pubmed comment**: "AI-assisted" pill shows; banner renders; the PMID renders
     with title via the fetched preview (and degrades to a bare link if the fetch
     fails).
   - **Viewport-gating**: with an AI-pubmed comment below the fold, confirm (DevTools →
     Network) that **no** `pmid2json` request fires until the card scrolls into view,
     then exactly one fires; scrolling away and back does not refetch.
   - **Edited AI comment** (`isEdited === true`): banner shows "Edited by the author"
     and the collapsible "Show original AI-generated text" reveals
     `originalHeadline`/`originalContent`.
   - **As-is AI comment** (`isEdited === false`): banner shows "Published as
     generated"; no collapsible.
   - **Upload AI comment** with and without `externalUrl`: link vs. fallback copy; the
     "file not stored" note appears; no SHA shown.
   - **Filter chips**: counts correct; switching All / User-generated / AI-assisted
     filters the list; per-filter empty states render.
3. Regression: legacy non-AI comments unaffected; all existing reference types still
   render.
