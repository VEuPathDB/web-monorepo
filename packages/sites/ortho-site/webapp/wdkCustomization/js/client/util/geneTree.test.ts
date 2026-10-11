import {
  buildGeneTreeRequest,
  encodeTreeLabel,
  estimateTreeSeconds,
  formatDuration,
} from './geneTree';

type RowType = Record<string, string>;

describe('encodeTreeLabel', () => {
  it('replaces every colon, which Newick reserves, with _COLON_', () => {
    expect(encodeTreeLabel('ALNC14_027730:RNA-p1')).toBe(
      'ALNC14_027730_COLON_RNA-p1'
    );
    expect(encodeTreeLabel('transcript:ENSAATROPT000021-p1')).toBe(
      'transcript_COLON_ENSAATROPT000021-p1'
    );
    expect(encodeTreeLabel('a:b:c')).toBe('a_COLON_b_COLON_c');
  });

  it('leaves ids without a colon untouched', () => {
    expect(encodeTreeLabel('osa_Os01g0100100')).toBe('osa_Os01g0100100');
  });
});

describe('buildGeneTreeRequest', () => {
  const rows: RowType[] = [
    { full_id: 'osa_Os01g0100100', length: '350' },
    { full_id: 'transcript:ENSAATROPT000021-p1', length: '210' },
  ];

  it('asks for a newick gene tree of every given row, labelled with colon-free ids', () => {
    expect(buildGeneTreeRequest(rows)).toEqual({
      features: [
        {
          contig: 'osa_Os01g0100100',
          query: 'osa_Os01g0100100',
          start: 0,
          end: 350,
        },
        {
          contig: 'transcript:ENSAATROPT000021-p1',
          query: 'transcript_COLON_ENSAATROPT000021-p1',
          start: 0,
          end: 210,
        },
      ],
      deflineFormat: 'QUERYONLY',
      postProcess: 'GENETREE',
      geneTreeOptions: { format: 'newick' },
    });
  });
});

describe('estimateTreeSeconds', () => {
  it('is zero for no sequences', () => {
    expect(estimateTreeSeconds(0, 500)).toBe(0);
  });

  it('adds the FastTree and MAFFT terms', () => {
    const fasttree = Math.exp(-8.229) * 100 ** 1.165 * 400 ** 0.849;
    const mafft = Math.exp(-12.453) * 100 ** 0.618 * 400 ** 1.47;
    expect(estimateTreeSeconds(100, 400)).toBeCloseTo(fasttree + mafft, 6);
  });

  it('grows with sequence count and with maximum length', () => {
    expect(estimateTreeSeconds(200, 400)).toBeGreaterThan(
      estimateTreeSeconds(100, 400)
    );
    expect(estimateTreeSeconds(100, 800)).toBeGreaterThan(
      estimateTreeSeconds(100, 400)
    );
  });
});

describe('formatDuration', () => {
  it('formats as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(9.4)).toBe('0:09');
    expect(formatDuration(261)).toBe('4:21');
    expect(formatDuration(3725)).toBe('62:05');
  });
});
