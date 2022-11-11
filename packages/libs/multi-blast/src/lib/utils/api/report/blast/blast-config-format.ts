import { array, boolean, literal, number, partial, TypeOf, union } from 'io-ts';

export const ioBlastHSPSorting = union([
  literal('by-hsp-evalue'),
  literal('by-hsp-score'),
  literal('by-hsp-query-start'),
  literal('by-hsp-percent-identity'),
  literal('by-hsp-subject-start'),
]);

export const ioBlastHitSorting = union([
  literal('by-evalue'),
  literal('by-bit-score'),
  literal('by-total-score'),
  literal('by-percent-identity'),
  literal('by-query-coverage'),
]);

export const ioBlastOutField = union([
  literal('qseqid'),
  literal('qgi'),
  literal('qacc'),
  literal('qaccver'),
  literal('qlen'),
  literal('sseqid'),
  literal('sallseqid'),
  literal('sgi'),
  literal('sallgi'),
  literal('sacc'),
  literal('saccver'),
  literal('sallacc'),
  literal('slen'),
  literal('qstart'),
  literal('qend'),
  literal('sstart'),
  literal('send'),
  literal('qseq'),
  literal('sseq'),
  literal('evalue'),
  literal('bitscore'),
  literal('score'),
  literal('length'),
  literal('pident'),
  literal('nident'),
  literal('mismatch'),
  literal('positive'),
  literal('gapopen'),
  literal('gaps'),
  literal('ppos'),
  literal('frames'),
  literal('qframe'),
  literal('sframe'),
  literal('btop'),
  literal('staxid'),
  literal('ssciname'),
  literal('scomname'),
  literal('sblastname'),
  literal('sskingdom'),
  literal('staxids'),
  literal('sscinames'),
  literal('scomnames'),
  literal('sblastnames'),
  literal('sskingdoms'),
  literal('stitle'),
  literal('salltitles'),
  literal('sstrand'),
  literal('qcovs'),
  literal('qcovhsp'),
  literal('qcovus'),
  literal('SQ'),
  literal('SR'),
  literal('std'),
]);

export const ioBlastOutFormat = union([
  literal('pairwise'),
  literal('query-anchored-with-identities'),
  literal('query-anchored-no-identities'),
  literal('flat-query-anchored-with-identities'),
  literal('flat-query-anchored-no-identities'),
  literal('xml'),
  literal('tabular'),
  literal('tabular-with-comments'),
  literal('seqalign-text'),
  literal('seqalign-binary'),
  literal('csv'),
  literal('asn1'),
  literal('seqalign-json'),
  literal('multi-file-blast-json'),
  literal('multi-file-blast-xml2'),
  literal('single-file-blast-json'),
  literal('single-file-blast-xml2'),
  literal('sam'),
  literal('organism-report'),
]);

export const ioBlastFormatConfig = partial({
  formatType: ioBlastOutFormat,
  formatFields: array(ioBlastOutField),
  showGIs: boolean,
  numDescriptions: number,
  numAlignments: number,
  lineLength: number,
  sortHits: ioBlastHitSorting,
  sortHSPs: ioBlastHSPSorting,
  maxTargetSequences: number,
  parseDefLines: boolean,
});

export type IOBlastHSPSorting = TypeOf<typeof ioBlastHSPSorting>;
export type IOBlastHitSorting = TypeOf<typeof ioBlastHitSorting>;
export type IOBlastOutField = TypeOf<typeof ioBlastOutField>;
export type IOBlastOutFormat = TypeOf<typeof ioBlastOutFormat>;
export type IOBlastFormatConfig = TypeOf<typeof ioBlastFormatConfig>;
