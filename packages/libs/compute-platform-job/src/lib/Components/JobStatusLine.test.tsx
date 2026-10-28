import { act, render, screen } from '@testing-library/react';
import { JobStatusLine } from './JobStatusLine';

describe('JobStatusLine', () => {
  it('shows the queue position while queued', () => {
    render(<JobStatusLine status="queued" job={{ queuePosition: 3 }} />);
    expect(screen.getByText(/position 3 in queue/i)).toBeInTheDocument();
  });

  it('says just "Queued." without a queue position', () => {
    render(<JobStatusLine status="queued" job={{}} />);
    expect(screen.getByText('Queued.')).toBeInTheDocument();
  });

  describe('in progress', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('shows the time elapsed since the job started, ticking each second', () => {
      jest.setSystemTime(new Date('2026-09-27T12:01:20.000Z'));
      render(
        <JobStatusLine
          status="in-progress"
          job={{ started: '2026-09-27T12:00:00.000Z' }}
        />
      );
      expect(screen.getByText(/in progress/i)).toBeInTheDocument();
      expect(screen.getByText(/running for 1:20/i)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(screen.getByText(/running for 1:25/i)).toBeInTheDocument();
    });

    it('shows 0:00 rather than a negative time when the browser clock is behind', () => {
      jest.setSystemTime(new Date('2026-09-27T11:59:58.000Z'));
      render(
        <JobStatusLine
          status="in-progress"
          job={{ started: '2026-09-27T12:00:00.000Z' }}
        />
      );
      expect(screen.getByText(/running for 0:00/i)).toBeInTheDocument();
    });
  });

  it("shows the caller's estimate while running", () => {
    render(
      <JobStatusLine status="in-progress" job={{}} estimatedSeconds={261} />
    );
    expect(screen.getByText(/estimated: 4:21/i)).toBeInTheDocument();
  });

  it('does not show the estimate while queued', () => {
    render(<JobStatusLine status="queued" job={{}} estimatedSeconds={261} />);
    expect(screen.queryByText(/estimated/i)).not.toBeInTheDocument();
  });

  it.each(['complete', 'failed', 'expired'] as const)(
    'renders nothing once the job is %s',
    (status) => {
      const { container } = render(<JobStatusLine status={status} job={{}} />);
      expect(container).toBeEmptyDOMElement();
    }
  );
});
