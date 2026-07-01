import React, { useState } from 'react';
import { Checkbox } from '@veupathdb/wdk-client/lib/Components';
import { AiGenePublicationJobStatus } from '../../../types/aiGenePublicationTypes';
import {
  AiProvenanceSource,
  PubmedPreviewEntry,
} from '../../../types/userCommentTypes';
import { AiGenePublicationBreadcrumb } from './AiGenePublicationBreadcrumb';
import { AiCommentEditorBody } from './AiCommentEditorBody';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  FilledButton,
  OutlinedButton,
  PlainLinkButton,
} from '@veupathdb/coreui/lib/components/buttons';

// Only `success` reaches this view — it's the one terminal status that carries
// AI-generated content to review and publish. The "produced nothing" statuses
// (mentioned-in-passing / gene-not-mentioned) are dead-ended by
// AiCommentRejectView instead, so a from-scratch comment isn't mislabelled
// "AI-assisted".
export type PublishableJobStatus = Extract<
  AiGenePublicationJobStatus,
  { type: 'success' }
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

  const [headline, setHeadline] = useState(status.aiOutput.headline);
  const [content, setContent] = useState(status.aiOutput.content);
  const [confirmed, setConfirmed] = useState(false);

  const canPublish =
    confirmed && headline.trim() !== '' && content.trim() !== '' && !publishing;

  // The unedited AI output, so the editor can offer a Restore button.
  const original = {
    headline: status.aiOutput.headline,
    content: status.aiOutput.content,
  };

  const actions = (
    <div>
      {publishErrors != null && publishErrors.length > 0 && (
        <Banner
          banner={{
            type: 'error',
            role: 'alert',
            ariaLive: 'assertive',
            spacing: { margin: '0 0 12px', padding: '10px 14px' },
            fontSize: '13px',
            message: (
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {publishErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ),
          }}
        />
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
        <FilledButton
          text={publishing ? 'Publishing…' : 'Publish comment'}
          onPress={() => onPublish(headline, content)}
          disabled={!canPublish}
          themeRole="primary"
        />

        <OutlinedButton
          text="Try a different publication"
          onPress={onTryDifferentPublication}
          themeRole="primary"
        />
      </div>

      <div>
        <PlainLinkButton
          text="Back to gene page"
          onPress={onBackToGenePage}
          themeRole="primary"
        />
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
        encouragement="Please review the AI-generated content above and edit as needed before publishing."
        actions={actions}
      />
    </div>
  );
}
