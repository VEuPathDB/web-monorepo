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
import { jsx as _jsx } from 'react/jsx-runtime';
import { render, screen, waitFor } from '@testing-library/react';
// Imported from this nested path (not the hoisted top-level
// @testing-library/dom) because @testing-library/react 12.1.2 bundles its
// own copy of @testing-library/dom; configuring the top-level copy would
// not affect the `config` singleton that `screen`/`render` actually read.
// eslint-disable-next-line import/no-extraneous-dependencies
import { configure } from '@testing-library/react/node_modules/@testing-library/dom';
import { ComputeJobPage } from './ComputeJobPage';
// useJobPolling (Task 5) schedules its first real poll 2s after mount (the
// fastest tier in polling-schedule.ts), which exceeds RTL's default 1000ms
// findBy/waitFor timeout. Real timers are kept (rather than faking them) so
// this test exercises the same setTimeout-driven loop the browser runs;
// only the assertion wait budget is widened.
configure({ asyncUtilTimeout: 4000 });
jest.setTimeout(10000);
function makeFakeApi(overrides = {}) {
  return Object.assign(
    { fetchJob: jest.fn(), fetchJobFiles: jest.fn(), fetchJobFile: jest.fn() },
    overrides
  );
}
describe('ComputeJobPage', () => {
  it('shows the title and params summary while queued', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const api = makeFakeApi({
        fetchJob: jest
          .fn()
          .mockResolvedValue({ jobID: 'abc', status: 'queued' }),
      });
      render(
        _jsx(ComputeJobPage, {
          jobId: 'abc',
          api: api,
          paramsSummary: '13 Transcripts, FASTA output format',
        })
      );
      expect(
        yield screen.findByText('Clustal Omega Job Status')
      ).toBeInTheDocument();
      expect(
        screen.getByText('13 Transcripts, FASTA output format')
      ).toBeInTheDocument();
    }));
  // showResultDocument (invoked on complete) mutates the live `document` in
  // place — for a non-HTML format that's just document.body.textContent,
  // safe to let run for real in JSDOM. The HTML-format branch replaces
  // document.documentElement itself, which would tear down the JSDOM
  // document RTL's own container lives in, so that path is covered by
  // spying on DOMParser/replaceChild instead of letting it actually run.
  it('fetches the result and shows it as plain text on complete', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const api = makeFakeApi({
        fetchJob: jest
          .fn()
          .mockResolvedValue({ jobID: 'abc', status: 'complete' }),
        fetchJobFile: jest.fn().mockResolvedValue('CLUSTAL O alignment text'),
      });
      render(_jsx(ComputeJobPage, { jobId: 'abc', api: api }));
      yield waitFor(() => {
        expect(document.body.textContent).toBe('CLUSTAL O alignment text');
      });
      expect(api.fetchJobFile).toHaveBeenCalledWith('abc', 'output');
    }));
  it('parses and swaps in the full document for the clustal_dnd format', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const api = makeFakeApi({
        fetchJob: jest
          .fn()
          .mockResolvedValue({ jobID: 'abc', status: 'complete' }),
        fetchJobFile: jest
          .fn()
          .mockResolvedValue('<!DOCTYPE html><html><body>result</body></html>'),
      });
      const parseFromString = jest.spyOn(
        DOMParser.prototype,
        'parseFromString'
      );
      const replaceChild = jest
        .spyOn(document, 'replaceChild')
        // Actually swapping document.documentElement would tear down JSDOM's
        // own document for the rest of this test file's suite — no-op it.
        .mockImplementation((node) => node);
      try {
        render(
          _jsx(ComputeJobPage, {
            jobId: 'abc',
            api: api,
            format: 'clustal_dnd',
          })
        );
        yield waitFor(() => {
          expect(replaceChild).toHaveBeenCalled();
        });
        expect(parseFromString).toHaveBeenCalledWith(
          '<!DOCTYPE html><html><body>result</body></html>',
          'text/html'
        );
      } finally {
        parseFromString.mockRestore();
        replaceChild.mockRestore();
      }
    }));
  it('shows a dead-end message on failed with no retry action', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const api = makeFakeApi({
        fetchJob: jest
          .fn()
          .mockResolvedValue({ jobID: 'abc', status: 'failed' }),
      });
      render(_jsx(ComputeJobPage, { jobId: 'abc', api: api }));
      expect(yield screen.findByText(/job failed/i)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /retry|rerun/i })
      ).not.toBeInTheDocument();
    }));
  it('shows a dead-end message on expired with no retry action', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const api = makeFakeApi({
        fetchJob: jest
          .fn()
          .mockResolvedValue({ jobID: 'abc', status: 'expired' }),
      });
      render(_jsx(ComputeJobPage, { jobId: 'abc', api: api }));
      expect(yield screen.findByText(/expired/i)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /retry|rerun/i })
      ).not.toBeInTheDocument();
    }));
});
//# sourceMappingURL=ComputeJobPage.test.js.map
