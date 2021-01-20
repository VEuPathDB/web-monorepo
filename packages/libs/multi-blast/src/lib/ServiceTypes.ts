import {
  Unpack,
  arrayOf,
  boolean,
  constant,
  number,
  oneOf,
  optional,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';

export const ioBlastCompBasedStats = oneOf(
  constant('none'),
  constant('comp-based-stats'),
  constant('conditional-comp-based-score-adjustment'),
  constant('unconditional-comp-based-score-adjustment')
);

export type IoBlastCompBasedStats = Unpack<typeof ioBlastCompBasedStats>;

export const ioBlastSegMask = record({
  window: optional(number),
  locut: optional(number),
  hicut: optional(number),
});

export type IoBlastSegMask = Unpack<typeof ioBlastSegMask>;

export const ioBlastStrand = oneOf(
  constant('plus'),
  constant('minus'),
  constant('both')
);

export type IoBlastStrand = Unpack<typeof ioBlastStrand>;

export const ioHitSorting = oneOf(
  constant('by-eval'),
  constant('by-bit-score'),
  constant('by-total-score'),
  constant('by-percent-identity'),
  constant('by-query-coverage')
);

export type IoHitSorting = Unpack<typeof ioHitSorting>;

export const ioHspSorting = oneOf(
  constant('by-hsp-evalue'),
  constant('by-hsp-score'),
  constant('by-hsp-query-start'),
  constant('by-hsp-percent-identity'),
  constant('by-hsp-subject-start')
);

export type IoHspSorting = Unpack<typeof ioHspSorting>;

export const ioBlastReportField = oneOf(
  constant('bitscore'),
  constant('btop'),
  constant('evalue'),
  constant('frames'),
  constant('gapopen'),
  constant('gaps'),
  constant('length'),
  constant('mismatch'),
  constant('nident'),
  constant('pident'),
  constant('positive'),
  constant('ppos'),
  constant('qacc'),
  constant('qaccver'),
  constant('qcovhsp'),
  constant('qcovs'),
  constant('qcovus'),
  constant('qend'),
  constant('qframe'),
  constant('qgi'),
  constant('qlen'),
  constant('qseq'),
  constant('qseqid'),
  constant('qstart'),
  constant('sacc'),
  constant('saccver'),
  constant('sallacc'),
  constant('sallgi'),
  constant('sallseqid'),
  constant('salltitles'),
  constant('sblastname'),
  constant('sblastnames'),
  constant('scomname'),
  constant('scomnames'),
  constant('score'),
  constant('send'),
  constant('sframe'),
  constant('sgi'),
  constant('slen'),
  constant('sq'),
  constant('sr'),
  constant('ssciname'),
  constant('sscinames'),
  constant('sseq'),
  constant('sseqid'),
  constant('sskingdom'),
  constant('sskingdoms'),
  constant('sstart'),
  constant('sstrand'),
  constant('staxid'),
  constant('staxids'),
  constant('stitle')
);

export type IoBlastReportField = Unpack<typeof ioBlastReportField>;

export const ioBlastFormat = oneOf(
  constant('pairwise'),
  constant('query-anchored-with-identities'),
  constant('query-anchored-without-identities'),
  constant('flat-query-anchored-with-identities'),
  constant('flat-query-anchored-without-identities'),
  constant('xml'),
  constant('tabular'),
  constant('tabular-with-comments'),
  constant('text-asn-1'),
  constant('binary-asn-1'),
  constant('csv'),
  constant('archive-asn-1'),
  constant('seqalign-json'),
  constant('multi-file-json'),
  constant('multi-file-xml2'),
  constant('single-file-json'),
  constant('single-file-xml2'),
  constant('sam'),
  constant('organism-report')
);

export type IoBlastFormat = Unpack<typeof ioBlastFormat>;

export const ioBlastReportFormat = record({
  format: optional(ioBlastFormat),
  delim: optional(string),
  fields: optional(ioBlastReportField),
});

export type IoBlastReportFormat = Unpack<typeof ioBlastReportFormat>;

export const ioBlastLocation = record({
  start: number,
  end: number,
});

export type IoBlastLocation = Unpack<typeof ioBlastLocation>;

export const ioJobStatus = oneOf(
  constant('queued'),
  constant('in-progress'),
  constant('completed'),
  constant('errored')
);

export type IoJobStatus = Unpack<typeof ioJobStatus>;

export const ioBlastPScoringMatrix = oneOf(
  constant('BLOSUM45'),
  constant('BLOSUM50'),
  constant('BLOSUM62'),
  constant('BLOSUM80'),
  constant('BLOSUM90'),
  constant('PAM30'),
  constant('PAM70'),
  constant('PAM250'),
  constant('IDENTITY')
);

export type IOBlastPScoringMatrix = Unpack<typeof ioBlastPScoringMatrix>;

export const ioBlastXScoringMatrix = oneOf(
  constant('BLOSUM45'),
  constant('BLOSUM50'),
  constant('BLOSUM62'),
  constant('BLOSUM80'),
  constant('BLOSUM90'),
  constant('PAM30'),
  constant('PAM70'),
  constant('PAM250')
);

export type IOBlastXScoringMatrix = Unpack<typeof ioBlastXScoringMatrix>;

export const ioTBlastNScoringMatrix = oneOf(
  constant('BLOSUM45'),
  constant('BLOSUM50'),
  constant('BLOSUM62'),
  constant('BLOSUM80'),
  constant('BLOSUM90'),
  constant('PAM30'),
  constant('PAM70'),
  constant('PAM250'),
  constant('IDENTITY')
);

export type IOTBlastNScoringMatrix = Unpack<typeof ioTBlastNScoringMatrix>;

export const ioTBlastXScoringMatrix = oneOf(
  constant('BLOSUM45'),
  constant('BLOSUM50'),
  constant('BLOSUM62'),
  constant('BLOSUM80'),
  constant('BLOSUM90'),
  constant('PAM30'),
  constant('PAM70'),
  constant('PAM250')
);

export type IOTBlastXScoringMatrix = Unpack<typeof ioTBlastXScoringMatrix>;

export const ioBlastNTask = oneOf(
  constant('megablast'),
  constant('dc-megablast'),
  constant('blastn'),
  constant('blastn-short')
);

export type IoBlastNTask = Unpack<typeof ioBlastNTask>;

export const ioBlastPTask = oneOf(
  constant('blastp'),
  constant('blastp-short'),
  constant('blastp-fast')
);

export type IoBlastPTask = Unpack<typeof ioBlastPTask>;

export const ioBlastXTask = oneOf(constant('blastx'), constant('blastx-fast'));

export type IoBlastXTask = Unpack<typeof ioBlastXTask>;

export const ioTBlastNTask = oneOf(
  constant('tblastn'),
  constant('tblastn-fast')
);

export type IoTBlastNTask = Unpack<typeof ioTBlastNTask>;

export const ioBlastNDust = record({
  enable: optional(boolean),
  level: optional(number),
  window: optional(number),
  linker: optional(number),
});

export type IoBlastNDust = Unpack<typeof ioBlastNDust>;

export const ioBlastNDcTemplateType = oneOf(
  constant('coding'),
  constant('optimal'),
  constant('both')
);

export type IoBlastNDcTemplateType = Unpack<typeof ioBlastNDcTemplateType>;

export const ioBlastNConfig = record({
  tool: constant('blastn'),
  query: optional(string),
  queryLoc: optional(ioBlastLocation),
  eValue: optional(string),
  outFormat: optional(ioBlastReportFormat),
  numDescriptions: optional(number),
  numAlignments: optional(number),
  lineLength: optional(number),
  sortHits: optional(ioHitSorting),
  sortHSPs: optional(ioHspSorting),
  lcaseMasking: optional(boolean),
  qCovHSPPerc: optional(number),
  maxHSPs: optional(number),
  maxTargetSeqs: optional(number),
  dbSize: optional(number),
  searchSpace: optional(number),
  xDropUngap: optional(number),
  parseDefLines: optional(boolean),
  strand: optional(ioBlastStrand),
  task: optional(ioBlastNTask),
  wordSize: optional(number),
  gapOpen: optional(number),
  gapExtend: optional(number),
  penalty: optional(number),
  reward: optional(number),
  useIndex: optional(boolean),
  indexName: optional(string),
  dust: optional(ioBlastNDust),
  windowMaskerTaxid: optional(number),
  softMasking: optional(boolean),
  taxIds: optional(arrayOf(number)),
  negativeTaxIds: optional(arrayOf(number)),
  dbSoftMask: optional(string),
  dbHardMask: optional(string),
  percIdentity: optional(number),
  cullingLimit: optional(number),
  bestHitOverhang: optional(number),
  bestHitScoreEdge: optional(number),
  subjectBestHit: optional(boolean),
  templateType: optional(ioBlastNDcTemplateType),
  templateLength: optional(number),
  sumStats: optional(boolean),
  xDropGap: optional(number),
  xDropGapFinal: optional(number),
  noGreedy: optional(boolean),
  minRawGappedScore: optional(number),
  ungapped: optional(boolean),
  windowSize: optional(number),
  offDiagonalRange: optional(number),
});

export type IoBlastNConfig = Unpack<typeof ioBlastNConfig>;

export const ioBlastPConfig = record({
  tool: constant('blastp'),
  query: optional(string),
  queryLoc: optional(ioBlastLocation),
  eValue: optional(string),
  outFormat: optional(ioBlastReportFormat),
  numDescriptions: optional(number),
  numAlignments: optional(number),
  lineLength: optional(number),
  sortHits: optional(ioHitSorting),
  sortHSPs: optional(ioHspSorting),
  lcaseMasking: optional(boolean),
  qCovHSPPerc: optional(number),
  maxHSPs: optional(number),
  maxTargetSeqs: optional(number),
  dbSize: optional(number),
  searchSpace: optional(number),
  xDropUngap: optional(number),
  parseDefLines: optional(boolean),
  task: optional(ioBlastPTask),
  wordSize: optional(number),
  gapOpen: optional(number),
  gapExtend: optional(number),
  matrix: optional(ioBlastPScoringMatrix),
  threshold: optional(number),
  compBasedStats: optional(ioBlastCompBasedStats),
  softMasking: optional(boolean),
  taxIds: optional(arrayOf(number)),
  negativeTaxIds: optional(arrayOf(number)),
  dbSoftMask: optional(string),
  dbHardMask: optional(string),
  cullingLimit: optional(number),
  bestHitOverhang: optional(number),
  bestHitScoreEdge: optional(number),
  subjectBestHit: optional(boolean),
  xDropGap: optional(number),
  xDropGapFinal: optional(number),
  windowSize: optional(number),
  ungapped: optional(boolean),
  useSWTraceback: optional(boolean),
});

export type IoBlastPConfig = Unpack<typeof ioBlastPConfig>;
