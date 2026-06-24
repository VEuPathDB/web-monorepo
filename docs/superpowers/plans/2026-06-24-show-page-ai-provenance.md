# Show-page AI Provenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernise `/user-comments/show` into a card-based, filterable list that clearly marks AI-assisted comments and surfaces their provenance (source, edited/as-is status, original AI text), fetching PMID previews only when a card scrolls into view.

**Architecture:** Replace the generic `FormBody`-driven row renderer with a small component tree: the controller passes raw comment objects to a rewritten `UserCommentShowView`, which holds client-side filter state and renders one `UserCommentCard` per comment. AI cards add an `AiProvenanceBanner` (built on CoreUI `Banner`) whose PubMed source is rendered by a viewport-gated `LazyPubmedPreview`.

**Tech Stack:** React + TypeScript, Redux/reselect (existing controller), CoreUI `Banner` + colour definitions, native `IntersectionObserver`, WDK service via `WdkDependenciesContext`.

## Global Constraints

- **No test harness exists** in `@veupathdb/genomics-site` (no jest/testing-library, no `test` target). Standing one up is out of scope. The per-task gate is therefore `yarn workspace @veupathdb/genomics-site compile:check` (runs `tsc --noEmit`) plus, for the integration task, the manual dev-server verification in Task 7. "Expected: PASS" below means: no _new_ type errors referencing this task's files.
- **Import style:** regular imports only — never `import type` (repo convention).
- **No new dependencies.** Use native `IntersectionObserver`. (`react-cool-inview` is noted in-code as a drop-in fallback but is NOT added.)
- **CoreUI import paths (exact):** `import Banner from '@veupathdb/coreui/lib/components/banners/Banner';` and `import { gray } from '@veupathdb/coreui/lib/definitions/colors';`.
- **All new files live in** `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/`.
- **Commit after each task.** Branch is `feature-ai-user-comments`; do not switch branches.
- **Do not** delete `FormBody`/`FormRow`/`PubmedIdEntry`/`UserCommentUploadedFiles` — they remain in use elsewhere.

---

## File structure

| Action  | Path (under `.../js/client/`)                                        | Responsibility                                                                                                                                            |
| ------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| create  | `components/userComments/UserCommentShow/useIntersectionObserver.ts` | Native IO hook: fire once when an element first enters the viewport                                                                                       |
| create  | `components/userComments/UserCommentShow/LazyPubmedPreview.tsx`      | Render a bare `pubmedId` as a full citation, fetching the preview only when scrolled into view                                                            |
| create  | `components/userComments/UserCommentShow/AiProvenanceBanner.tsx`     | Provenance banner: disclosure, edited/as-is, source, collapsible original AI text                                                                         |
| create  | `components/userComments/UserCommentShow/CommentReferences.tsx`      | Render a comment's reference fields (PMIDs, DOIs, GenBank, related genes, categories, location, attachments, external DB, status), each only when present |
| create  | `components/userComments/UserCommentShow/CommentFilterChips.tsx`     | All / User-generated / AI-assisted filter chips with counts                                                                                               |
| create  | `components/userComments/UserCommentShow/UserCommentCard.tsx`        | One comment as a card; header + AI pill + banner + content + references + meta                                                                            |
| rewrite | `components/userComments/UserCommentShow/UserCommentShowView.tsx`    | Chips + filtered list of cards; holds filter state; keeps scroll-to-initialComment                                                                        |
| modify  | `controllers/UserCommentShowController.tsx`                          | Drop `formGroupFields/Headers/Order`; pass raw comments + userId + webAppUrl + deleteUserComment                                                          |

---

### Task 1: `useIntersectionObserver` hook

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/useIntersectionObserver.ts`

**Interfaces:**

- Produces: `useIntersectionObserver<T extends Element>(rootMargin?: string): [React.RefObject<T>, boolean]` — attach the returned ref to an element; the boolean flips to `true` once (and stays `true`) when the element first enters the viewport.

- [ ] **Step 1: Create the hook file**

```tsx
import React, { useEffect, useRef, useState } from 'react';

