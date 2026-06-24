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
        hideIcon: true,
        message,
        additionalMessage,
        showMoreLinkText: 'Show original AI-generated text',
        showLessLinkText: 'Hide original AI-generated text',
      }}
    />
  );
}
