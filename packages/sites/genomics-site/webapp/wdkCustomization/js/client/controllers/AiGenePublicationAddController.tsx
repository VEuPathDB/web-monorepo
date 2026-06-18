import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router';

import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { GenomicsService } from '../wrapWdkService';
import {
  AiGenePublicationRequest,
  AiGenePublicationJobStatus,
  AiGenePublicationSubmitOutcome,
  AiGenePublicationPublishOutcome,
} from '../types/aiGenePublicationTypes';
import {
  PubmedPreviewEntry,
  UserCommentGetResponse,
} from '../types/userCommentTypes';
import {
  findDuplicateAiComments,
  AiSourceKey,
} from '../components/userComments/AiGenePublication/findDuplicateAiComments';
import {
  AiGenePublicationAddView,
  AiGenePublicationAddViewProps,
  PublicationSource,
  SubmittedSummary,
  UploadExtractionState,
} from '../components/userComments/AiGenePublication/AiGenePublicationAddView';
import {
  AiCommentReviewView,
  PublishableJobStatus,
} from '../components/userComments/AiGenePublication/AiCommentReviewView';
import { extractPdfText } from '../components/userComments/AiGenePublication/extractPdfText';

const POLL_INTERVAL_MS = 1000;
const PUBMED_PREVIEW_DEBOUNCE_MS = 400;

const NAV_GUARD_MESSAGE =
  'You haven’t published this comment yet — leave anyway?';

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

export interface AiGenePublicationAddControllerProps {
  stableId: string;
  jobId?: string;
}

// The non-publishable terminal statuses, shown by the add view's progress mode.
type TerminalErrorStatus = Extract<
  AiGenePublicationJobStatus,
  | { type: 'cancelled' }
  | { type: 'text-unavailable' }
  | { type: 'internal-error' }
>;

// The flow's phase. Form-field values live in their own state (preserved across
// phase transitions); this union only tracks where the job is.
type Phase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'server-busy'; retryAfterSeconds?: number }
  | {
      kind: 'polling';
      jobId: string;
      status: AiGenePublicationJobStatus;
      cancelling: boolean;
    }
  | { kind: 'terminal-error'; status: TerminalErrorStatus }
  | {
      kind: 'review';
      jobId: string;
      status: PublishableJobStatus;
      publishing: boolean;
      publishErrors?: string[];
    };

