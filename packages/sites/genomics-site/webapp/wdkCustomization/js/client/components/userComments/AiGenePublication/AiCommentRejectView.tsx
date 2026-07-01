import React from 'react';
import { AiGenePublicationJobStatus } from '../../../types/aiGenePublicationTypes';
import { AiProvenanceSource } from '../../../types/userCommentTypes';
import { AiGenePublicationBreadcrumb } from './AiGenePublicationBreadcrumb';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  FilledButton,
  PlainLinkButton,
} from '@veupathdb/coreui/lib/components/buttons';

// The two terminal statuses where the AI ran but produced nothing publishable.
// They never reach the editor: publishing a from-scratch comment here would be
// mislabelled "AI-assisted" downstream, so we dead-end with recovery options.
export type RejectJobStatus = Extract<
  AiGenePublicationJobStatus,
  { type: 'mentioned-in-passing' } | { type: 'gene-not-mentioned' }
>;

export interface AiCommentRejectViewProps {
  stableId: string;
  status: RejectJobStatus;
  source: AiProvenanceSource;
  onTryDifferentPublication: () => void;
  onBackToGenePage: () => void;
}

export function AiCommentRejectView(
  props: AiCommentRejectViewProps
): JSX.Element {
  const {
    stableId,
    status,
    source,
    onTryDifferentPublication,
    onBackToGenePage,
  } = props;

  let explanation: React.ReactNode;
  if (status.type === 'mentioned-in-passing') {
    explanation = (
      <>
        The AI read this paper but determined that gene {stableId} is only
        mentioned in passing, so it did not generate a summary.
      </>
    );
  } else {
    const synonymList = status.synonymsChecked.join(', ');
    explanation = (
      <>
        {synonymList
          ? `None of this gene's known names were found in the paper: ${synonymList}.`
          : `None of this gene's known names were found in the paper.`}
        {/* PubMed only: full text comes from PMC BioC, which we scan by
            section. Uploaded PDFs are scanned in full, so the caveat doesn't
            apply there. */}
        {source.kind === 'pubmed' && (
          <div style={{ marginTop: '8px' }}>
            Note: for PubMed articles the abstract, introduction and methods
            sections aren&apos;t scanned, so a gene mentioned only there may be
            missed.
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{ maxWidth: '720px', fontFamily: 'inherit' }}>
      <AiGenePublicationBreadcrumb activeStep="generating-comment" />

      <h2
        style={{
          marginTop: '8px',
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: 600,
        }}
      >
        No AI-assisted comment was generated for gene {stableId}
      </h2>

      <Banner
        banner={{
          type: 'normal',
          role: 'note',
          spacing: { margin: '0 0 16px', padding: '12px 14px' },
          fontSize: '14px',
          message: explanation,
        }}
      />

      <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>
        You can try a different publication, or go back to the gene page.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <FilledButton
          text="Try a different publication"
          onPress={onTryDifferentPublication}
          themeRole="primary"
        />
        <PlainLinkButton
          text="Back to gene page"
          onPress={onBackToGenePage}
          themeRole="primary"
        />
      </div>
    </div>
  );
}
