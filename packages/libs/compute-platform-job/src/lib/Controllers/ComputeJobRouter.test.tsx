import { render, screen } from '@testing-library/react';
// Imported from this nested path (not the hoisted top-level
// @testing-library/dom) because @testing-library/react 12.1.2 bundles its
// own copy of @testing-library/dom; configuring the top-level copy would
// not affect the `config` singleton that `screen`/`render` actually read.
// eslint-disable-next-line import/no-extraneous-dependencies
import { configure } from '@testing-library/react/node_modules/@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import { ComputeJobRouter } from './ComputeJobRouter';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

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
  } as unknown as SequenceRetrievalApi;
}

describe('ComputeJobRouter', () => {
  it('renders ComputeJobPage for /result/:jobId', async () => {
    render(
      <MemoryRouter initialEntries={['/result/abc123']}>
        <ComputeJobRouter api={makeFakeApi()} />
      </MemoryRouter>
    );

    expect(await screen.findByText('Clustalo Job Status')).toBeInTheDocument();
  });

  it('forwards paramsSummary from the query string to ComputeJobPage', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/result/abc123?paramsSummary=13+Transcripts%2C+FASTA+output+format',
        ]}
      >
        <ComputeJobRouter api={makeFakeApi()} />
      </MemoryRouter>
    );

    expect(
      await screen.findByText('13 Transcripts, FASTA output format')
    ).toBeInTheDocument();
  });

  it('does not throw when the query string is missing (e.g. bookmarked URL)', async () => {
    render(
      <MemoryRouter initialEntries={['/result/abc123']}>
        <ComputeJobRouter api={makeFakeApi()} />
      </MemoryRouter>
    );

    expect(await screen.findByText('Clustalo Job Status')).toBeInTheDocument();
  });
});
