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
import { render, screen } from '@testing-library/react';
// Imported from this nested path (not the hoisted top-level
// @testing-library/dom) because @testing-library/react 12.1.2 bundles its
// own copy of @testing-library/dom; configuring the top-level copy would
// not affect the `config` singleton that `screen`/`render` actually read.
// eslint-disable-next-line import/no-extraneous-dependencies
import { configure } from '@testing-library/react/node_modules/@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import { ComputeJobRouter } from './ComputeJobRouter';
// useJobPolling (Task 5) schedules its first real poll 2s after mount (the
// fastest tier in polling-schedule.ts), which exceeds RTL's default 1000ms
// findBy/waitFor timeout. Real timers are kept (rather than faking them) so
// this test exercises the same setTimeout-driven loop the browser runs;
// only the assertion wait budget is widened.
configure({ asyncUtilTimeout: 4000 });
jest.setTimeout(10000);
function makeFakeApi() {
  return {
    fetchJob: jest.fn().mockResolvedValue({ jobID: 'abc', status: 'queued' }),
    fetchJobFiles: jest.fn(),
    fetchJobFile: jest.fn(),
  };
}
describe('ComputeJobRouter', () => {
  it('renders ComputeJobPage for /result/:jobId', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      render(
        _jsx(
          MemoryRouter,
          Object.assign(
            { initialEntries: ['/result/abc123'] },
            { children: _jsx(ComputeJobRouter, { api: makeFakeApi() }) }
          )
        )
      );
      expect(
        yield screen.findByText('Clustal Omega Job Status')
      ).toBeInTheDocument();
    }));
  it('forwards paramsSummary from the query string to ComputeJobPage', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      render(
        _jsx(
          MemoryRouter,
          Object.assign(
            {
              initialEntries: [
                '/result/abc123?paramsSummary=13+Transcripts%2C+FASTA+output+format',
              ],
            },
            { children: _jsx(ComputeJobRouter, { api: makeFakeApi() }) }
          )
        )
      );
      expect(
        yield screen.findByText('13 Transcripts, FASTA output format')
      ).toBeInTheDocument();
    }));
  it('does not throw when the query string is missing (e.g. bookmarked URL)', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      render(
        _jsx(
          MemoryRouter,
          Object.assign(
            { initialEntries: ['/result/abc123'] },
            { children: _jsx(ComputeJobRouter, { api: makeFakeApi() }) }
          )
        )
      );
      expect(
        yield screen.findByText('Clustal Omega Job Status')
      ).toBeInTheDocument();
    }));
});
//# sourceMappingURL=ComputeJobRouter.test.js.map