/**
 * Fire once when the element first scrolls into view, then stop observing.
 * Hand-rolled to avoid adding a dependency.
 *
 * If this ever proves troublesome (browser quirks, testing, etc.),
 * `react-cool-inview` — by the same author as the `react-cool-dimensions`
 * already used in this repo — is a drop-in replacement:
 *   const { observe, inView } = useInView({ unobserveOnEnter: true });
 */
export function useIntersectionObserver<T extends Element>(
  rootMargin: string = '200px'
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node == null || hasIntersected) return;

    // Fail open where IntersectionObserver is unavailable, so dependent
    // content still loads rather than never appearing.
    if (typeof IntersectionObserver === 'undefined') {
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasIntersected, rootMargin]);

  return [ref, hasIntersected];
}
```

- [ ] **Step 2: Type-check**

Run: `yarn workspace @veupathdb/genomics-site compile:check`
Expected: PASS (no new errors referencing `useIntersectionObserver.ts`).

- [ ] **Step 3: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/useIntersectionObserver.ts
git commit -m "feat(user-comments): add viewport intersection hook for lazy PMID previews"
```

---

### Task 2: `LazyPubmedPreview`

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/LazyPubmedPreview.tsx`

**Interfaces:**

- Consumes: `useIntersectionObserver` (Task 1); `service.getPubmedPreview(pubMedIds: number[]): Promise<PubmedPreview>` via `GenomicsService`; `PubmedIdEntry`.
- Produces: `LazyPubmedPreview({ pubmedId: string }): JSX.Element`.

- [ ] **Step 1: Create the component**

```tsx
import React, { useEffect, useState } from 'react';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { GenomicsService } from '../../../wrapWdkService';
import { PubmedPreviewEntry } from '../../../types/userCommentTypes';
import { PubmedIdEntry } from '../UserCommentForm/PubmedIdEntry';
import { useIntersectionObserver } from './useIntersectionObserver';

interface Props {
  pubmedId: string;
}

/**
 * Renders an AI comment's bare `pubmedId` as a full PubMed citation, but only
 * fetches the preview metadata once the component scrolls into view — keeping
 * load off our `/cgi-bin/pmid2json` endpoint (and NCBI) for comments the user
 * never scrolls to. Falls back to a bare PubMed link until the preview resolves.
 */
