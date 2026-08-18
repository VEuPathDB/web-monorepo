var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useCallback, useEffect, useState } from 'react';
// Deep import, not the @veupathdb/wdk-client/lib/Components barrel — that
// barrel transitively pulls in AttributeFilter/Histogram.js, which requires
// 'jquery', a dependency this package never otherwise needs.
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { useJobPolling } from '../Hooks/useJobPolling';
// Same icon/animation values as user-datasets' UserDatasetStatus.tsx
// polling spinner (StatusIcon--polling in UserDatasets.scss) — no shared
// component/stylesheet exists to import across packages, so the values are
// reproduced locally rather than introducing a cross-package CSS
// dependency for one animation.
const SPIN_STYLE = `
  @keyframes ComputeJobPage-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .ComputeJobPage-StatusIcon {
    animation: ComputeJobPage-spin 1.6s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .ComputeJobPage-StatusIcon {
      animation: none;
    }
  }
`;
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
function showResultDocument(content, format) {
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
export function ComputeJobPage({ jobId, api, paramsSummary, format }) {
  const [status, setStatus] = useState('queued');
  const onPoll = useCallback(
    () =>
      __awaiter(this, void 0, void 0, function* () {
        const job = yield api.fetchJob(jobId);
        setStatus(job.status);
      }),
    [api, jobId]
  );
  useJobPolling({ status, onPoll });
  useEffect(() => {
    if (status !== 'complete') return;
    let cancelled = false;
    (() =>
      __awaiter(this, void 0, void 0, function* () {
        const output = yield api.fetchJobFile(jobId, 'output');
        if (cancelled) return;
        // The 'output' file is already the complete document for every
        // format — for clustal_dnd it includes the guide tree as its own
        // section (<hr><h4>Guide Tree...) — no separate file to fetch/concat.
        showResultDocument(output, format);
      }))();
    return () => {
      cancelled = true;
    };
  }, [status, api, jobId, format]);
  return _jsxs(
    'div',
    Object.assign(
      { className: 'ComputeJobPage' },
      {
        children: [
          _jsx('style', { children: SPIN_STYLE }),
          _jsx('h1', { children: 'Clustal Omega Job Status' }),
          _jsxs(
            'div',
            Object.assign(
              { style: { fontSize: '1.25em' } },
              {
                children: [
                  paramsSummary &&
                    _jsx(
                      'p',
                      Object.assign(
                        { className: 'ParamsSummary' },
                        { children: paramsSummary }
                      )
                    ),
                  status === 'queued' || status === 'in-progress'
                    ? _jsxs(
                        'p',
                        Object.assign(
                          { className: 'Status' },
                          {
                            children: [
                              _jsx(Icon, {
                                className: 'ComputeJobPage-StatusIcon',
                                fa: 'circle-o-notch',
                                style: { marginRight: '0.3em' },
                              }),
                              'Status: ',
                              status,
                            ],
                          }
                        )
                      )
                    : null,
                  status === 'failed' &&
                    _jsx(
                      'p',
                      Object.assign(
                        { className: 'DeadEnd' },
                        {
                          children:
                            'This job failed. Please go back and resubmit your request.',
                        }
                      )
                    ),
                  status === 'expired' &&
                    _jsx(
                      'p',
                      Object.assign(
                        { className: 'DeadEnd' },
                        {
                          children:
                            'This job has expired. Please go back and resubmit your request.',
                        }
                      )
                    ),
                ],
              }
            )
          ),
        ],
      }
    )
  );
}
//# sourceMappingURL=ComputeJobPage.js.map
