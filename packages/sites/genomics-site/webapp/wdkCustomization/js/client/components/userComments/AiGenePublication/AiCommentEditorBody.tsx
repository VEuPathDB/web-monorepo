import React from 'react';
import { TextBox, TextArea } from '@veupathdb/wdk-client/lib/Components';
import {
  AiProvenanceSource,
  PubmedPreviewEntry,
} from '../../../types/userCommentTypes';
import { PubmedIdEntry } from '../UserCommentForm/PubmedIdEntry';
import { LazyPubmedPreview } from '../UserCommentShow/LazyPubmedPreview';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { OutlinedButton } from '@veupathdb/coreui/lib/components/buttons';

export interface AiCommentEditorBodyProps {
  heading: React.ReactNode;
  source: AiProvenanceSource;
  pubmedPreview?: PubmedPreviewEntry;
  headline: string;
  content: string;
  onHeadlineChange: (value: string) => void;
  onContentChange: (value: string) => void;
  original?: { headline: string; content: string };
  topSlot?: React.ReactNode;
  noticeAboveEditor?: React.ReactNode;
  encouragement?: React.ReactNode;
  actions: React.ReactNode;
}

const GREY = '#888';
const SECTION_GAP = '16px';

function ProvenancePanel({
  source,
  pubmedPreview,
}: {
  source: AiProvenanceSource;
  pubmedPreview?: PubmedPreviewEntry;
}) {
  // A bold section header (matching the Headline/Content labels) sits directly
  // above the citation — no grey wrapper, so the PubmedIdEntry card isn't a
  // grey box nested inside another grey box.
  const headerStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    marginBottom: '4px',
    fontSize: '14px',
  };
  const containerStyle: React.CSSProperties = { marginBottom: SECTION_GAP };

  if (source.kind === 'pubmed') {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>Source publication</div>
        {pubmedPreview ? (
          <PubmedIdEntry
            id={pubmedPreview.id}
            title={pubmedPreview.title}
            author={pubmedPreview.author}
            journal={pubmedPreview.journal}
            url={pubmedPreview.url}
          />
        ) : (
          <div style={{ fontSize: '14px' }}>
            PubMed ID:{' '}
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${source.pubmedId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.pubmedId}
            </a>
          </div>
        )}
      </div>
    );
  }

  // kind === 'upload'
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>Source publication</div>
      {source.externalUrl && (
        <div style={{ marginBottom: '4px', fontSize: '14px' }}>
          <a
            href={source.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.externalTitle || source.externalUrl}
          </a>
        </div>
      )}
      <div style={{ color: GREY, fontSize: '13px', fontStyle: 'italic' }}>
        (uploaded PDF, processed in your browser — file not stored)
      </div>
      {source.externalRef &&
        (source.externalRefKind === 'pubmed' ? (
          <div style={{ marginTop: SECTION_GAP }}>
            <div style={headerStyle}>PubMed Article(s)</div>
            <LazyPubmedPreview pubmedId={source.externalRef} />
          </div>
        ) : (
          <div style={{ marginTop: SECTION_GAP }}>
            <div style={headerStyle}>DOI</div>
            <div style={{ fontSize: '14px' }}>
              <a
                href={`https://doi.org/${source.externalRef}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                https://doi.org/{source.externalRef}
              </a>
            </div>
          </div>
        ))}
    </div>
  );
}

export function AiCommentEditorBody(
  props: AiCommentEditorBodyProps
): JSX.Element {
  const {
    heading,
    source,
    pubmedPreview,
    headline,
    content,
    onHeadlineChange,
    onContentChange,
    original,
    topSlot,
    noticeAboveEditor,
    encouragement,
    actions,
  } = props;

  const isDirty =
    original != null &&
    (headline !== original.headline || content !== original.content);

  function handleRestore() {
    if (original == null) return;
    onHeadlineChange(original.headline);
    onContentChange(original.content);
  }

  return (
    <div style={{ maxWidth: '720px', fontFamily: 'inherit' }}>
      <h2
        style={{
          marginTop: '8px',
          marginBottom: SECTION_GAP,
          fontSize: '20px',
          fontWeight: 600,
        }}
      >
        {heading}
      </h2>

      {topSlot}

      <ProvenancePanel source={source} pubmedPreview={pubmedPreview} />

      {noticeAboveEditor && (
        <Banner
          banner={{
            type: 'warning',
            role: 'note',
            spacing: { margin: `0 0 ${SECTION_GAP}`, padding: '10px 12px' },
            fontSize: '13px',
            message: noticeAboveEditor,
          }}
        />
      )}

      <div style={{ marginBottom: SECTION_GAP }}>
        <label
          htmlFor="ai-comment-headline"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: '4px',
            fontSize: '14px',
          }}
        >
          Headline
        </label>
        <TextBox
          id="ai-comment-headline"
          value={headline}
          onChange={onHeadlineChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label
          htmlFor="ai-comment-content"
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: '4px',
            fontSize: '14px',
          }}
        >
          Content
        </label>
        <TextArea
          id="ai-comment-content"
          value={content}
          onChange={onContentChange}
          rows={12}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {encouragement && (
        <div
          style={{
            fontSize: '13px',
            color: GREY,
            fontStyle: 'italic',
            marginBottom: SECTION_GAP,
          }}
        >
          {encouragement}
        </div>
      )}

      {original != null && (
        <div style={{ marginBottom: SECTION_GAP }}>
          <OutlinedButton
            text="Restore original"
            onPress={handleRestore}
            disabled={!isDirty}
            themeRole="primary"
            size="small"
            ariaLabel="Restore original AI-generated text"
          />
        </div>
      )}

      <div>{actions}</div>
    </div>
  );
}
