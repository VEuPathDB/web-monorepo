import { render, screen, waitFor } from '@testing-library/react';
// Imported from this nested path (not the hoisted top-level
// @testing-library/dom) because @testing-library/react 12.1.2 bundles its
// own copy of @testing-library/dom; configuring the top-level copy would
// not affect the `config` singleton that `screen`/`render` actually read.
// eslint-disable-next-line import/no-extraneous-dependencies
import { configure } from '@testing-library/react/node_modules/@testing-library/dom';
import { ComputeJobPage } from './ComputeJobPage';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

// useJobPolling (Task 5) schedules its first real poll 2s after mount (the
// fastest tier in polling-schedule.ts), which exceeds RTL's default 1000ms
// findBy/waitFor timeout. Real timers are kept (rather than faking them) so
// this test exercises the same setTimeout-driven loop the browser runs;
// only the assertion wait budget is widened.
configure({ asyncUtilTimeout: 4000 });
jest.setTimeout(10000);

function makeFakeApi(overrides: Partial<SequenceRetrievalApi> = {}) {
  return {
    fetchJob: jest.fn(),
    fetchJobFiles: jest.fn(),
    fetchJobFile: jest.fn(),
    ...overrides,
  } as unknown as SequenceRetrievalApi;
}

describe('ComputeJobPage', () => {
  it('shows the title and params summary while queued', async () => {
    const api = makeFakeApi({
      fetchJob: jest.fn().mockResolvedValue({ jobID: 'abc', status: 'queued' }),
    });

    render(
      <ComputeJobPage
        jobId="abc"
        api={api}
        paramsSummary="13 Transcripts, FASTA output format"
      />
    );

    expect(await screen.findByText('Running Compute Job')).toBeInTheDocument();
    expect(
      screen.getByText('13 Transcripts, FASTA output format')
    ).toBeInTheDocument();
  });

  it('fetches the result and replaces the page with a blob URL on complete', async () => {
    const api = makeFakeApi({
      fetchJob: jest
        .fn()
        .mockResolvedValue({ jobID: 'abc', status: 'complete' }),
      fetchJobFile: jest.fn().mockResolvedValue('CLUSTAL O alignment text'),
    });

    // JSDOM doesn't implement URL.createObjectURL at all, so there's
    // nothing for jest.spyOn to wrap — assign a mock directly.
    const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    (URL as any).createObjectURL = createObjectURL;
    const replace = jest.fn();
    const originalLocation = window.location;
    // @ts-expect-error - deleting to allow a mock replacement, restored below
    delete window.location;
    window.location = { ...originalLocation, replace } as Location;

    try {
      render(<ComputeJobPage jobId="abc" api={api} />);

      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith('blob:mock-url');
      });

      expect(api.fetchJobFile).toHaveBeenCalledWith('abc', 'output');
      const [[blobArg]]: [Blob][] = createObjectURL.mock.calls;
      expect(blobArg.type).toBe('text/plain');
    } finally {
      window.location = originalLocation;
      delete (URL as any).createObjectURL;
    }
  });

  it('uses text/html for the clustal_dnd format', async () => {
    const api = makeFakeApi({
      fetchJob: jest
        .fn()
        .mockResolvedValue({ jobID: 'abc', status: 'complete' }),
      fetchJobFile: jest.fn().mockResolvedValue('<html></html>'),
    });

    const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    (URL as any).createObjectURL = createObjectURL;
    const replace = jest.fn();
    const originalLocation = window.location;
    // @ts-expect-error - deleting to allow a mock replacement, restored below
    delete window.location;
    window.location = { ...originalLocation, replace } as Location;

    try {
      render(<ComputeJobPage jobId="abc" api={api} format="clustal_dnd" />);

      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith('blob:mock-url');
      });

      const [[blobArg]]: [Blob][] = createObjectURL.mock.calls;
      expect(blobArg.type).toBe('text/html');
    } finally {
      window.location = originalLocation;
      delete (URL as any).createObjectURL;
    }
  });

  it('shows a dead-end message on failed with no retry action', async () => {
    const api = makeFakeApi({
      fetchJob: jest.fn().mockResolvedValue({ jobID: 'abc', status: 'failed' }),
    });

    render(<ComputeJobPage jobId="abc" api={api} />);

    expect(await screen.findByText(/job failed/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry|rerun/i })
    ).not.toBeInTheDocument();
  });

  it('shows a dead-end message on expired with no retry action', async () => {
    const api = makeFakeApi({
      fetchJob: jest
        .fn()
        .mockResolvedValue({ jobID: 'abc', status: 'expired' }),
    });

    render(<ComputeJobPage jobId="abc" api={api} />);

    expect(await screen.findByText(/expired/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry|rerun/i })
    ).not.toBeInTheDocument();
  });
});
