import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import {
  DeflineFormat,
  Feature,
  MsaFormat,
  SequenceType,
} from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';
import { endpoint } from '../config';

/**
 * Parses standard 6-column BED text (chrom, chromStart, chromEnd, name,
 * score, strand) into Feature[]. Shared by any feature that resolves a WDK
 * 'bed' report into sequence-retrieval-service Feature coordinates.
 */
export function parseBedToFeatures(bedText: string): Feature[] {
  return bedText
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [chrom, chromStart, chromEnd, name, , strandSymbol] =
        line.split('\t');
      return {
        contig: chrom,
        start: Number(chromStart),
        end: Number(chromEnd),
        query: name,
        strand:
          strandSymbol === '+'
            ? 'POSITIVE'
            : strandSymbol === '-'
            ? 'NEGATIVE'
            : 'NONE',
      } as Feature;
    });
}

/**
 * Temporary-result paths are plain GET-able URLs relative to the WDK
 * service base (the same base the site's own WDK requests use). That base
 * comes from the site's build-time config (window.__SITE_CONFIG__), not
 * from WdkService#getConfig() — the latter's ServiceConfig has no
 * service-base-URL field.
 */
export async function fetchTemporaryResultText(
  temporaryResultPath: string
): Promise<string> {
  const response = await fetch(`${endpoint}${temporaryResultPath}`);
  return response.text();
}

interface SubmitClustalMsaJobOptions {
  api: SequenceRetrievalApi;
  sequenceType: SequenceType;
  features: Feature[];
  msaFormat: MsaFormat;
  /** e.g. "/app/workspace/msa" — the result path is `${resultRouteBase}/result/${jobID}`. */
  resultRouteBase: string;
  /** Shown on the result page; e.g. "13 Transcripts, CLUSTAL output format". */
  paramsSummary: string;
  /**
   * A tab already opened (via `window.open`) by the caller, as the very
   * first, synchronous statement of its click/confirm handler — before any
   * `await`. Browsers block a popup that isn't opened synchronously within
   * a user gesture's call stack, so this function cannot safely open the
   * tab itself once any awaited work (e.g. resolving features from a
   * network report) precedes the submission.
   */
  resultTab: Window | null;
  percentActg?: number;
}

interface OpenTabAndSubmitMsaJobOptions {
  api: SequenceRetrievalApi;
  /** Resolves the Feature[] to submit — may itself do network work (e.g. a bed-report fetch). */
  resolveFeatures: () => Promise<Feature[]>;
  sequenceType: SequenceType;
  msaFormat: MsaFormat;
  /** e.g. "/workspace/msa" — the result path is `${resultRouteBase}/result/${jobID}`. */
  resultRouteBase: string;
  /**
   * Shown on the result page; e.g. "13 Transcripts, CLUSTAL output format".
   * A function receives the resolved Feature[] — for callers whose sequence
   * count is only known accurately after resolveFeatures runs (e.g. a bed
   * report's actual row count, vs. an upstream filter's pre-submission
   * estimate).
   */
  paramsSummary: string | ((features: Feature[]) => string);
  percentActg?: number;
}

/**
 * Opens a blank tab, resolves features, submits an MSA job, and navigates
 * the tab to its result page — the full open/resolve/submit/navigate
 * sequence shared by every MSA confirm handler in this codebase.
 *
 * The tab is opened as this function's very first, synchronous statement,
 * before any await — calling an async function still runs its body
 * synchronously up to the first await, so as long as the caller invokes
 * this from a user gesture (e.g. a click handler) without itself awaiting
 * anything first, window.open still executes within that gesture's call
 * stack and isn't blocked as a popup.
 */
export async function openTabAndSubmitMsaJob({
  api,
  resolveFeatures,
  sequenceType,
  msaFormat,
  resultRouteBase,
  paramsSummary,
  percentActg,
}: OpenTabAndSubmitMsaJobOptions): Promise<void> {
  const resultTab = window.open('about:blank', '_blank');
  // The tab sits blank for several seconds while features are resolved and
  // the job is submitted (both awaited below, in series) — write a
  // placeholder so it isn't literally empty in the meantime.
  // submitClustalMsaJob replaces this entirely once the job is submitted
  // and it navigates to the real result page.
  resultTab?.document?.write('<p>Preparing your alignment…</p>');

  try {
    const features = await resolveFeatures();

    await submitClustalMsaJob({
      api,
      sequenceType,
      features,
      msaFormat,
      resultRouteBase,
      paramsSummary:
        typeof paramsSummary === 'function'
          ? paramsSummary(features)
          : paramsSummary,
      resultTab,
      percentActg,
    });
  } catch (error) {
    // submitClustalMsaJob already closes resultTab on its own failure
    // (the job-submission call itself rejecting); this catch exists for
    // failures in resolveFeatures, which runs before submitClustalMsaJob
    // is ever called.
    if (resultTab && !resultTab.closed) {
      resultTab.close();
    }
    throw error;
  }
}

/**
 * Submits an MSA job and navigates a pre-opened tab to its result page.
 *
 * The tab must be opened synchronously by the caller's event handler,
 * before any await, or browsers may treat it as no longer "in direct
 * response to a user gesture" and silently block it as a popup — see
 * `resultTab` above.
 */
export async function submitClustalMsaJob({
  api,
  sequenceType,
  features,
  msaFormat,
  resultRouteBase,
  paramsSummary,
  resultTab,
  percentActg,
}: SubmitClustalMsaJobOptions): Promise<void> {
  try {
    const job = await api.submitJob(sequenceType, {
      features,
      postProcess: 'MSA',
      msaOptions: { format: msaFormat },
      percentActg,
    });

    // The already-open tab can't receive React Router location.state, so
    // paramsSummary/format/sequenceCount travel as query params instead.
    const resultUrl = new URL(
      `${window.location.origin}${resultRouteBase}/result/${job.jobID}`
    );
    resultUrl.searchParams.set('paramsSummary', paramsSummary);
    resultUrl.searchParams.set('format', msaFormat);
    resultUrl.searchParams.set('sequenceCount', String(features.length));
    if (resultTab) {
      resultTab.location.replace(resultUrl.toString());
    }
  } catch (error) {
    // Don't leave a dead blank tab open if submit fails — the caller's own
    // confirm-dialog error handling shows the failure in the original tab.
    if (resultTab) {
      resultTab.close();
    }
    throw error;
  }
}

interface SubmitSyncFastaRequestOptions {
  api: SequenceRetrievalApi;
  sequenceType: SequenceType;
  features: Feature[];
  deflineFormat?: DeflineFormat;
  basesPerLine?: number;
  percentActg?: number;
}

/**
 * Fetches FASTA text synchronously (no job/polling) and returns it directly,
 * unlike submitClustalMsaJob's async job + tab-navigation flow. The caller
 * writes the returned text into its own pre-opened tab.
 */
export async function submitSyncFastaRequest({
  api,
  sequenceType,
  features,
  deflineFormat,
  basesPerLine,
  percentActg,
}: SubmitSyncFastaRequestOptions): Promise<string> {
  return api.fetchSequencesSync(sequenceType, {
    features,
    deflineFormat,
    basesPerLine,
    percentActg,
  });
}
