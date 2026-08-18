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
import { SequenceRetrievalApi } from './SequenceRetrievalApi';
function makeFakeWdkService() {
  return {
    getCurrentUser: () =>
      __awaiter(this, void 0, void 0, function* () {
        return { id: 1, isGuest: true };
      }),
  };
}
function mockFetchOnce(body, contentType = 'application/json') {
  const responseBody =
    contentType === 'application/json' ? JSON.stringify(body) : body;
  const fetchMock = jest.fn().mockResolvedValue(
    new Response(responseBody, {
      status: 200,
      headers: { 'Content-Type': contentType },
    })
  );
  return fetchMock;
}
describe('SequenceRetrievalApi', () => {
  it('submitJob POSTs to /sequences-async/{sequenceType} with a JSON body', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const fetchMock = mockFetchOnce({ jobID: 'abc123', status: 'queued' });
      const api = new SequenceRetrievalApi(
        { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
        makeFakeWdkService()
      );
      const result = yield api.submitJob('genomic', {
        features: [{ contig: 'PF3D7_0200300', start: 0, end: 500 }],
        postProcess: 'MSA',
        msaOptions: { format: 'clustal' },
      });
      expect(result).toEqual({ jobID: 'abc123', status: 'queued' });
      const [request] = fetchMock.mock.calls[0];
      expect(request.url).toBe(
        'https://srt.example.org/sequences-async/genomic'
      );
      expect(request.method).toBe('POST');
      const sentBody = JSON.parse(yield request.clone().text());
      expect(sentBody.features[0].contig).toBe('PF3D7_0200300');
    }));
  it('fetchJob GETs /jobs/{id}', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const fetchMock = mockFetchOnce({
        jobID: 'abc123',
        status: 'in-progress',
      });
      const api = new SequenceRetrievalApi(
        { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
        makeFakeWdkService()
      );
      const result = yield api.fetchJob('abc123');
      expect(result.status).toBe('in-progress');
      const [request] = fetchMock.mock.calls[0];
      expect(request.url).toBe('https://srt.example.org/jobs/abc123');
      expect(request.method).toBe('GET');
    }));
  it('fetchJobFiles GETs /jobs/{id}/files and returns the filename list', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const fetchMock = mockFetchOnce(['output', 'guidetree.dnd']);
      const api = new SequenceRetrievalApi(
        { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
        makeFakeWdkService()
      );
      const result = yield api.fetchJobFiles('abc123');
      expect(result).toEqual(['output', 'guidetree.dnd']);
      const [request] = fetchMock.mock.calls[0];
      expect(request.url).toBe('https://srt.example.org/jobs/abc123/files');
    }));
  it('fetchJobFile GETs /jobs/{id}/files/{name} and returns raw text', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const fetchMock = mockFetchOnce(
        'CLUSTAL O alignment output',
        'text/plain'
      );
      const api = new SequenceRetrievalApi(
        { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
        makeFakeWdkService()
      );
      const result = yield api.fetchJobFile('abc123', 'output');
      expect(result).toBe('CLUSTAL O alignment output');
      const [request] = fetchMock.mock.calls[0];
      expect(request.url).toBe(
        'https://srt.example.org/jobs/abc123/files/output'
      );
    }));
});
//# sourceMappingURL=SequenceRetrievalApi.test.js.map
