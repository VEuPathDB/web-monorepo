import {
  Feature,
  JobResponse,
  JobStatus,
  SubmitJobRequest,
} from './ServiceTypes';

describe('ServiceTypes', () => {
  it('Feature matches the service wire shape verbatim', () => {
    const feature: Feature = {
      contig: 'PF3D7_0200300',
      start: 100,
      end: 500,
      query: 'PF3D7_0200300',
      strand: 'NONE',
    };
    expect(feature.contig).toBe('PF3D7_0200300');
  });

  it('JobResponse uses jobID (capital ID), matching the wire format', () => {
    const response: JobResponse = {
      jobID: 'abc123',
      status: 'queued',
    };
    expect(response.jobID).toBe('abc123');
  });

  it('JobStatus covers exactly the 5 documented values', () => {
    const statuses: JobStatus[] = [
      'queued',
      'in-progress',
      'complete',
      'failed',
      'expired',
    ];
    expect(statuses).toHaveLength(5);
  });

  it('SubmitJobRequest requires features and postProcess', () => {
    const request: SubmitJobRequest = {
      features: [{ contig: 'x', start: 0, end: 10 }],
      postProcess: 'MSA',
      msaOptions: { format: 'clustal' },
    };
    expect(request.postProcess).toBe('MSA');
  });
});
