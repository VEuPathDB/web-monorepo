import {
  Unpack,
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
