import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import {
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
}

/**
 * Submits an MSA job and navigates a pre-opened tab to its result page.
 *
 * The tab must be opened synchronously by the caller's event handler,
 * before any await, or browsers may treat it as no longer "in direct
 * response to a user gesture" and silently block it as a popup — this
 * function itself does the opening (as its very first, synchronous
 * statement) so every caller gets that guarantee for free.
 */
export async function submitClustalMsaJob({
  api,
  sequenceType,
  features,
  msaFormat,
  resultRouteBase,
  paramsSummary,
}: SubmitClustalMsaJobOptions): Promise<void> {
  const resultTab = window.open('about:blank', '_blank');

  try {
    const job = await api.submitJob(sequenceType, {
      features,
      postProcess: 'MSA',
      msaOptions: { format: msaFormat },
    });

    // The already-open tab can't receive React Router location.state, so
    // paramsSummary/format travel as query params instead.
    const resultUrl = new URL(
      `${window.location.origin}${resultRouteBase}/result/${job.jobID}`
    );
    resultUrl.searchParams.set('paramsSummary', paramsSummary);
    resultUrl.searchParams.set('format', msaFormat);
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
