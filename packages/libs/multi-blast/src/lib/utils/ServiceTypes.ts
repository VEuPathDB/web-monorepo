import { isPlainObject } from 'lodash';

import {
  Decoder,
  Result,
  Unpack,
  arrayOf,
  boolean,
  combine,
  constant,
  err,
  number,
  ok,
  oneOf,
  optional,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';

function partialRecord<T>(
  decoderRecord: { [K in keyof T]: Decoder<T[K]> }
): Decoder<Partial<T>> {
  return function decodePartialRecord(t: any): Result<T> {
    if (!isPlainObject(t)) return err(t, `object`);
    for (const key in decoderRecord) {
      const r = optional(decoderRecord[key])(t[key]);
      if (r.status === 'err')
        return err(r.value, r.expected, `.${key}${r.context}`);
    }
    return ok(t);
  };
}

export const ioBlastCompBasedStats = oneOf(
  constant('none'),
  constant('comp-based-stats'),
  constant('conditional-comp-based-score-adjustment'),
  constant('unconditional-comp-based-score-adjustment')
);

export type IoBlastCompBasedStats = Unpack<typeof ioBlastCompBasedStats>;

export const ioBlastSegMask = partialRecord({
  window: number,
  locut: number,
  hicut: number,
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

export const ioBlastReportFormat = partialRecord({
  format: ioBlastFormat,
  delim: string,
  fields: arrayOf(ioBlastReportField),
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

export const ioBlastNDust = partialRecord({
  enable: boolean,
  level: number,
  window: number,
  linker: number,
});

export type IoBlastNDust = Unpack<typeof ioBlastNDust>;

export const ioBlastNDcTemplateType = oneOf(
  constant('coding'),
  constant('optimal'),
  constant('both')
);

export type IoBlastNDcTemplateType = Unpack<typeof ioBlastNDcTemplateType>;

export const ioBlastNConfig = combine(
  record({
    tool: constant('blastn'),
  }),
  partialRecord({
    query: string,
    queryLoc: ioBlastLocation,
    eValue: string,
    outFormat: ioBlastReportFormat,
    numDescriptions: number,
    numAlignments: number,
    lineLength: number,
    sortHits: ioHitSorting,
    sortHSPs: ioHspSorting,
    lcaseMasking: boolean,
    qCovHSPPerc: number,
    maxHSPs: number,
    maxTargetSeqs: number,
    dbSize: number,
    searchSpace: number,
    xDropUngap: number,
    parseDefLines: boolean,
    strand: ioBlastStrand,
    task: ioBlastNTask,
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    penalty: number,
    reward: number,
    useIndex: boolean,
    indexName: string,
    dust: ioBlastNDust,
    windowMaskerTaxid: number,
    softMasking: boolean,
    taxIds: arrayOf(number),
    negativeTaxIds: arrayOf(number),
    dbSoftMask: string,
    dbHardMask: string,
    percIdentity: number,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    templateType: ioBlastNDcTemplateType,
    templateLength: number,
    sumStats: boolean,
    xDropGap: number,
    xDropGapFinal: number,
    noGreedy: boolean,
    minRawGappedScore: number,
    ungapped: boolean,
    windowSize: number,
    offDiagonalRange: number,
  })
);

export type IoBlastNConfig = Unpack<typeof ioBlastNConfig>;

export const ioBlastPConfig = combine(
  record({
    tool: constant('blastp'),
  }),
  partialRecord({
    query: string,
    queryLoc: ioBlastLocation,
    eValue: string,
    outFormat: ioBlastReportFormat,
    numDescriptions: number,
    numAlignments: number,
    lineLength: number,
    sortHits: ioHitSorting,
    sortHSPs: ioHspSorting,
    lcaseMasking: boolean,
    qCovHSPPerc: number,
    maxHSPs: number,
    maxTargetSeqs: number,
    dbSize: number,
    searchSpace: number,
    xDropUngap: number,
    parseDefLines: boolean,
    task: ioBlastPTask,
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    matrix: ioBlastPScoringMatrix,
    threshold: number,
    compBasedStats: ioBlastCompBasedStats,
    seg: ioBlastSegMask,
    softMasking: boolean,
    taxIds: arrayOf(number),
    negativeTaxIds: arrayOf(number),
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    xDropGap: number,
    xDropGapFinal: number,
    windowSize: number,
    ungapped: boolean,
    useSWTraceback: boolean,
  })
);

export type IoBlastPConfig = Unpack<typeof ioBlastPConfig>;

export const ioBlastXConfig = combine(
  record({
    tool: constant('blastx'),
    queryGeneticCode: number,
  }),
  partialRecord({
    query: string,
    queryLoc: ioBlastLocation,
    eValue: string,
    outFormat: ioBlastReportFormat,
    numDescriptions: number,
    numAlignments: number,
    lineLength: number,
    sortHits: ioHitSorting,
    sortHSPs: ioHspSorting,
    lcaseMasking: boolean,
    qCovHSPPerc: number,
    maxHSPs: number,
    maxTargetSeqs: number,
    dbSize: number,
    searchSpace: number,
    xDropUngap: number,
    parseDefLines: boolean,
    strand: ioBlastStrand,
    task: ioBlastXTask,
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    maxIntronLength: number,
    matrix: ioBlastXScoringMatrix,
    threshold: number,
    compBasedStats: ioBlastCompBasedStats,
    seg: ioBlastSegMask,
    softMasking: boolean,
    taxIds: arrayOf(number),
    negativeTaxIds: arrayOf(number),
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    xDropGap: number,
    xDropGapFinal: number,
    windowSize: number,
    ungapped: boolean,
    useSWTraceback: boolean,
  })
);

export type IoBlastXConfig = Unpack<typeof ioBlastXConfig>;

export const ioTBlastNConfig = combine(
  record({
    tool: constant('tblastn'),
  }),
  partialRecord({
    query: string,
    queryLoc: ioBlastLocation,
    eValue: string,
    outFormat: ioBlastReportFormat,
    numDescriptions: number,
    numAlignments: number,
    lineLength: number,
    sortHits: ioHitSorting,
    sortHSPs: ioHspSorting,
    lcaseMasking: boolean,
    qCovHSPPerc: number,
    maxHSPs: number,
    maxTargetSeqs: number,
    dbSize: number,
    searchSpace: number,
    xDropUngap: number,
    parseDefLines: boolean,
    task: ioTBlastNTask,
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    dbGenCode: number,
    maxIntronLength: number,
    matrix: ioTBlastNScoringMatrix,
    threshold: number,
    compBasedStats: ioBlastCompBasedStats,
    seg: ioBlastSegMask,
    softMasking: boolean,
    taxIds: arrayOf(number),
    negativeTaxIds: arrayOf(number),
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    xDropGap: number,
    xDropGapFinal: number,
    ungapped: boolean,
    windowSize: number,
    useSWTraceback: boolean,
  })
);

export type IoTBlastNConfig = Unpack<typeof ioTBlastNConfig>;

export const ioTBlastXConfig = combine(
  record({
    tool: constant('tblastx'),
    queryGeneticCode: number,
  }),
  partialRecord({
    query: string,
    queryLoc: ioBlastLocation,
    eValue: string,
    outFormat: ioBlastReportFormat,
    numDescriptions: number,
    numAlignments: number,
    lineLength: number,
    sortHits: ioHitSorting,
    sortHSPs: ioHspSorting,
    lcaseMasking: boolean,
    qCovHSPPerc: number,
    maxHSPs: number,
    maxTargetSeqs: number,
    dbSize: number,
    searchSpace: number,
    xDropUngap: number,
    parseDefLines: boolean,
    strand: ioBlastStrand,
    wordSize: number,
    maxIntronLength: number,
    matrix: ioTBlastXScoringMatrix,
    threshold: number,
    dbGencode: number,
    seg: ioBlastSegMask,
    softMasking: boolean,
    taxIds: arrayOf(number),
    negativeTaxIds: arrayOf(number),
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    windowSize: number,
  })
);

export type IoTBlastXConfig = Unpack<typeof ioTBlastXConfig>;

export const ioBlastConfig = oneOf(
  ioBlastNConfig,
  ioBlastPConfig,
  ioBlastXConfig,
  ioTBlastNConfig,
  ioTBlastXConfig
);

export type IoBlastConfig = Unpack<typeof ioBlastConfig>;

export const shortJobResponse = record({
  id: string,
  description: optional(string),
  status: ioJobStatus,
});

export type ShortJobResponse = Unpack<typeof shortJobResponse>;

export const longJobResponse = combine(
  shortJobResponse,
  record({
    config: ioBlastConfig,
  })
);

export type LongJobResponse = Unpack<typeof longJobResponse>;
