import { resolveTranscriptFeatures } from './resolveTranscriptFeatures';

function makeFakeWdkService(bedText: string) {
  const createDataset = jest.fn().mockResolvedValue(42);
  const getTemporaryResultPath = jest
    .fn()
    .mockResolvedValue('/temporary-results/xyz');
  (global as any).fetch = jest.fn().mockResolvedValue({
    text: () => Promise.resolve(bedText),
  });
  return {
    createDataset,
    getTemporaryResultPath,
  } as any;
}

afterEach(() => {
  jest.restoreAllMocks();
  delete (global as any).fetch;
});

describe('resolveTranscriptFeatures', () => {
  it('uploads the transcript IDs as a dataset before requesting the bed report', async () => {
    const wdkService = makeFakeWdkService(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n'
    );

    await resolveTranscriptFeatures(wdkService, ['PF3D7_0200300.1']);

    expect(wdkService.createDataset).toHaveBeenCalledWith({
      sourceType: 'idList',
      sourceContent: { ids: ['PF3D7_0200300.1'] },
    });

    expect(wdkService.getTemporaryResultPath).toHaveBeenCalledWith(
      expect.objectContaining({
        searchName: 'GeneByLocusTag',
        searchConfig: expect.objectContaining({
          parameters: expect.objectContaining({
            ds_gene_ids: '42',
          }),
        }),
      }),
      'bed',
      expect.anything()
    );
  });

  it('parses BED text into Feature[]', async () => {
    const wdkService = makeFakeWdkService(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n'
    );

    const features = await resolveTranscriptFeatures(wdkService, [
      'PF3D7_0200300.1',
    ]);

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

  it('handles multiple transcript IDs, one BED line per transcript', async () => {
    const wdkService = makeFakeWdkService(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n' +
        'PF3D7_0300400\t200\t900\tPF3D7_0300400.1\t0\t-\n'
    );

    const features = await resolveTranscriptFeatures(wdkService, [
      'PF3D7_0200300.1',
      'PF3D7_0300400.1',
    ]);

    expect(features).toHaveLength(2);
    expect(features[1]).toEqual({
      contig: 'PF3D7_0300400',
      start: 200,
      end: 900,
      query: 'PF3D7_0300400.1',
      strand: 'NEGATIVE',
    });
  });

  it('passes flankingOffsets through to the bed report upstream/downstreamOffset', async () => {
    const wdkService = makeFakeWdkService(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n'
    );

    await resolveTranscriptFeatures(wdkService, ['PF3D7_0200300.1'], {
      upstream: 500,
      downstream: 250,
    });

    expect(wdkService.getTemporaryResultPath).toHaveBeenCalledWith(
      expect.anything(),
      'bed',
      expect.objectContaining({
        upstreamOffset: 500,
        downstreamOffset: 250,
      })
    );
  });
});
