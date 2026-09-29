import {
  fetchTemporaryResultText,
  parseBedToFeatures,
  submitClustalMsaJob,
  submitSyncFastaRequest,
} from './msaJobSubmission';

describe('parseBedToFeatures', () => {
  it('parses a single BED line into a Feature', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n'
    );

    expect(features).toEqual([
      {
        contig: 'PF3D7_0200300',
        start: 100,
        end: 500,
        query: 'PF3D7_0200300.1',
        strand: 'POSITIVE',
      },
    ]);
  });

  it('parses multiple BED lines, one Feature per line', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n' +
        'PF3D7_0300400\t200\t900\tPF3D7_0300400.1\t0\t-\n'
    );

    expect(features).toHaveLength(2);
    expect(features[1]).toEqual({
      contig: 'PF3D7_0300400',
      start: 200,
      end: 900,
      query: 'PF3D7_0300400.1',
      strand: 'NEGATIVE',
    });
  });

  it('skips blank lines', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n\n'
    );

    expect(features).toHaveLength(1);
  });

  it('maps an unrecognized strand symbol to NONE', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t.\n'
    );

    expect(features[0].strand).toBe('NONE');
  });
});

describe('fetchTemporaryResultText', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('GETs the endpoint-relative temporary-result path and returns its text', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ text: () => Promise.resolve('>seq1\nACGT\n') });

    const text = await fetchTemporaryResultText('/temporary-results/xyz');

    expect(text).toBe('>seq1\nACGT\n');
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/temporary-results/xyz');
  });
});

function makeFakeTab() {
  return { location: { replace: jest.fn() }, close: jest.fn() };
}

function makeFakeApi(job: { jobID: string }) {
  return { submitJob: jest.fn().mockResolvedValue(job) } as any;
}

describe('submitClustalMsaJob', () => {
  it('navigates the passed-in tab to the result URL after submitting', async () => {
    const fakeTab = makeFakeTab();
    const api = makeFakeApi({ jobID: 'abc123' });
    const features = [{ contig: 'x', start: 0, end: 10 }];

    await submitClustalMsaJob({
      api,
      sequenceType: 'dnaseq',
      features,
      msaFormat: 'clustal',
      resultRouteBase: '/app/workspace/msa',
      paramsSummary: '5 Strain Segments',
      resultTab: fakeTab as unknown as Window,
    });

    expect(api.submitJob).toHaveBeenCalledWith('dnaseq', {
      features,
      postProcess: 'MSA',
      msaOptions: { format: 'clustal', percentActg: undefined },
    });
    expect(fakeTab.location.replace).toHaveBeenCalledTimes(1);
    const [navigatedUrl] = fakeTab.location.replace.mock.calls[0];
    expect(navigatedUrl).toContain('/app/workspace/msa/result/abc123');
    expect(navigatedUrl).toContain('paramsSummary=');
    expect(navigatedUrl).toContain('format=clustal');
    expect(navigatedUrl).toContain('sequenceCount=1');
  });

  it('closes the passed-in tab and rethrows if submitJob rejects', async () => {
    const fakeTab = makeFakeTab();
    const api = {
      submitJob: jest.fn().mockRejectedValue(new Error('service down')),
    } as any;

    await expect(
      submitClustalMsaJob({
        api,
        sequenceType: 'dnaseq',
        features: [],
        msaFormat: 'clustal',
        resultRouteBase: '/app/workspace/msa',
        paramsSummary: '0 Strain Segments',
        resultTab: fakeTab as unknown as Window,
      })
    ).rejects.toThrow('service down');

    expect(fakeTab.close).toHaveBeenCalledTimes(1);
    expect(fakeTab.location.replace).not.toHaveBeenCalled();
  });

  it('does not throw if the passed-in tab is null (popup blocked)', async () => {
    const api = makeFakeApi({ jobID: 'abc123' });

    await expect(
      submitClustalMsaJob({
        api,
        sequenceType: 'dnaseq',
        features: [],
        msaFormat: 'clustal',
        resultRouteBase: '/app/workspace/msa',
        paramsSummary: '0 Strain Segments',
        resultTab: null,
      })
    ).resolves.toBeUndefined();
  });

  it('forwards percentActg into msaOptions when provided', async () => {
    const fakeTab = makeFakeTab();
    const api = makeFakeApi({ jobID: 'abc123' });
    const features = [{ contig: 'x', start: 0, end: 10 }];

    await submitClustalMsaJob({
      api,
      sequenceType: 'dnaseq',
      features,
      msaFormat: 'clustal',
      resultRouteBase: '/app/workspace/msa',
      paramsSummary: '5 Strain Segments',
      resultTab: fakeTab as unknown as Window,
      percentActg: 90,
    });

    expect(api.submitJob).toHaveBeenCalledWith('dnaseq', {
      features,
      postProcess: 'MSA',
      msaOptions: { format: 'clustal', percentActg: 90 },
    });
  });
});

function makeFakeSyncApi(fastaText: string) {
  return {
    fetchSequencesSync: jest.fn().mockResolvedValue(fastaText),
  } as any;
}

describe('submitSyncFastaRequest', () => {
  it('returns the FASTA text fetched from the sync endpoint', async () => {
    const api = makeFakeSyncApi('>seq1\nACGT\n');
    const features = [{ contig: 'x', start: 0, end: 10 }];

    const fastaText = await submitSyncFastaRequest({
      api,
      sequenceType: 'dnaseq',
      features,
      deflineFormat: 'QUERYANDREGION',
      basesPerLine: 60,
      percentActg: 90,
    });

    expect(fastaText).toBe('>seq1\nACGT\n');
    expect(api.fetchSequencesSync).toHaveBeenCalledWith('dnaseq', {
      features,
      deflineFormat: 'QUERYANDREGION',
      basesPerLine: 60,
      percentActg: 90,
    });
  });

  it('omits percentActg from the request when not provided', async () => {
    const api = makeFakeSyncApi('>seq1\nACGT\n');
    const features = [{ contig: 'x', start: 0, end: 10 }];

    await submitSyncFastaRequest({
      api,
      sequenceType: 'dnaseq',
      features,
      deflineFormat: 'QUERYANDREGION',
      basesPerLine: 60,
    });

    expect(api.fetchSequencesSync).toHaveBeenCalledWith('dnaseq', {
      features,
      deflineFormat: 'QUERYANDREGION',
      basesPerLine: 60,
      percentActg: undefined,
    });
  });
});
