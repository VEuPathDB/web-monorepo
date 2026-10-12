import { buildGeneTreeRequest, encodeTreeLabel } from './geneTree';

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