function AiGenePublicationAddController({
  stableId,
  jobId,
}: AiGenePublicationAddControllerProps) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  // At runtime the wrapped service always carries the genomics methods (see
  // wrapWdkService.tsx); the cast exposes the AI-publication methods to TS.
  const service = wdkService as GenomicsService;

  const history = useHistory();
  const location = useLocation();

  // Capture the jobId prop once. After we history.replace a jobId into the URL,
  // the prop updates, but the flow is then driven entirely by internal state.
  const initialJobId = useRef(jobId).current;

  // ---- form-field state (independent of phase, preserved across submits) ----
  const [source, setSource] = useState<PublicationSource>('pubmed');
  const [pubmedId, setPubmedId] = useState('');
  const [pubmedPreview, setPubmedPreview] = useState<
    PubmedPreviewEntry | undefined
  >(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<UploadExtractionState>({
    status: 'idle',
  });
  const [externalUrl, setExternalUrl] = useState('');
  const [externalTitle, setExternalTitle] = useState('');

  // ---- duplicate-publication detection (pre-submit warning) ----
  // The gene's existing AI comments, fetched once; we match the current form's
  // publication against these to warn before generating a likely duplicate.
  const [geneAiComments, setGeneAiComments] = useState<
    UserCommentGetResponse[]
  >([]);
  // The user's explicit "generate anyway" acknowledgement, required to submit
  // when a duplicate is detected. Reset whenever the candidate publication
  // changes (see the source-key effect below).
  const [dupAcknowledged, setDupAcknowledged] = useState(false);

  // ---- phase + auxiliary UI state ----
  const [state, setState] = useState<Phase>(() =>
    initialJobId
      ? {
          kind: 'polling',
          jobId: initialJobId,
          status: {
            type: 'running',
            jobId: initialJobId,
            progress: {
              stage: 'fetching-article',
              message: 'Resuming…',
              updatedAt: '',
            },
          },
          cancelling: false,
        }
      : { kind: 'idle' }
  );
  const [expiredNotice, setExpiredNotice] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[] | undefined>(
    undefined
  );

  // The read-only summary shown in progress mode. On a cold resume (jobId only)
  // this starts generic; the review step recovers its provenance from the job
  // status `source` instead (see the review render), so it survives a refresh.
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedSummary>(
    () =>
      initialJobId ? { source: 'upload' } : { source: 'pubmed', pubmedId: '' }
  );
  const startedAtRef = useRef<number>(Date.now());

  // ---- navigation guard (imperative so it can be lifted synchronously before
  // our own programmatic navigations) ----
  const unblockRef = useRef<(() => void) | null>(null);
  const liftGuard = useCallback(() => {
    if (unblockRef.current) {
      unblockRef.current();
      unblockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.kind !== 'review') return;
    const unblock = history.block(NAV_GUARD_MESSAGE);
    unblockRef.current = unblock;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      unblock();
      unblockRef.current = null;
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [state.kind, history]);

  // ---- poll loop (recursive setTimeout; one live loop per polling jobId) ----
  const pollingJobId = state.kind === 'polling' ? state.jobId : null;
  useEffect(() => {
    if (pollingJobId == null) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (cancelled) return;
      let result: AiGenePublicationJobStatus | { type: 'not-found' };
      try {
        result = await service.getAiGenePublicationJobStatus(pollingJobId);
      } catch {
        // Transient fetch failure: don't give up, retry on the next tick.
        if (cancelled) return;
        setReconnecting(true);
        timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }
      if (cancelled) return;
      setReconnecting(false);

      switch (result.type) {
        case 'running': {
          const running = result;
          setState((prev) =>
            prev.kind === 'polling' && prev.jobId === pollingJobId
              ? { ...prev, status: running }
              : prev
          );
          timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
          break;
        }
        case 'success':
        case 'mentioned-in-passing':
        case 'gene-not-mentioned':
          setState({
            kind: 'review',
            jobId: pollingJobId,
            status: result,
            publishing: false,
          });
          break;
        case 'cancelled':
        case 'text-unavailable':
        case 'internal-error':
          setState({ kind: 'terminal-error', status: result });
          break;
        case 'not-found':
          setExpiredNotice(true);
          setState({ kind: 'idle' });
          break;
        default:
          assertNever(result);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pollingJobId, service]);

  // The PubMed ID we currently want preview metadata for. While polling or
  // reviewing a job — including one resumed from just a jobId on refresh — we
  // take it from the job's own provenance so the preview survives reload;
  // otherwise it's whatever the user is typing into the form.
  const activePubmedId = useMemo(() => {
    if (state.kind === 'review' || state.kind === 'polling') {
      const status = state.status;
      return 'source' in status && status.source?.kind === 'pubmed'
        ? status.source.pubmedId
        : undefined;
    }
    return source === 'pubmed' ? pubmedId.trim() : undefined;
  }, [state, source, pubmedId]);

  // ---- optional PubMed metadata preview chip ----
  useEffect(() => {
    if (activePubmedId == null || !/^\d+$/.test(activePubmedId)) {
      setPubmedPreview(undefined);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const preview = await service.getPubmedPreview([
          Number(activePubmedId),
        ]);
        if (cancelled) return;
        setPubmedPreview(
          preview && preview.length > 0 ? preview[0] : undefined
        );
      } catch {
        if (!cancelled) setPubmedPreview(undefined);
      }
    }, PUBMED_PREVIEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [activePubmedId, service]);

  // ---- fetch the gene's existing AI comments once (for duplicate detection) ----
  // Fail open: a comments-fetch failure must never block generation, so on error
  // we simply leave the list empty (no warning shown).
  useEffect(() => {
    let cancelled = false;
    service.getUserComments('gene', stableId).then(
      (comments) => {
        if (!cancelled) {
          setGeneAiComments(comments.filter((c) => c.aiProvenance != null));
        }
      },
      () => {
        /* fail open — no duplicate warning */
      }
    );
    return () => {
      cancelled = true;
    };
  }, [stableId, service]);

  // The identifier for the publication currently entered in the form, or
  // undefined when nothing identifiable is selected yet (no valid PMID / no
  // extracted PDF). Drives both the duplicate match and the acknowledgement reset.
  const sourceKey = useMemo<AiSourceKey | undefined>(() => {
    if (source === 'pubmed') {
      const trimmed = pubmedId.trim();
      return /^\d+$/.test(trimmed)
        ? { kind: 'pubmed', pubmedId: trimmed }
        : undefined;
    }
    return extraction.status === 'ready'
      ? { kind: 'upload', pdfContentSha256: extraction.result.pdfContentSha256 }
      : undefined;
  }, [source, pubmedId, extraction]);

  const duplicates = useMemo(
    () => findDuplicateAiComments(geneAiComments, sourceKey),
    [geneAiComments, sourceKey]
  );

  // Re-gate whenever the candidate publication changes, so acknowledging one
  // duplicate doesn't carry over to a different PMID/PDF.
  const sourceKeyId = sourceKey
    ? `${sourceKey.kind}:${
        sourceKey.kind === 'pubmed'
          ? sourceKey.pubmedId
          : sourceKey.pdfContentSha256
      }`
    : '';
  useEffect(() => {
    setDupAcknowledged(false);
  }, [sourceKeyId]);

  // ---- PDF file selection -> lazy MuPDF load + SHA-256 + extraction ----
  const extractionTokenRef = useRef(0);
  const handleFileSelected = async (file: File | null) => {
    const token = ++extractionTokenRef.current;
    if (file == null) {
      setSelectedFile(null);
      setExtraction({ status: 'idle' });
      return;
    }
    setSelectedFile(file);
    setExtraction({
      status: 'extracting',
      progress: { stage: 'loading-reader' },
    });
    const result = await extractPdfText(file, (progress) => {
      if (extractionTokenRef.current === token) {
        setExtraction({ status: 'extracting', progress });
      }
    });
    if (extractionTokenRef.current !== token) return; // superseded by a newer file
    setExtraction(
      result.type === 'success'
        ? { status: 'ready', result }
        : { status: 'error', failure: result }
    );
  };

  // ---- URL helpers ----
  const replaceJobIdInUrl = (jid: string) => {
    history.replace(
      `${location.pathname}?stableId=${encodeURIComponent(
        stableId
      )}&jobId=${encodeURIComponent(jid)}`
    );
  };
  const clearJobIdFromUrl = () => {
    history.replace(
      `${location.pathname}?stableId=${encodeURIComponent(stableId)}`
    );
  };

  // ---- submit ----
  const handleSubmit = async () => {
    setSubmitErrors(undefined);
    setExpiredNotice(false);

    const trimmedPubmedId = pubmedId.trim();
    const trimmedUrl = externalUrl.trim();
    const trimmedTitle = externalTitle.trim();

    const request: AiGenePublicationRequest =
      source === 'pubmed'
        ? {
            geneId: stableId,
            source: 'pubmed',
            pubmedId: trimmedPubmedId,
            options: {},
          }
        : {
            geneId: stableId,
            source: 'upload',
            paperText:
              extraction.status === 'ready'
                ? extraction.result.paperText
                : undefined,
            pdfContentSha256:
              extraction.status === 'ready'
                ? extraction.result.pdfContentSha256
                : undefined,
            externalUrl: trimmedUrl || undefined,
            externalTitle: trimmedTitle || undefined,
            options: {},
          };

    setSubmittedSummary(
      source === 'pubmed'
        ? { source: 'pubmed', pubmedId: trimmedPubmedId }
        : {
            source: 'upload',
            fileName: selectedFile?.name,
            externalUrl: trimmedUrl || undefined,
            externalTitle: trimmedTitle || undefined,
          }
    );
    startedAtRef.current = Date.now();

    setState({ kind: 'submitting' });

    let outcome: AiGenePublicationSubmitOutcome;
    try {
      outcome = await service.postAiGenePublication(request);
    } catch (error) {
      setState({
        kind: 'terminal-error',
        status: {
          type: 'internal-error',
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return;
    }

    switch (outcome.type) {
      case 'running':
        replaceJobIdInUrl(outcome.jobId);
        setState({
          kind: 'polling',
          jobId: outcome.jobId,
          status: outcome,
          cancelling: false,
        });
        break;
      case 'success':
      case 'mentioned-in-passing':
      case 'gene-not-mentioned':
        replaceJobIdInUrl(outcome.jobId);
        setState({
          kind: 'review',
          jobId: outcome.jobId,
          status: outcome,
          publishing: false,
        });
        break;
      case 'text-unavailable':
      case 'internal-error':
      case 'cancelled':
        setState({ kind: 'terminal-error', status: outcome });
        break;
      case 'server-busy':
        setState({
          kind: 'server-busy',
          retryAfterSeconds: outcome.retryAfterSeconds,
        });
        break;
      case 'validation-error':
        setSubmitErrors(outcome.errors);
        setState({ kind: 'idle' });
        break;
      default:
        assertNever(outcome);
    }
  };

  // ---- cancel (polling is the source of truth; the next poll reports it) ----
  const handleCancel = async () => {
    if (state.kind !== 'polling') return;
    const jid = state.jobId;
    setState({ ...state, cancelling: true });
    try {
      await service.deleteAiGenePublicationJob(jid);
    } catch {
      // ignore — the poll loop will report the eventual terminal state
    }
  };

  // ---- publish (create-on-approval) ----
  const handlePublish = async (headline: string, content: string) => {
    if (state.kind !== 'review') return;
    const jid = state.jobId;
    setState({ ...state, publishing: true, publishErrors: undefined });

    let outcome: AiGenePublicationPublishOutcome;
    try {
      outcome = await service.publishAiGenePublication(jid, {
        headline,
        content,
      });
    } catch (error) {
      setState((prev) =>
        prev.kind === 'review'
          ? {
              ...prev,
              publishing: false,
              publishErrors: [
                error instanceof Error ? error.message : String(error),
              ],
            }
          : prev
      );
      return;
    }

    switch (outcome.type) {
      case 'published':
        liftGuard();
        history.push(
          `/user-comments/show?stableId=${encodeURIComponent(
            stableId
          )}&commentTargetId=gene#${outcome.commentId}`
        );
        break;
      case 'not-found':
        setState((prev) =>
          prev.kind === 'review'
            ? {
                ...prev,
                publishing: false,
                publishErrors: [
                  'This result is no longer available — please resubmit.',
                ],
              }
            : prev
        );
        break;
      case 'validation-error': {
        const { errors } = outcome;
        setState((prev) =>
          prev.kind === 'review'
            ? { ...prev, publishing: false, publishErrors: errors }
            : prev
        );
        break;
      }
      default:
        assertNever(outcome);
    }
  };

  // ---- recovery actions ----
  const handleTryDifferentPublication = () => {
    liftGuard();
    clearJobIdFromUrl();
    setExpiredNotice(false);
    setSubmitErrors(undefined);
    setState({ kind: 'idle' });
  };

  const handleBackToGenePage = () => {
    liftGuard();
    history.push(`/record/gene/${encodeURIComponent(stableId)}`);
  };

  // ---- assemble view props ----
  // A detected duplicate must be explicitly acknowledged before submitting.
  const hasUnacknowledgedDuplicate = duplicates.length > 0 && !dupAcknowledged;
  const canSubmit =
    (source === 'pubmed'
      ? /^\d+$/.test(pubmedId.trim())
      : extraction.status === 'ready') && !hasUnacknowledgedDuplicate;

  const duplicateComments = duplicates.map((dup) => ({
    id: dup.id,
    headline: dup.headline,
    content: dup.content,
    href: `/user-comments/show?stableId=${encodeURIComponent(
      stableId
    )}&commentTargetId=gene#${dup.id}`,
  }));

  const formProps: AiGenePublicationAddViewProps['form'] = {
    source,
    onSourceChange: setSource,
    pubmedId,
    onPubmedIdChange: setPubmedId,
    pubmedPreview,
    onFileSelected: handleFileSelected,
    selectedFileName: selectedFile?.name,
    extraction,
    externalUrl,
    onExternalUrlChange: setExternalUrl,
    externalTitle,
    onExternalTitleChange: setExternalTitle,
    duplicates: duplicateComments,
    acknowledged: dupAcknowledged,
    onAcknowledgedChange: setDupAcknowledged,
    canSubmit,
    submitting: state.kind === 'submitting',
    onSubmit: handleSubmit,
  };

  let jobProps: AiGenePublicationAddViewProps['job'] = undefined;
  if (state.kind === 'polling' || state.kind === 'terminal-error') {
    jobProps = {
      status: state.status,
      submitted: submittedSummary,
      startedAt: startedAtRef.current,
      cancelling: state.kind === 'polling' ? state.cancelling : false,
      onCancel: handleCancel,
      onTryDifferentPublication: handleTryDifferentPublication,
      onBackToGenePage: handleBackToGenePage,
    };
  }

  const serverBusyProps =
    state.kind === 'server-busy'
      ? {
          retryAfterSeconds: state.retryAfterSeconds,
          onDismiss: () => setState({ kind: 'idle' }),
        }
      : undefined;

  if (state.kind === 'review') {
    return (
      <div className="wdk-UserComments">
        <AiCommentReviewView
          stableId={stableId}
          status={state.status}
          source={state.status.source}
          pubmedPreview={pubmedPreview}
          publishing={state.publishing}
          publishErrors={state.publishErrors}
          onPublish={handlePublish}
          onTryDifferentPublication={handleTryDifferentPublication}
          onBackToGenePage={handleBackToGenePage}
        />
      </div>
    );
  }

  return (
    <div className="wdk-UserComments">
      {submitErrors != null && submitErrors.length > 0 && (
        <div
          role="alert"
          style={{
            maxWidth: '720px',
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
            {submitErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <AiGenePublicationAddView
        stableId={stableId}
        form={formProps}
        job={jobProps}
        expiredNotice={expiredNotice}
        serverBusy={serverBusyProps}
      />
      {state.kind === 'polling' && reconnecting && (
        <div
          style={{
            maxWidth: '720px',
            color: '#888',
            fontSize: '13px',
            marginTop: '8px',
          }}
        >
          Reconnecting…
        </div>
      )}
    </div>
  );
}

export default wrappable(AiGenePublicationAddController);
