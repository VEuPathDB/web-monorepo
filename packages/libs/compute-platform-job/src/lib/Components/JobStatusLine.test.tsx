import { render, screen } from '@testing-library/react';
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

  it('shows in-progress with the start time', () => {
    render(
      <JobStatusLine
        status="in-progress"
        job={{ started: '2026-09-27T12:00:00.000Z' }}
      />
    );
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/started running at/i)).toBeInTheDocument();
  });

  it.each(['complete', 'failed', 'expired'] as const)(
    'renders nothing once the job is %s',
    (status) => {
      const { container } = render(<JobStatusLine status={status} job={{}} />);
      expect(container).toBeEmptyDOMElement();
    }
  );
});
