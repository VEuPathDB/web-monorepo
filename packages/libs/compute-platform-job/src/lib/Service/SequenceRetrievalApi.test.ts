import { SequenceRetrievalApi } from './SequenceRetrievalApi';

function makeFakeWdkService() {
  return {
    getCurrentUser: async () => ({ id: 1, isGuest: true }),
  } as any;
}

function mockFetchOnce(body: unknown, contentType = 'application/json') {
  const responseBody =
    contentType === 'application/json'
      ? JSON.stringify(body)
      : (body as string);
  const fetchMock = jest.fn().mockResolvedValue(
    new Response(responseBody, {
      status: 200,
      headers: { 'Content-Type': contentType },
    })
  );
  return fetchMock;
}

describe('SequenceRetrievalApi', () => {
  it('submitJob POSTs to /sequences-async/{sequenceType} with a JSON body', async () => {
    const fetchMock = mockFetchOnce({ jobID: 'abc123', status: 'queued' });
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.submitJob('genomic', {
      features: [{ contig: 'PF3D7_0200300', start: 0, end: 500 }],
      postProcess: 'MSA',
      msaOptions: { format: 'clustal' },
    });

    expect(result).toEqual({ jobID: 'abc123', status: 'queued' });
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe('https://srt.example.org/sequences-async/genomic');
    expect(request.method).toBe('POST');
    const sentBody = JSON.parse(await request.clone().text());
    expect(sentBody.features[0].contig).toBe('PF3D7_0200300');
  });

  it('fetchJob GETs /jobs/{id}', async () => {
    const fetchMock = mockFetchOnce({ jobID: 'abc123', status: 'in-progress' });
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.fetchJob('abc123');

    expect(result.status).toBe('in-progress');
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe('https://srt.example.org/jobs/abc123');
    expect(request.method).toBe('GET');
  });

  it('fetchJobFiles GETs /jobs/{id}/files and returns the filename list', async () => {
    const fetchMock = mockFetchOnce(['output', 'guidetree.dnd']);
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.fetchJobFiles('abc123');

    expect(result).toEqual(['output', 'guidetree.dnd']);
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe('https://srt.example.org/jobs/abc123/files');
  });

  it('fetchJobFile GETs /jobs/{id}/files/{name} and returns raw text', async () => {
    const fetchMock = mockFetchOnce('CLUSTAL O alignment output', 'text/plain');
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.fetchJobFile('abc123', 'output');

    expect(result).toBe('CLUSTAL O alignment output');
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe(
      'https://srt.example.org/jobs/abc123/files/output'
    );
  });
});
