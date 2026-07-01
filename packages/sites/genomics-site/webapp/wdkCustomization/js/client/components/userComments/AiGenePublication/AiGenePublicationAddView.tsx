import React, { useEffect, useState } from 'react';
import { detectExternalRef } from './detectExternalRef';
import { LazyPubmedPreview } from '../UserCommentShow/LazyPubmedPreview';
import {
  TextBox,
  RadioList,
  FileInput,
  Checkbox,
} from '@veupathdb/wdk-client/lib/Components';
import { AiGenePublicationBreadcrumb } from './AiGenePublicationBreadcrumb';
import { PubmedIdEntry } from '../UserCommentForm/PubmedIdEntry';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  FilledButton,
  OutlinedButton,
} from '@veupathdb/coreui/lib/components/buttons';

import './AiGenePublicationAddView.scss';
import { PubmedPreviewEntry } from '../../../types/userCommentTypes';
import { AiGenePublicationJobStatus } from '../../../types/aiGenePublicationTypes';
import {
  PdfExtractionProgress,
  PdfExtractionSuccess,
  PdfExtractionFailure,
} from './extractPdfText';

function assertNever(value: never): never {
  throw new Error(`Unhandled job status: ${JSON.stringify(value)}`);
}

export type PublicationSource = 'pubmed' | 'upload';

// Upload-path PDF extraction sub-state (owned by the controller, rendered here).
export type UploadExtractionState =
  | { status: 'idle' } // no file selected yet
  | { status: 'extracting'; progress: PdfExtractionProgress } // lazy-load + hash + extract in flight
  | { status: 'ready'; result: PdfExtractionSuccess } // paperText + sha ready
  | { status: 'error'; failure: PdfExtractionFailure }; // could not extract

// Read-only echo of what was submitted, shown in progress mode.
export type SubmittedSummary =
  | { source: 'pubmed'; pubmedId: string }
  | {
      source: 'upload';
      fileName?: string;
      externalUrl?: string;
      externalTitle?: string;
    };

export interface AiGenePublicationAddViewProps {
  stableId: string;

  // ---- input mode (form). Always supplied; the form is shown when `job` is undefined. ----
  form: {
    source: PublicationSource;
    onSourceChange: (source: PublicationSource) => void;
    // PubMed path
    pubmedId: string;
    onPubmedIdChange: (value: string) => void;
    pubmedPreview?: PubmedPreviewEntry; // optional metadata chip (controller fetches it)
    pubmedPreviewPending: boolean; // true while the preview lookup is in flight
    // Upload path
    onFileSelected: (file: File | null) => void;
    selectedFileName?: string;
    extraction: UploadExtractionState;
    externalUrl: string;
    onExternalUrlChange: (value: string) => void;
    externalTitle: string;
    onExternalTitleChange: (value: string) => void;
    externalRef: string;
    onExternalRefChange: (value: string) => void;
    // Duplicate-publication warning: existing AI comments on this gene that match
    // the currently-entered publication, split by ownership. When either list is
    // non-empty, the user must tick the acknowledgement before `canSubmit`
    // becomes true (the controller enforces this). `ownDuplicates` carry an edit
    // link (the viewer authored them); `otherDuplicates` carry a view link.
    ownDuplicates: {
      id: number;
      headline?: string;
      content: string;
      href: string;
    }[];
    otherDuplicates: {
      id: number;
      headline?: string;
      content: string;
      href: string;
    }[];
    acknowledged: boolean;
    onAcknowledgedChange: (acknowledged: boolean) => void;
    // Submit
    canSubmit: boolean; // controller computes this; you just disable on !canSubmit
    submitting: boolean; // true between click and the POST resolving
    onSubmit: () => void;
  };

