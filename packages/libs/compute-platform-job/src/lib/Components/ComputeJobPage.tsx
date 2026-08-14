import { useCallback, useEffect, useState } from 'react';

// Deep import, not the @veupathdb/wdk-client/lib/Components barrel — that
// barrel transitively pulls in AttributeFilter/Histogram.js, which requires
// 'jquery', a dependency this package never otherwise needs.
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';

import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';
import { JobStatus } from '../Service/ServiceTypes';
import { useJobPolling } from '../Hooks/useJobPolling';

// Same icon/animation as user-datasets' UserDatasetStatus.tsx polling
// spinner (StatusIcon--polling); the color is wdk-client's $blue, imported
// via Sass so it stays in sync with the shared palette rather than a
// hardcoded copy.
import './ComputeJobPage.scss';

interface ComputeJobPageProps {
  jobId: string;
  api: SequenceRetrievalApi;
  paramsSummary?: string;
  /** The MsaFormat value the job was submitted with, e.g. 'clustal_dnd'. */
  format?: string;
}

// The /files/{name} endpoint always returns Content-Type: text/plain
// regardless of the actual content, so an HTML-producing format (only
// clustal_dnd today) needs to be recognized and rendered as real HTML
// client-side — otherwise the browser (or React) would just show the raw
// markup as literal text.
const HTML_MSA_FORMATS = new Set(['clustal_dnd']);

// Swaps the live document in place with the fetched result, same URL, no
// navigation — same as visiting a static result page directly (matching
// the old CGI flow, which always returned a standalone document). This
// intentionally tears down the React app on this tab: there's nothing left
// for it to render once the real result is showing. A fresh visit/reload of
// this URL always remounts ComputeJobPage first and re-derives status live,
// so a bookmark still lands back on the polling UI for an incomplete job,
// and repeats this same swap deterministically for an already-complete one.
function showResultDocument(content: string, format: string | undefined) {
  if (format != null && HTML_MSA_FORMATS.has(format)) {
    const parsed = new DOMParser().parseFromString(content, 'text/html');
    document.replaceChild(
      document.importNode(parsed.documentElement, true),
      document.documentElement
    );
  } else {
    document.title = 'Multiple Sequence Alignment';
    document.body.textContent = content;
  }
}

export function ComputeJobPage({
  jobId,
  api,
  paramsSummary,
  format,
}: ComputeJobPageProps) {
  const [status, setStatus] = useState<JobStatus>('queued');

  const onPoll = useCallback(async () => {
    const job = await api.fetchJob(jobId);
    setStatus(job.status);
  }, [api, jobId]);

  useJobPolling({ status, onPoll });

  useEffect(() => {
    if (status !== 'complete') return;
    let cancelled = false;
    (async () => {
      const output = await api.fetchJobFile(jobId, 'output');
      if (cancelled) return;
      // The 'output' file is already the complete document for every
      // format — for clustal_dnd it includes the guide tree as its own
      // section (<hr><h4>Guide Tree...) — no separate file to fetch/concat.
      showResultDocument(output, format);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, api, jobId, format]);

  return (
    <div className="ComputeJobPage">
      <h1>Clustal Omega Job Status</h1>
      <div style={{ fontSize: '1.5em' }}>
        {paramsSummary && <p className="ParamsSummary">{paramsSummary}</p>}
        {status === 'queued' || status === 'in-progress' ? (
          <p className="Status">
            <Icon
              className="ComputeJobPage-StatusIcon"
              fa="circle-o-notch"
              style={{ marginRight: '0.3em' }}
            />
            Status: {status}
          </p>
        ) : null}
        {status === 'failed' && (
          <p className="DeadEnd">
            This job failed. Please go back and resubmit your request.
          </p>
        )}
        {status === 'expired' && (
          <p className="DeadEnd">
            This job has expired. Please go back and resubmit your request.
          </p>
        )}
      </div>
    </div>
  );
}
