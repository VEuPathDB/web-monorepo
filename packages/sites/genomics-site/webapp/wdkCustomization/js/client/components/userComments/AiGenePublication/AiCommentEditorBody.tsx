import React from 'react';
import { TextBox, TextArea } from '@veupathdb/wdk-client/lib/Components';
import {
  AiProvenanceSource,
  PubmedPreviewEntry,
} from '../../../types/userCommentTypes';
import { PubmedIdEntry } from '../UserCommentForm/PubmedIdEntry';

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
const BLUE = '#336f99';
const SECTION_GAP = '16px';

function ProvenancePanel({
  source,
  pubmedPreview,
}: {
  source: AiProvenanceSource;
  pubmedPreview?: PubmedPreviewEntry;
}) {
  const panelStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px 14px',
    marginBottom: SECTION_GAP,
    fontSize: '14px',
  };

  const labelStyle: React.CSSProperties = {
    color: GREY,
    fontWeight: 500,
    marginBottom: '4px',
    fontSize: '13px',
  };

  if (source.kind === 'pubmed') {
    return (
      <div style={panelStyle}>
        <div style={labelStyle}>Source publication</div>
        {pubmedPreview ? (
          <PubmedIdEntry
            id={pubmedPreview.id}
            title={pubmedPreview.title}
            author={pubmedPreview.author}
            journal={pubmedPreview.journal}
            url={pubmedPreview.url}
          />
        ) : (
          <div>
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
    <div style={panelStyle}>
      <div style={labelStyle}>Source publication</div>
      {source.externalUrl && (
        <div style={{ marginBottom: '4px' }}>
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
        <div
          role="note"
          style={{
            backgroundColor: '#fff8e1',
            border: '1px solid #f5c842',
            borderRadius: '4px',
            padding: '10px 12px',
            marginBottom: SECTION_GAP,
            fontSize: '13px',
            color: '#7a5c00',
            lineHeight: '1.5',
          }}
        >
          {noticeAboveEditor}
        </div>
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
          <button
            type="button"
            disabled={!isDirty}
            onClick={handleRestore}
            aria-label="Restore original AI-generated text"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              backgroundColor: 'transparent',
              color: isDirty ? BLUE : GREY,
              border: `1px solid ${isDirty ? BLUE : '#ccc'}`,
              borderRadius: '4px',
              cursor: isDirty ? 'pointer' : 'not-allowed',
              opacity: isDirty ? 1 : 0.6,
            }}
          >
            Restore original
          </button>
        </div>
      )}

      <div>{actions}</div>
    </div>
  );
}