export function LazyPubmedPreview({ pubmedId }: Props): JSX.Element {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const service = wdkService as GenomicsService;
  const [ref, hasIntersected] = useIntersectionObserver<HTMLDivElement>();
  const [preview, setPreview] = useState<PubmedPreviewEntry | undefined>(
    undefined
  );

  useEffect(() => {
    if (!hasIntersected || preview != null) return;
    let cancelled = false;
    service
      .getPubmedPreview([Number(pubmedId)])
      .then((entries) => {
        if (!cancelled && entries.length > 0) setPreview(entries[0]);
      })
      .catch(() => {
        /* leave the bare-link fallback in place on failure */
      });
    return () => {
      cancelled = true;
    };
  }, [hasIntersected, preview, pubmedId, service]);

  return (
    <div ref={ref}>
      {preview ? (
        <PubmedIdEntry
          id={preview.id}
          title={preview.title}
          author={preview.author}
          journal={preview.journal}
          url={preview.url}
        />
      ) : (
        <div style={{ fontSize: '14px' }}>
          PubMed ID:{' '}
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pubmedId}
          </a>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `yarn workspace @veupathdb/genomics-site compile:check`
Expected: PASS. (If `GenomicsService` or `getPubmedPreview` fails to resolve, confirm the relative path `../../../wrapWdkService` against `controllers/AiGenePublicationAddController.tsx`'s `../wrapWdkService` import.)

- [ ] **Step 3: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/LazyPubmedPreview.tsx
git commit -m "feat(user-comments): viewport-gated PubMed preview for AI comment sources"
```

---

### Task 3: `AiProvenanceBanner`

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/AiProvenanceBanner.tsx`

**Interfaces:**

- Consumes: CoreUI `Banner`; `AiProvenance` type; `LazyPubmedPreview` (Task 2).
- Produces: `AiProvenanceBanner({ aiProvenance: AiProvenance }): JSX.Element`.

Notes: the original AI text is passed via Banner's `additionalMessage` (not `CollapsibleContent`) so the banner keeps its 7px radius; `additionalMessage` only renders the "Show more" control when present, so as-is comments get no toggle. No `onClose`/`pinned` is passed, so there is no close button.

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { AiProvenance } from '../../../types/userCommentTypes';
import { LazyPubmedPreview } from './LazyPubmedPreview';

const GREY = '#888';

interface Props {
  aiProvenance: AiProvenance;
}

function Source({ source }: { source: AiProvenance['source'] }) {
  if (source.kind === 'pubmed') {
    return <LazyPubmedPreview pubmedId={source.pubmedId} />;
  }
  // kind === 'upload'
  return (
    <div>
      {source.externalUrl ? (
        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
          <a
            href={source.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.externalTitle || source.externalUrl}
          </a>
        </div>
      ) : (
        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
          User-uploaded PDF — not publicly available
        </div>
      )}
      <div style={{ color: GREY, fontSize: '13px', fontStyle: 'italic' }}>
        (uploaded PDF, processed in the author's browser — file not stored)
      </div>
    </div>
  );
}

/**
 * Provenance banner at the top of an AI-assisted comment card. Discloses the
 * AI origin, whether the author edited the AI text, the source publication,
 * and — for edited comments — a collapsible view of the original AI text.
 */
export function AiProvenanceBanner({ aiProvenance }: Props): JSX.Element {
  const { isEdited, source, originalHeadline, originalContent } = aiProvenance;

  const message = (
    <div>
      <div style={{ fontWeight: 600 }}>
        AI-assisted summary, generated from the source below.
      </div>
      <div style={{ fontSize: '13px', marginTop: '2px' }}>
        {isEdited ? 'Edited by the author.' : 'Published as generated.'}
      </div>
      <div style={{ marginTop: '8px' }}>
        <Source source={source} />
      </div>
    </div>
  );

  const additionalMessage = isEdited ? (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>
        Original AI-generated headline
      </div>
      <div style={{ marginBottom: '8px' }}>{originalHeadline}</div>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>
        Original AI-generated content
      </div>
      <div style={{ whiteSpace: 'pre-wrap', maxWidth: '80ch' }}>
        {originalContent}
      </div>
    </div>
  ) : undefined;

  return (
    <Banner
      banner={{
        type: 'info',
        message,
        additionalMessage,
        showMoreLinkText: 'Show original AI-generated text',
        showLessLinkText: 'Hide original AI-generated text',
      }}
    />
  );
}
```

- [ ] **Step 2: Type-check**

Run: `yarn workspace @veupathdb/genomics-site compile:check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/AiProvenanceBanner.tsx
git commit -m "feat(user-comments): AI provenance banner with collapsible original text"
```

---

### Task 4: `CommentReferences`

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/CommentReferences.tsx`

**Interfaces:**

- Consumes: `Link` (wdk-client); `PubmedIdEntry`; `UserCommentUploadedFiles` (sibling in `UserCommentShow/`); `UserCommentGetResponse` type.
- Produces: `CommentReferences({ comment: UserCommentGetResponse; webAppUrl: string }): JSX.Element`.

These rows are lifted verbatim from the current controller's field list (`UserCommentShowController.tsx:236-358`), now rendered only when the field has data.

- [ ] **Step 1: Create the component**

```tsx
import React, { ReactNode } from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { UserCommentGetResponse } from '../../../types/userCommentTypes';
import { PubmedIdEntry } from '../UserCommentForm/PubmedIdEntry';
import { UserCommentUploadedFiles } from './UserCommentUploadedFiles';

interface Props {
  comment: UserCommentGetResponse;
  webAppUrl: string;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontWeight: 600, fontSize: '13px' }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export function CommentReferences({ comment, webAppUrl }: Props): JSX.Element {
  return (
    <>
      {comment.pubMedRefs.length > 0 && (
        <Row label="PMID(s)">
          {comment.pubMedRefs.map((ref) => (
            <PubmedIdEntry key={ref.id} {...ref} />
          ))}
        </Row>
      )}
      {comment.digitalObjectIds.length > 0 && (
        <Row label="Digital Object Identifier (DOI) Name(s)">
          {comment.digitalObjectIds.map((doi) => (
            <a
              key={doi}
              href={`http://dx.doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {doi}{' '}
            </a>
          ))}
        </Row>
      )}
      {comment.genBankAccessions.length > 0 && (
        <Row label="GenBank Accessions">
          {comment.genBankAccessions.map((accession) => (
            <a
              key={accession}
              href={`http://www.ncbi.nlm.nih.gov/sites/entrez?db=nuccore&cmd=&term=${accession}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {accession}{' '}
            </a>
          ))}
        </Row>
      )}
      {comment.relatedStableIds.length > 0 && (
        <Row label="Other Related Genes">
          {comment.relatedStableIds.map((stableId) =>
            comment.target.type === 'gene' ? (
              <Link key={stableId} to={`/record/gene/${stableId}`}>
                {stableId}{' '}
              </Link>
            ) : comment.target.type === 'isolate' ? (
              <Link key={stableId} to={`/record/popsetSequence/${stableId}`}>
                {stableId}{' '}
              </Link>
            ) : null
          )}
        </Row>
      )}
      {comment.categories.length > 0 && (
        <Row label="Category">
          {comment.categories.map((category, i) => (
            <div key={category}>
              {i + 1}) {category}
            </div>
          ))}
        </Row>
      )}
      {comment.location && comment.location.ranges.length > 0 && (
        <Row label="Location">
          {comment.location.coordinateType}:{' '}
          {comment.location.ranges
            .map(({ start, end }) => `${start}-${end}`)
            .join(', ')}
          {comment.location.reverse && ' (reversed)'}
        </Row>
      )}
      {comment.attachments.length > 0 && (
        <Row label="Uploaded Files">
          <UserCommentUploadedFiles
            uploadedFiles={comment.attachments.map((attachment) => ({
              ...attachment,
              url: `${webAppUrl}/service/user-comments/${comment.id}/attachments/${attachment.id}`,
            }))}
          />
        </Row>
      )}
      {comment.externalDatabase && (
        <Row label="External Database">
          {comment.externalDatabase.name} {comment.externalDatabase.version}
        </Row>
      )}
      {comment.reviewStatus === 'accepted' && (
        <Row label="Status">
          <em>included in the Annotation Center's official annotation</em>
        </Row>
      )}
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `yarn workspace @veupathdb/genomics-site compile:check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/CommentReferences.tsx
git commit -m "feat(user-comments): extract per-comment references renderer"
```

---

### Task 5: `CommentFilterChips`

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/CommentFilterChips.tsx`

**Interfaces:**

- Consumes: `gray` colour definitions.
- Produces: `type CommentFilter = 'all' | 'user' | 'ai'`; `CommentFilterChips({ counts: { all: number; user: number; ai: number }; active: CommentFilter; onChange: (filter: CommentFilter) => void }): JSX.Element`.

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';

export type CommentFilter = 'all' | 'user' | 'ai';

interface Props {
  counts: { all: number; user: number; ai: number };
  active: CommentFilter;
  onChange: (filter: CommentFilter) => void;
}

const CHIPS: { key: CommentFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'user', label: 'User-generated' },
  { key: 'ai', label: 'AI-assisted' },
];

export function CommentFilterChips({
  counts,
  active,
  onChange,
}: Props): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {CHIPS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: '16px',
              border: `1px solid ${gray[400]}`,
              background: isActive ? gray[700] : 'white',
              color: isActive ? 'white' : gray[700],
              fontSize: '13px',
            }}
          >
            {label} ({counts[key]})
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `yarn workspace @veupathdb/genomics-site compile:check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/CommentFilterChips.tsx
git commit -m "feat(user-comments): comment filter chips (all / user / ai)"
```

---

### Task 6: `UserCommentCard`

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/UserCommentCard.tsx`

**Interfaces:**

- Consumes: `Link`; `gray`; `UserCommentGetResponse`; `AiProvenanceBanner` (Task 3); `CommentReferences` (Task 4).
- Produces: `UserCommentCard({ comment: UserCommentGetResponse; userId: number; webAppUrl: string; onDelete: (commentId: number) => void }): JSX.Element`.

Notes: the card root carries `id={comment.id}` so the view's scroll-to-`initialCommentId` (`querySelector("[id='…']")`) keeps working. `Comment Target` is intentionally dropped (redundant with the page heading). `additionalAuthors` is joined into the meta line (the original `<div>author</div>` literal was a pre-existing bug; fixed here).

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { UserCommentGetResponse } from '../../../types/userCommentTypes';
import { AiProvenanceBanner } from './AiProvenanceBanner';
import { CommentReferences } from './CommentReferences';

interface Props {
  comment: UserCommentGetResponse;
  userId: number;
  webAppUrl: string;
  onDelete: (commentId: number) => void;
}

const TEAL = '#117a8b';

export function UserCommentCard({
  comment,
  userId,
  webAppUrl,
  onDelete,
}: Props): JSX.Element {
  const isOwn = userId === comment.author.userId;
  const date = new Date(comment.commentDate).toLocaleDateString();

  return (
    <div
      id={`${comment.id}`}
      style={{
        border: `1px solid ${gray[400]}`,
        borderRadius: 7,
        padding: 16,
        marginBottom: 16,
        background: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0 }}>{comment.headline}</h3>
            {comment.aiProvenance != null && (
              <span
                style={{
                  background: TEAL,
                  color: 'white',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                AI-assisted
              </span>
            )}
          </div>
          <div style={{ color: gray[600], fontSize: '13px', marginTop: '4px' }}>
            {comment.author.firstName} {comment.author.lastName}
            {comment.author.organization
              ? `, ${comment.author.organization}`
              : ''} · {date}
          </div>
        </div>
        {isOwn && (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Link
              to={`/user-comments/edit?commentId=${comment.id}`}
              target="_blank"
            >
              [edit]
            </Link>{' '}
            <Link
              to={`/user-comments/delete?commentId=${comment.id}`}
              onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault();
                if (
                  confirm(
                    `Are you sure you wish to delete comment ${comment.id}?`
                  )
                ) {
                  onDelete(comment.id);
                }
              }}
            >
              [delete]
            </Link>
          </div>
        )}
      </div>

      {comment.aiProvenance != null && (
        <div style={{ marginTop: '12px' }}>
          <AiProvenanceBanner aiProvenance={comment.aiProvenance} />
        </div>
      )}

      <div
        style={{ whiteSpace: 'pre-wrap', maxWidth: '80ch', marginTop: '12px' }}
      >
        {comment.content}
      </div>

      <div style={{ marginTop: '12px' }}>
        <CommentReferences comment={comment} webAppUrl={webAppUrl} />
      </div>

      <div style={{ color: gray[500], fontSize: '12px', marginTop: '12px' }}>
        Comment #{comment.id}
        {comment.project.name
          ? ` · ${comment.project.name} ${comment.project.version}`
          : ''}
        {comment.organism ? ` · ${comment.organism}` : ''}
        {comment.additionalAuthors.length > 0
          ? ` · Other authors: ${comment.additionalAuthors.join(', ')}`
          : ''}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `yarn workspace @veupathdb/genomics-site compile:check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/UserCommentCard.tsx
git commit -m "feat(user-comments): card renderer with AI pill, provenance banner, references"
```

---

### Task 7: Wire the card list — rewrite view + update controller

This is the atomic integration: the view's prop contract changes, so the controller must change in the same commit to keep the build green and the page working. It ends with the full manual verification.

**Files:**

- Rewrite: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/UserCommentShowView.tsx`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/UserCommentShowController.tsx`

**Interfaces:**

- Consumes: `UserCommentCard` (Task 6); `CommentFilterChips` + `CommentFilter` (Task 5); `UserCommentGetResponse`.
- Produces (new `UserCommentShowViewProps`): `{ title: ReactNode; className?; headerClassName?; bodyClassName?; initialCommentId?; userComments: UserCommentGetResponse[]; userId: number; webAppUrl: string; deleteUserComment: (commentId: number) => void }`.

- [ ] **Step 1: Rewrite the view** — replace the entire contents of `UserCommentShowView.tsx` with:

```tsx
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { UserCommentGetResponse } from '../../../types/userCommentTypes';
import { UserCommentCard } from './UserCommentCard';
import { CommentFilterChips, CommentFilter } from './CommentFilterChips';

import './UserCommentShowView.scss';

export interface UserCommentShowViewProps {
  title: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  initialCommentId?: number;
  userComments: UserCommentGetResponse[];
  userId: number;
  webAppUrl: string;
  deleteUserComment: (commentId: number) => void;
}

export const UserCommentShowView: React.FunctionComponent<
  UserCommentShowViewProps
> = ({
  title,
  className,
  headerClassName,
  bodyClassName,
  initialCommentId,
  userComments,
  userId,
  webAppUrl,
  deleteUserComment,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<CommentFilter>('all');

  useEffect(() => {
    if (containerRef.current && initialCommentId) {
      const el = containerRef.current.querySelector(
        `[id='${initialCommentId}']`
      );
      if (el) el.scrollIntoView();
    }
  }, []);

  const aiComments = userComments.filter((c) => c.aiProvenance != null);
  const userGenerated = userComments.filter((c) => c.aiProvenance == null);
  const counts = {
    all: userComments.length,
    user: userGenerated.length,
    ai: aiComments.length,
  };

  const visible =
    filter === 'ai'
      ? aiComments
      : filter === 'user'
      ? userGenerated
      : userComments;

  return (
    <div className={className} ref={containerRef}>
      <div className={headerClassName}>{title}</div>
      <div className={bodyClassName}>
        {userComments.length > 0 && (
          <CommentFilterChips
            counts={counts}
            active={filter}
            onChange={setFilter}
          />
        )}
        {visible.length === 0 ? (
          filter === 'ai' ? (
            <p>No AI-assisted comments for this gene yet.</p>
          ) : filter === 'user' ? (
            <p>No user-generated comments for this gene yet.</p>
          ) : null
        ) : (
          visible.map((comment) => (
            <UserCommentCard
              key={comment.id}
              comment={comment}
              userId={userId}
              webAppUrl={webAppUrl}
              onDelete={deleteUserComment}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Update the controller** — three edits in `UserCommentShowController.tsx`:

(a) Remove the now-unused imports `PubmedIdEntry` and `UserCommentUploadedFiles` (lines 21–22). Keep all other imports (`Link`, `get`, `capitalize` are still used by the selectors/title).

(b) Replace the entire `mergeProps` function (currently `UserCommentShowController.tsx:162-432`) with:

```tsx
const mergeProps = (
  {
    documentTitle,
    userId,
    userComments,
    loading,
    title,
    webAppUrl,
  }: StateProps,
  { loadUserComments, deleteUserComment }: DispatchProps,
  { targetId, targetType, initialCommentId }: OwnProps
) => ({
  className: 'wdk-UserComments wdk-UserComments-Show',
  headerClassName: 'wdk-UserComments-Show-Header',
  bodyClassName: 'wdk-UserComments-Show-Body',
  documentTitle,
  title,
  userComments,
  userId,
  webAppUrl,
  initialCommentId,
  loading,
  loadUserComments,
  deleteUserComment,
  targetType,
  targetId,
});
```

(c) Replace the `MergedProps` type (`UserCommentShowController.tsx:45-52`) and `renderView` (`UserCommentShowController.tsx:453-465`) so `deleteUserComment` / `userId` / `webAppUrl` reach the view:

```tsx
type MergedProps = UserCommentShowViewProps & {
  documentTitle: string;
  loading: boolean;
  loadUserComments: (targetType: string, targetId: string) => void;
  targetType: string;
  targetId: string;
};
```

```tsx
  renderView() {
    const {
      documentTitle,
      loading,
      loadUserComments,
      targetType,
      targetId,
      ...viewProps
    } = this.props;

    return <UserCommentShowView {...viewProps} />;
  }
```

(Note: `deleteUserComment` is now part of `UserCommentShowViewProps`, so it is no longer destructured-out in `renderView` — it flows through `viewProps`.)

- [ ] **Step 3: Type-check**

Run: `yarn workspace @veupathdb/genomics-site compile:check`
Expected: PASS. Common failures to fix: a leftover reference to `formGroupFields`/`formGroupHeaders`/`formGroupOrder`; `deleteUserComment` accidentally still in `renderView`'s destructure (would strip it from the view); unused-import error for `PubmedIdEntry`/`UserCommentUploadedFiles` if step (a) was missed.

- [ ] **Step 4: Manual verification** — start the dev server and exercise the spec's checklist:

```bash
yarn nx start @veupathdb/genomics-site
```

Log in, then for a gene with comments visit `/user-comments/show?stableId=<gene>&commentTargetId=gene`:

- **Human-only gene**: cards render; every populated reference type appears (DOI, GenBank, related genes, attachments, categories, location, external DB, status); empty reference rows are absent; no "AI-assisted" pill.
- **AI-pubmed comment**: "AI-assisted" pill in the header; info banner renders; the PMID resolves to a full citation (title/author/journal) via the fetched preview, degrading to a bare `pubmed.ncbi.nlm.nih.gov/<id>` link if the fetch fails.
- **Viewport-gating** (DevTools → Network, filter `pmid2json`): with an AI-pubmed comment below the fold, **no** `pmid2json` request fires on load; scrolling the card into view fires exactly one; scrolling away and back does not refetch.
- **Edited AI comment** (`isEdited: true`): banner shows "Edited by the author." and a "Show original AI-generated text" toggle that reveals `originalHeadline`/`originalContent`.
- **As-is AI comment** (`isEdited: false`): banner shows "Published as generated." and **no** toggle.
- **Upload AI comment**: with `externalUrl` → a link (titled `externalTitle` if present); without → "User-uploaded PDF — not publicly available"; the "file not stored" note appears; no SHA shown.
- **Filter chips**: counts correct; All / User-generated / AI-assisted filter the list; per-filter empty states render.
- **Scroll-to-comment**: a URL with `#<commentId>` scrolls that card into view.
- **Own-comment controls**: `[edit]` / `[delete]` appear only on your comments; delete confirms then removes.

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/UserCommentShow/UserCommentShowView.tsx packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/UserCommentShowController.tsx
git commit -m "feat(user-comments): card-based show page with AI provenance and filters"
```

---

## Self-review

**Spec coverage:**

- Unified list + filter chips → Task 5 + Task 7. ✓
- Card layout (header / banner / content / references / meta) → Task 6. ✓
- AI pill / disclosure / edited-as-is / collapsible original → Task 3 + Task 6. ✓
- Source rendering (PMID via preview; upload link + fallback; file-not-stored) → Task 2 + Task 3. ✓
- Viewport-gated PMID fetch + `react-cool-inview` comment + bare-link fallback → Task 1 + Task 2. ✓
- `pdfContentSha256` never surfaced → not rendered anywhere (Task 3 `Source` ignores it). ✓
- Controller drops `formGroupFields`; passes comments down; no preview fetch in controller → Task 7. ✓
- Legacy reference parity (DOI/GenBank/related/categories/location/attachments/external DB/status) → Task 4. ✓

**Placeholder scan:** none — every step has complete code/commands.

**Type consistency:** `CommentFilter` defined in Task 5 and imported in Task 7; `useIntersectionObserver` signature in Task 1 matches its use in Task 2 (`useIntersectionObserver<HTMLDivElement>()`); `AiProvenanceBanner({ aiProvenance })`, `CommentReferences({ comment, webAppUrl })`, `UserCommentCard({ comment, userId, webAppUrl, onDelete })`, `CommentFilterChips({ counts, active, onChange })` are used with exactly these props in their consumers. New `UserCommentShowViewProps` matches the object returned by the rewritten `mergeProps`.
