import React, { useState } from 'react';
import { Checkbox } from '@veupathdb/wdk-client/lib/Components';
import { AiGenePublicationJobStatus } from '../../../types/aiGenePublicationTypes';
import {
  AiProvenanceSource,
  PubmedPreviewEntry,
} from '../../../types/userCommentTypes';
import { AiGenePublicationBreadcrumb } from './AiGenePublicationBreadcrumb';
import { AiCommentEditorBody } from './AiCommentEditorBody';

function assertNever(value: never): never {
  throw new Error(`Unhandled status type: ${JSON.stringify(value)}`);
}

// Only the three publishable terminal statuses reach this view.
export type PublishableJobStatus = Extract<
  AiGenePublicationJobStatus,
  | { type: 'success' }
  | { type: 'mentioned-in-passing' }
  | { type: 'gene-not-mentioned' }
>;

export interface AiCommentReviewViewProps {
  stableId: string;
  status: PublishableJobStatus;
  source: AiProvenanceSource;
  pubmedPreview?: PubmedPreviewEntry;
  publishing: boolean;
  publishErrors?: string[];
  onPublish: (headline: string, content: string) => void;
  onTryDifferentPublication: () => void;
  onBackToGenePage: () => void;
}

const BLUE = '#336f99';

export function AiCommentReviewView(
  props: AiCommentReviewViewProps
): JSX.Element {
  const {
    stableId,
    status,
    source,
    pubmedPreview,
    publishing,
    publishErrors,
    onPublish,
    onTryDifferentPublication,
    onBackToGenePage,
  } = props;

  const initialHeadline =
    status.type === 'success' ? status.aiOutput.headline : '';
  const initialContent =
    status.type === 'success' ? status.aiOutput.content : '';

  const [headline, setHeadline] = useState(initialHeadline);
  const [content, setContent] = useState(initialContent);
  const [confirmed, setConfirmed] = useState(false);

  const canPublish =
    confirmed && headline.trim() !== '' && content.trim() !== '' && !publishing;

  // Build the original prop for 'success' only (enables Restore button)
  const original =
    status.type === 'success'
      ? { headline: status.aiOutput.headline, content: status.aiOutput.content }
      : undefined;

  // Build noticeAboveEditor for non-success statuses
  let noticeAboveEditor: React.ReactNode = undefined;
  if (status.type === 'mentioned-in-passing') {
    noticeAboveEditor = (
      <>
        The AI determined this paper only mentions the gene in passing — no
        summary was generated. You can still write and publish your own
        observations below.
      </>
    );
  } else if (status.type === 'gene-not-mentioned') {
    const synonymList = status.synonymsChecked.join(', ');
    noticeAboveEditor = (
      <>
        {synonymList
          ? `None of these names were found in the paper: ${synonymList}. `
          : `The gene's known names weren't found in the paper. `}
        You can still publish your own comment.
        {/* PubMed only: full text comes from PMC BioC, which we scan by
            section. Uploaded PDFs are scanned in full, so the caveat doesn't
            apply there. */}
        {source.kind === 'pubmed' && (
          <div style={{ marginTop: '8px' }}>
            Note: for PubMed articles the abstract, introduction and methods
            sections aren't scanned, so a gene mentioned only there may be
            missed.
          </div>
        )}
      </>
    );
  } else if (status.type === 'success') {
    // no notice for success
    noticeAboveEditor = undefined;
  } else {
    // exhaustiveness
    assertNever(status);
  }

  const actions = (
    <div>
      {publishErrors != null && publishErrors.length > 0 && (
        <div
          role="alert"
          style={{
            backgroundColor: '#fdf0f0',
            border: '1px solid #e8a0a0',
            borderRadius: '4px',
            padding: '10px 14px',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#8b1a1a',
          }}
        >
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {publishErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        }}
      >
        <Checkbox
          id="ai-review-confirmed"
          value={confirmed}
          onChange={setConfirmed}
        />
        <label
          htmlFor="ai-review-confirmed"
          style={{ fontSize: '14px', cursor: 'pointer', lineHeight: '1.4' }}
        >
          I have reviewed this content and it is appropriate for public release.
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => onPublish(headline, content)}
          disabled={!canPublish}
          style={{
            padding: '8px 18px',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: canPublish ? BLUE : '#aaa',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: canPublish ? 'pointer' : 'not-allowed',
          }}
        >
          {publishing ? 'Publishing…' : 'Publish comment'}
        </button>

        <button
          type="button"
          onClick={onTryDifferentPublication}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            color: BLUE,
            border: `1px solid ${BLUE}`,
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Try a different publication
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={onBackToGenePage}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            fontSize: '13px',
            color: BLUE,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Back to gene page
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <AiGenePublicationBreadcrumb activeStep="review-publish" />
      <AiCommentEditorBody
        heading={`Review AI-assisted comment for gene ${stableId}`}
        source={source}
        pubmedPreview={pubmedPreview}
        headline={headline}
        content={content}
        onHeadlineChange={setHeadline}
        onContentChange={setContent}
        original={original}
        noticeAboveEditor={noticeAboveEditor}
        encouragement="Please review the AI-generated content above and edit as needed before publishing."
        actions={actions}
      />
    </div>
  );
}
