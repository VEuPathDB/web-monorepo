import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { AiProvenanceSource } from '../../../types/userCommentTypes';
import { AiCommentEditorBody } from './AiCommentEditorBody';

export interface AiCommentEditViewProps {
  stableId: string;
  source: AiProvenanceSource;
  headline: string;
  content: string;
  onHeadlineChange: (value: string) => void;
  onContentChange: (value: string) => void;
  original: { headline: string; content: string };
  onSubmit: () => void;
  submitting: boolean;
  completed: boolean;
  backendValidationErrors?: string[];
  internalError?: string;
  returnUrl?: string;
  returnLinkText?: string;
}

const BLUE = '#336f99';
const CHECK_GREEN = '#2d7d2d';

export function AiCommentEditView(props: AiCommentEditViewProps): JSX.Element {
  const {
    stableId,
    source,
    headline,
    content,
    onHeadlineChange,
    onContentChange,
    original,
    onSubmit,
    submitting,
    completed,
    backendValidationErrors,
    internalError,
    returnUrl,
    returnLinkText,
  } = props;

  const canSubmit =
    !submitting && headline.trim() !== '' && content.trim() !== '';

  const hasErrors =
    (backendValidationErrors != null && backendValidationErrors.length > 0) ||
    internalError != null;

  const actions = (
    <div>
      {hasErrors && (
        <Banner
          banner={{
            type: 'error',
            role: 'alert',
            ariaLive: 'assertive',
            spacing: { margin: '0 0 12px', padding: '10px 14px' },
            fontSize: '13px',
            message: (
              <>
                {internalError && (
                  <div style={{ marginBottom: '4px' }}>{internalError}</div>
                )}
                {backendValidationErrors != null &&
                  backendValidationErrors.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {backendValidationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
              </>
            ),
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            padding: '8px 18px',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: canSubmit ? BLUE : '#aaa',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {completed && (
        <div
          role="status"
          style={{
            color: CHECK_GREEN,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '18px' }}>✓</span>
          <span>Your comment has been updated.</span>
          {returnUrl != null && (
            <Link to={returnUrl} style={{ color: BLUE }}>
              {returnLinkText || returnUrl}
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AiCommentEditorBody
      heading={`Edit AI-assisted comment for gene ${stableId}`}
      source={source}
      headline={headline}
      content={content}
      onHeadlineChange={onHeadlineChange}
      onContentChange={onContentChange}
      original={original}
      encouragement="Edits will update the published comment."
      actions={actions}
    />
  );
}