  // ---- progress mode. When present, render this INSTEAD of the form. ----
  job?: {
    status: AiGenePublicationJobStatus; // running | terminal
    submitted: SubmittedSummary;
    startedAt: number; // ms epoch; for the elapsed timer
    cancelling: boolean; // Cancel clicked, awaiting poll confirmation
    onCancel: () => void;
    onTryDifferentPublication: () => void;
    onUploadPdfInstead: () => void;
    onBackToGenePage: () => void;
  };

  // ---- shown above the input form when a previous poll expired ----
  expiredNotice?: boolean;

  // ---- 503 toast ----
  serverBusy?: { retryAfterSeconds?: number; onDismiss: () => void };
}

// The four known pipeline stages in their fixed execution order.
const KNOWN_STAGE_ORDER = [
  'fetching-article',
  'scanning-gene-mentions',
  'generating-summary',
  'persisting',
] as const;

type KnownStage = (typeof KNOWN_STAGE_ORDER)[number];

const STAGE_LABELS: Record<KnownStage, string> = {
  'fetching-article': 'Fetching article',
  'scanning-gene-mentions': 'Scanning gene mentions',
  'generating-summary': 'Generating summary',
  persisting: 'Persisting',
};

function isKnownStage(stage: string): stage is KnownStage {
  return (KNOWN_STAGE_ORDER as readonly string[]).includes(stage);
}

// ---- sub-components ----

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [seconds, setSeconds] = useState(() =>
    Math.floor((Date.now() - startedAt) / 1000)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span style={{ color: '#555', fontSize: '13px' }}>
      Running for {seconds} second{seconds === 1 ? '' : 's'}
    </span>
  );
}

const CHECK_GREEN = '#2d7d2d';
const GREY = '#888';

function StageRow({
  label,
  state,
  message,
}: {
  label: string;
  state: 'done' | 'current' | 'pending';
  message?: string;
}) {
  if (state === 'done') {
    return (
      <div className="ai-stage-row ai-stage-row--done">
        <span className="ai-stage-icon ai-stage-icon--done">✓</span>
        <span className="ai-stage-label">{label}</span>
        <span className="ai-stage-done-tag">done</span>
      </div>
    );
  }

  if (state === 'current') {
    return (
      <div className="ai-stage-row ai-stage-row--current">
        <span className="ai-stage-icon ai-stage-icon--current" />
        <div>
          <span className="ai-stage-label">{label}</span>
          {message && <div className="ai-stage-message">{message}</div>}
        </div>
      </div>
    );
  }

  // pending
  return (
    <div className="ai-stage-row ai-stage-row--pending">
      <span className="ai-stage-icon ai-stage-icon--pending" />
      <span className="ai-stage-label">{label}</span>
    </div>
  );
}

