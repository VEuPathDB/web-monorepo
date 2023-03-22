import { array, boolean, number, partial, TypeOf, keyof } from 'io-ts';

export const ioBlastHSPSorting = keyof({
  'by-hsp-evalue': null,
  'by-hsp-score': null,
  'by-hsp-query-start': null,
  'by-hsp-percent-identity': null,
  'by-hsp-subject-start': null,
});

export const ioBlastHitSorting = keyof({
  'by-evalue': null,
  'by-bit-score': null,
  'by-total-score': null,
  'by-percent-identity': null,
  'by-query-coverage': null,
});

export const ioBlastOutField = keyof({
  qseqid: null,
  qgi: null,
  qacc: null,
  qaccver: null,
  qlen: null,
  sseqid: null,
  sallseqid: null,
  sgi: null,
  sallgi: null,
  sacc: null,
  saccver: null,
  sallacc: null,
  slen: null,
  qstart: null,
  qend: null,
  sstart: null,
  send: null,
  qseq: null,
  sseq: null,
  evalue: null,
  bitscore: null,
  score: null,
  length: null,
  pident: null,
  nident: null,
  mismatch: null,
  positive: null,
  gapopen: null,
  gaps: null,
  ppos: null,
  frames: null,
  qframe: null,
  sframe: null,
  btop: null,
  staxid: null,
  ssciname: null,
  scomname: null,
  sblastname: null,
  sskingdom: null,
  staxids: null,
  sscinames: null,
  scomnames: null,
  sblastnames: null,
  sskingdoms: null,
  stitle: null,
  salltitles: null,
  sstrand: null,
  qcovs: null,
  qcovhsp: null,
  qcovus: null,
  SQ: null,
  SR: null,
  std: null,
});

export const ioBlastOutFormat = keyof({
  pairwise: null,
  'query-anchored-with-identities': null,
  'query-anchored-no-identities': null,
  'flat-query-anchored-with-identities': null,
  'flat-query-anchored-no-identities': null,
  xml: null,
  tabular: null,
  'tabular-with-comments': null,
  'seqalign-text': null,
  'seqalign-binary': null,
  csv: null,
  asn1: null,
  'seqalign-json': null,
  'multi-file-blast-json': null,
  'multi-file-blast-xml2': null,
  'single-file-blast-json': null,
  'single-file-blast-xml2': null,
  sam: null,
  'organism-report': null,
});

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