function ExtractionStatus({
  extraction,
  onClear,
}: {
  extraction: UploadExtractionState;
  onClear: () => void;
}) {
  if (extraction.status === 'idle') return null;

  if (extraction.status === 'extracting') {
    const { stage, pagesDone, pageCount } = extraction.progress;
    let msg = 'Processing…'; // fallback for any future extraction stage
    if (stage === 'loading-reader') msg = 'Preparing PDF reader…';
    else if (stage === 'hashing') msg = 'Hashing file…';
    else if (stage === 'extracting') {
      msg = 'Extracting text…';
      if (pageCount != null && pagesDone != null) {
        msg += ` (page ${pagesDone + 1} of ${pageCount})`;
      }
    }
    return (
      <div
        style={{
          marginTop: '6px',
          color: '#555',
          fontSize: '13px',
          fontStyle: 'italic',
        }}
      >
        {msg}
      </div>
    );
  }

  if (extraction.status === 'ready') {
    const { characterCount, pageCount } = extraction.result;
    return (
      <div style={{ marginTop: '6px', color: CHECK_GREEN, fontSize: '13px' }}>
        Extracted {characterCount.toLocaleString()} characters across{' '}
        {pageCount} page{pageCount === 1 ? '' : 's'}.
      </div>
    );
  }

  // error
  return (
    <div
      style={{
        marginTop: '6px',
        padding: '8px 12px',
        backgroundColor: '#fdf0f0',
        border: '1px solid #e8a0a0',
        borderRadius: '4px',
        fontSize: '13px',
        color: '#8b1a1a',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      <span>{extraction.failure.message}</span>
      <div style={{ flexShrink: 0 }}>
        <OutlinedButton
          text="Clear"
          onPress={onClear}
          themeRole="error"
          size="small"
        />
      </div>
    </div>
  );
}

const refHintPillStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 8px',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 500,
};

function ExternalRefHint({ value }: { value: string }): JSX.Element | null {
  // Capture both the evaluated (debounced) input and its detection result, so
  // we can tell "nothing typed" apart from "typed something unparseable".
  const [evaluated, setEvaluated] = useState<{
    input: string;
    detected: { ref: string; kind: 'pubmed' | 'doi' } | undefined;
  }>({ input: '', detected: undefined });

  useEffect(() => {
    const handle = setTimeout(
      () =>
        setEvaluated({
          input: value.trim(),
          detected: detectExternalRef(value),
        }),
      400
    );
    return () => clearTimeout(handle);
  }, [value]);

  const { input, detected } = evaluated;

  // Nothing typed yet — no hint.
  if (input === '') return null;

  // Typed something the parser couldn't recognise — it won't be stored.
  if (!detected) {
    return (
      <div style={{ marginTop: '6px' }}>
        <span style={{ ...refHintPillStyle, backgroundColor: '#9a6700' }}>
          Not a valid PubMed ID or DOI — will be ignored
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '6px' }}>
      <span style={{ ...refHintPillStyle, backgroundColor: '#0a7c8a' }}>
        {detected.kind === 'pubmed' ? 'PubMed ID' : 'DOI'} detected
      </span>
      {detected.kind === 'pubmed' ? (
        <div style={{ marginTop: '8px' }}>
          <LazyPubmedPreview key={detected.ref} pubmedId={detected.ref} />
        </div>
      ) : (
        <div style={{ marginTop: '6px', fontSize: '14px' }}>
          <a
            href={`https://doi.org/${detected.ref}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            https://doi.org/{detected.ref}
          </a>
        </div>
      )}
    </div>
  );
}

function SubmittedSummaryDisplay({
  stableId,
  submitted,
}: {
  stableId: string;
  submitted: SubmittedSummary;
}) {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '4px',
    fontSize: '14px',
  };
  const labelStyle: React.CSSProperties = { color: GREY, minWidth: '80px' };

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px 14px',
        marginBottom: '16px',
        fontSize: '14px',
      }}
    >
      <div style={rowStyle}>
        <span style={labelStyle}>Gene ID:</span>
        <span>{stableId}</span>
      </div>
      {submitted.source === 'pubmed' && (
        <div style={rowStyle}>
          <span style={labelStyle}>PubMed ID:</span>
          <span>{submitted.pubmedId}</span>
        </div>
      )}
      {submitted.source === 'upload' && (
        <>
          {submitted.fileName && (
            <div style={rowStyle}>
              <span style={labelStyle}>File:</span>
              <span>{submitted.fileName}</span>
            </div>
          )}
          {submitted.externalUrl && (
            <div style={rowStyle}>
              <span style={labelStyle}>URL:</span>
              <a
                href={submitted.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {submitted.externalTitle || submitted.externalUrl}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DuplicateCommentDetails({
  comment,
  linkText,
}: {
  comment: AiGenePublicationAddViewProps['form']['ownDuplicates'][number];
  linkText: string;
}) {
  return (
    <details style={{ marginBottom: '6px' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
        {comment.headline || `Comment ${comment.id}`}
      </summary>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          maxWidth: '80ch',
          margin: '6px 0',
          color: '#333',
        }}
      >
        {comment.content}
      </div>
      <a href={comment.href} target="_blank" rel="noopener noreferrer">
        {linkText}
      </a>
    </details>
  );
}

function DuplicatePublicationWarning({
  ownDuplicates,
  otherDuplicates,
  acknowledged,
  onAcknowledgedChange,
}: {
  ownDuplicates: AiGenePublicationAddViewProps['form']['ownDuplicates'];
  otherDuplicates: AiGenePublicationAddViewProps['form']['otherDuplicates'];
  acknowledged: boolean;
  onAcknowledgedChange: (acknowledged: boolean) => void;
}) {
  if (ownDuplicates.length === 0 && otherDuplicates.length === 0) return null;
  const otherCount = otherDuplicates.length;

  return (
    <Banner
      banner={{
        type: 'warning',
        role: 'alert',
        ariaLive: 'assertive',
        hideIcon: true,
        spacing: { margin: '0 0 16px', padding: '12px 14px' },
        fontSize: '14px',
        message: (
          <>
            {ownDuplicates.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>
                  {ownDuplicates.length === 1
                    ? 'You’ve already published a comment for this gene from this publication. You can edit it instead of generating a new one.'
                    : 'You’ve already published comments for this gene from this publication. You can edit them instead of generating a new one.'}
                </div>
                <div
                  style={{
                    marginBottom: '6px',
                    color: '#555',
                    fontStyle: 'italic',
                  }}
                >
                  {ownDuplicates.length === 1
                    ? 'Click to expand the comment below.'
                    : 'Click to expand any comment below.'}
                </div>
                {ownDuplicates.map((dup) => (
                  <DuplicateCommentDetails
                    key={dup.id}
                    comment={dup}
                    linkText="Edit your comment"
                  />
                ))}
              </div>
            )}

            {otherCount > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>
                  {otherCount === 1
                    ? 'An AI-assisted comment for this gene from this publication has already been published.'
                    : `${otherCount} AI-assisted comments for this gene from this publication have already been published.`}
                </div>
                <div
                  style={{
                    marginBottom: '6px',
                    color: '#555',
                    fontStyle: 'italic',
                  }}
                >
                  {otherCount === 1
                    ? 'Click to expand the comment below.'
                    : 'Click to expand any comment below.'}
                </div>
                {otherDuplicates.map((dup) => (
                  <DuplicateCommentDetails
                    key={dup.id}
                    comment={dup}
                    linkText="View on comments page"
                  />
                ))}
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              You can still generate another, but please check it won&apos;t
              duplicate existing content.
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              <Checkbox
                id="ai-duplicate-ack"
                value={acknowledged}
                onChange={onAcknowledgedChange}
              />
              <label
                htmlFor="ai-duplicate-ack"
                style={{ cursor: 'pointer', lineHeight: '1.4' }}
              >
                I understand and want to generate another comment anyway.
              </label>
            </div>
          </>
        ),
      }}
    />
  );
}

// ---- main component ----

export function AiGenePublicationAddView(props: AiGenePublicationAddViewProps) {
  const { stableId, form, job, expiredNotice, serverBusy } = props;

  // Once a job exists the user is on step 2 — including while a terminal error
  // / cancellation is shown (the plan keeps cancel/error on step 2). The review
  // step (3) is a different component, so this view never shows it.
  const activeStep = job == null ? 'publication-source' : 'generating-comment';

  const submitEnabled = form.canSubmit && !form.submitting;

  // When an AI summary already exists for this gene+publication, the provenance
  // fields are moot: the backend keys de-duplication on the PDF content digest
  // and never persists these fields for a duplicate, so we disable them.
  const alreadyPublished =
    form.ownDuplicates.length > 0 || form.otherDuplicates.length > 0;
  const provenanceFieldStyle: React.CSSProperties = {
    width: '400px',
    ...(alreadyPublished
      ? { backgroundColor: '#f0f0f0', color: GREY, cursor: 'not-allowed' }
      : {}),
  };
  // Subordinate to the "Provenance (optional)" section heading.
  const provenanceLabelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 400,
    marginBottom: '4px',
    fontSize: '13px',
  };

  return (
    <div style={{ maxWidth: '720px', fontFamily: 'inherit' }}>
      <AiGenePublicationBreadcrumb activeStep={activeStep} />

      <h2
        style={{
          marginTop: '8px',
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: 600,
        }}
      >
        AI-assisted comment for gene {stableId}
      </h2>

      {/* 503 server-busy toast */}
      {serverBusy && (
        <Banner
          onClose={serverBusy.onDismiss}
          banner={{
            type: 'warning',
            role: 'alert',
            ariaLive: 'assertive',
            spacing: { margin: '0 0 16px', padding: '10px 12px' },
            fontSize: '13px',
            message: (
              <span>
                The AI service is busy. Please try again in a moment.
                {serverBusy.retryAfterSeconds != null && (
                  <>
                    {' '}
                    Retry after {serverBusy.retryAfterSeconds} second
                    {serverBusy.retryAfterSeconds === 1 ? '' : 's'}.
                  </>
                )}
              </span>
            ),
          }}
        />
      )}

      {/* INPUT MODE */}
      {job == null && (
        <div>
          {expiredNotice && (
            <Banner
              banner={{
                type: 'warning',
                role: 'note',
                spacing: { margin: '0 0 16px', padding: '10px 12px' },
                fontSize: '13px',
                message: 'That job has expired — please submit again.',
              }}
            />
          )}

          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend
              style={{
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              Publication details
            </legend>

            {/* Source selector */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 500, marginBottom: '6px' }}>Source</div>
              <RadioList
                name="ai-publication-source"
                className="ai-source-radio"
                value={form.source}
                onChange={(val) =>
                  form.onSourceChange(val as PublicationSource)
                }
                items={[
                  { value: 'pubmed', display: 'PubMed ID' },
                  { value: 'upload', display: 'Upload PDF' },
                ]}
              />
            </div>

            {/* PubMed path */}
            {form.source === 'pubmed' && (
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="ai-pubmed-id-input"
                  style={{
                    display: 'block',
                    fontWeight: 500,
                    marginBottom: '4px',
                  }}
                >
                  PubMed ID
                </label>
                <TextBox
                  id="ai-pubmed-id-input"
                  value={form.pubmedId}
                  onChange={form.onPubmedIdChange}
                  placeholder="e.g. 38429021"
                  style={{ width: '140px' }}
                />
                <div
                  style={{ marginTop: '4px', fontSize: '12px', color: GREY }}
                >
                  Enter a PubMed ID to look up the publication
                </div>
                {form.pubmedPreviewPending ? (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: GREY,
                    }}
                  >
                    Loading PubMed preview…
                  </div>
                ) : (
                  form.pubmedPreview && (
                    <div style={{ marginTop: '10px' }}>
                      <PubmedIdEntry
                        id={form.pubmedPreview.id}
                        title={form.pubmedPreview.title}
                        author={form.pubmedPreview.author}
                        journal={form.pubmedPreview.journal}
                        url={form.pubmedPreview.url}
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {/* Upload path */}
            {form.source === 'upload' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label
                    htmlFor="ai-pdf-file-input"
                    style={{
                      display: 'block',
                      fontWeight: 500,
                      marginBottom: '4px',
                    }}
                  >
                    PDF file
                  </label>
                  <FileInput
                    id="ai-pdf-file-input"
                    accept=".pdf,application/pdf"
                    onChange={form.onFileSelected}
                  />
                  {form.selectedFileName && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '13px',
                        color: '#333',
                      }}
                    >
                      {form.selectedFileName}
                    </span>
                  )}
                  <ExtractionStatus
                    extraction={form.extraction}
                    onClear={() => form.onFileSelected(null)}
                  />
                </div>

                {/* Privacy notice */}
                <Banner
                  banner={{
                    type: 'info',
                    role: 'note',
                    spacing: { margin: '0 0 12px', padding: '8px 12px' },
                    fontSize: '13px',
                    message:
                      'Your PDF is processed entirely in your browser — only the extracted text is sent to our servers, never the file itself.',
                  }}
                />

                {/* Optional provenance fields */}
                <div style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      marginBottom: '2px',
                    }}
                  >
                    Provenance (optional)
                  </div>
                  <div style={{ fontSize: '12px', color: GREY }}>
                    Linking to the source publication helps other users see
                    where this AI summary came from. All three fields below are
                    optional.
                  </div>
                </div>
                {alreadyPublished && (
                  <div
                    style={{
                      marginBottom: '8px',
                      fontSize: '12px',
                      color: GREY,
                    }}
                  >
                    An AI summary already exists for this gene from this
                    publication, so these provenance fields are disabled — they
                    won’t change the existing summary.
                  </div>
                )}
                <div style={{ marginBottom: '8px' }}>
                  <label
                    htmlFor="ai-external-url-input"
                    style={provenanceLabelStyle}
                  >
                    Publication URL
                  </label>
                  <TextBox
                    id="ai-external-url-input"
                    value={form.externalUrl}
                    onChange={form.onExternalUrlChange}
                    placeholder="https://…"
                    disabled={alreadyPublished}
                    style={provenanceFieldStyle}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label
                    htmlFor="ai-external-title-input"
                    style={provenanceLabelStyle}
                  >
                    Link text
                  </label>
                  <TextBox
                    id="ai-external-title-input"
                    value={form.externalTitle}
                    onChange={form.onExternalTitleChange}
                    placeholder="e.g. Smith et al. 2024 (preprint)"
                    disabled={alreadyPublished}
                    style={provenanceFieldStyle}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label
                    htmlFor="ai-external-ref-input"
                    style={provenanceLabelStyle}
                  >
                    PubMed ID or DOI
                  </label>
                  <TextBox
                    id="ai-external-ref-input"
                    value={form.externalRef}
                    onChange={form.onExternalRefChange}
                    placeholder="e.g. 12345678 or 10.1234/abc"
                    disabled={alreadyPublished}
                    style={provenanceFieldStyle}
                  />
                  {!alreadyPublished && (
                    <ExternalRefHint value={form.externalRef} />
                  )}
                </div>
              </div>
            )}

            {/* Duplicate-publication warning (above the submit button) */}
            <DuplicatePublicationWarning
              ownDuplicates={form.ownDuplicates}
              otherDuplicates={form.otherDuplicates}
              acknowledged={form.acknowledged}
              onAcknowledgedChange={form.onAcknowledgedChange}
            />

            {/* Submit */}
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <FilledButton
                text={form.submitting ? 'Submitting…' : 'Generate AI comment'}
                onPress={form.onSubmit}
                disabled={!submitEnabled}
                themeRole="primary"
              />
              <span style={{ fontSize: '13px', color: GREY }}>
                No comment is created until you review and publish.
              </span>
            </div>
          </fieldset>
        </div>
      )}

      {/* PROGRESS MODE */}
      {job != null && (
        <div>
          <SubmittedSummaryDisplay
            stableId={stableId}
            submitted={job.submitted}
          />

          {(() => {
            const { status } = job;
            switch (status.type) {
              case 'running': {
                const currentStage = status.progress.stage;
                const currentKnownIndex = isKnownStage(currentStage)
                  ? KNOWN_STAGE_ORDER.indexOf(currentStage as KnownStage)
                  : -1;

                return (
                  <div>
                    {/* Stage checklist */}
                    <div className="ai-progress-checklist">
                      {KNOWN_STAGE_ORDER.map((stage, index) => {
                        let state: 'done' | 'current' | 'pending';
                        if (currentKnownIndex === -1) {
                          // Unknown current stage — all known stages are pending
                          state = 'pending';
                        } else if (index < currentKnownIndex) {
                          state = 'done';
                        } else if (index === currentKnownIndex) {
                          state = 'current';
                        } else {
                          state = 'pending';
                        }

                        return (
                          <StageRow
                            key={stage}
                            label={STAGE_LABELS[stage]}
                            state={state}
                            message={
                              state === 'current' && isKnownStage(currentStage)
                                ? status.progress.message
                                : undefined
                            }
                          />
                        );
                      })}

                      {/* Defensive unknown-stage row (e.g. future "Fetching gene synonyms") */}
                      {!isKnownStage(currentStage) && (
                        <StageRow
                          label={currentStage}
                          state="current"
                          message={status.progress.message}
                        />
                      )}
                    </div>

                    {/* Elapsed timer + Cancel: space-between keeps Cancel
                        pinned right so the timer's width changes don't shift it */}
                    <div className="ai-progress-footer">
                      <ElapsedTimer startedAt={job.startedAt} />
                      <OutlinedButton
                        text={job.cancelling ? 'Cancelling…' : 'Cancel'}
                        onPress={job.onCancel}
                        disabled={job.cancelling}
                        themeRole="primary"
                      />
                    </div>
                  </div>
                );
              }

              case 'cancelled':
              case 'text-unavailable':
              case 'internal-error': {
                let errorMessage: React.ReactNode;
                if (status.type === 'cancelled') {
                  errorMessage = 'This job was cancelled.';
                } else if (status.type === 'text-unavailable') {
                  errorMessage = (
                    <>
                      We couldn't retrieve the full text for this article — it
                      may not be freely available. Try a different publication,
                      or upload the PDF if you have it.
                    </>
                  );
                } else {
                  errorMessage = status.error;
                }

                // Show all known stages as done up to the failure point — we don't know where
                // it failed, so render all as pending (consistent with the mockup error state).
                return (
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      {KNOWN_STAGE_ORDER.map((stage) => (
                        <StageRow
                          key={stage}
                          label={STAGE_LABELS[stage]}
                          state="pending"
                        />
                      ))}
                    </div>
                    <Banner
                      banner={{
                        type: 'error',
                        role: 'alert',
                        ariaLive: 'assertive',
                        spacing: { margin: '0 0 16px', padding: '12px 14px' },
                        fontSize: '14px',
                        message: errorMessage,
                      }}
                    />
                    <TerminalRecoveryButtons
                      onTryDifferentPublication={job.onTryDifferentPublication}
                      onBackToGenePage={job.onBackToGenePage}
                      {...(status.type === 'text-unavailable'
                        ? { onUploadPdfInstead: job.onUploadPdfInstead }
                        : {})}
                    />
                  </div>
                );
              }

              case 'success':
              case 'mentioned-in-passing':
              case 'gene-not-mentioned': {
                // These are routed by the controller to the review view (Task 7).
                // Render a brief neutral fallback while the transition happens.
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: CHECK_GREEN,
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>✓</span>
                    <span>Generation complete — preparing review…</span>
                  </div>
                );
              }

              default: {
                // Exhaustiveness check: TypeScript will error if a case is
                // missed. At runtime an unanticipated status surfaces an error
                // rather than rendering nothing.
                return assertNever(status);
              }
            }
          })()}
        </div>
      )}
    </div>
  );
}

function TerminalRecoveryButtons({
  onTryDifferentPublication,
  onUploadPdfInstead,
  onBackToGenePage,
}: {
  onTryDifferentPublication: () => void;
  // Only supplied for the text-unavailable case, where uploading the PDF is a
  // viable alternative to the failed PubMed full-text fetch.
  onUploadPdfInstead?: () => void;
  onBackToGenePage: () => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <FilledButton
        text="Try a different publication"
        onPress={onTryDifferentPublication}
        themeRole="primary"
      />
      {onUploadPdfInstead && (
        <FilledButton
          text="Upload a PDF instead"
          onPress={onUploadPdfInstead}
          themeRole="primary"
        />
      )}
      <OutlinedButton
        text="Back to gene page"
        onPress={onBackToGenePage}
        themeRole="primary"
      />
    </div>
  );
}
