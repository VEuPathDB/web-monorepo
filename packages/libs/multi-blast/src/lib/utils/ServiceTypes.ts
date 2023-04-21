import {
  TypeOf,
  array,
  boolean,
  intersection,
  literal,
  number,
  partial,
  record,
  string,
  type,
  union,
} from 'io-ts';

export const ioBlastCompBasedStats = union([
  literal('none'),
  literal('comp-based-stats'),
  literal('conditional-comp-based-score-adjustment'),
  literal('unconditional-comp-based-score-adjustment'),
]);

export type IoBlastCompBasedStats = TypeOf<typeof ioBlastCompBasedStats>;

export const ioBlastSegMask = union([
  literal('yes'),
  literal('no'),
  type({
    window: number,
    locut: number,
    hicut: number,
  }),
]);

export type IoBlastSegMask = TypeOf<typeof ioBlastSegMask>;

export const ioBlastStrand = union([
  literal('plus'),
  literal('minus'),
  literal('both'),
]);

export type IoBlastStrand = TypeOf<typeof ioBlastStrand>;

export const ioHitSorting = union([
  literal('by-eval'),
  literal('by-bit-score'),
  literal('by-total-score'),
  literal('by-percent-identity'),
  literal('by-query-coverage'),
]);

export type IoHitSorting = TypeOf<typeof ioHitSorting>;

export const ioHspSorting = union([
  literal('by-hsp-evalue'),
  literal('by-hsp-score'),
  literal('by-hsp-query-start'),
  literal('by-hsp-percent-identity'),
  literal('by-hsp-subject-start'),
]);

export type IoHspSorting = TypeOf<typeof ioHspSorting>;

export const ioBlastReportField = union([
  literal('bitscore'),
  literal('btop'),
  literal('evalue'),
  literal('frames'),
  literal('gapopen'),
  literal('gaps'),
  literal('length'),
  literal('mismatch'),
  literal('nident'),
  literal('pident'),
  literal('positive'),
  literal('ppos'),
  literal('qacc'),
  literal('qaccver'),
  literal('qcovhsp'),
  literal('qcovs'),
  literal('qcovus'),
  literal('qend'),
  literal('qframe'),
  literal('qgi'),
  literal('qlen'),
  literal('qseq'),
  literal('qseqid'),
  literal('qstart'),
  literal('sacc'),
  literal('saccver'),
  literal('sallacc'),
  literal('sallgi'),
  literal('sallseqid'),
  literal('salltitles'),
  literal('sblastname'),
  literal('sblastnames'),
  literal('scomname'),
  literal('scomnames'),
  literal('score'),
  literal('send'),
  literal('sframe'),
  literal('sgi'),
  literal('slen'),
  literal('sq'),
  literal('sr'),
  literal('ssciname'),
  literal('sscinames'),
  literal('sseq'),
  literal('sseqid'),
  literal('sskingdom'),
  literal('sskingdoms'),
  literal('sstart'),
  literal('sstrand'),
  literal('staxid'),
  literal('staxids'),
  literal('std'),
  literal('stitle'),
]);

export type IoBlastReportField = TypeOf<typeof ioBlastReportField>;

export const ioBlastFormat = union([
  literal('pairwise'),
  literal('query-anchored-with-identities'),
  literal('query-anchored-without-identities'),
  literal('flat-query-anchored-with-identities'),
  literal('flat-query-anchored-without-identities'),
  literal('xml'),
  literal('tabular'),
  literal('tabular-with-comments'),
  literal('text-asn-1'),
  literal('binary-asn-1'),
  literal('csv'),
  literal('archive-asn-1'),
  literal('seqalign-json'),
  literal('multi-file-json'),
  literal('multi-file-xml2'),
  literal('single-file-json'),
  literal('single-file-xml2'),
  literal('sam'),
  literal('organism-report'),
]);

export type IoBlastFormat = TypeOf<typeof ioBlastFormat>;

export const ioBlastReportFormat = partial({
  format: ioBlastFormat,
  delim: string,
  fields: array(ioBlastReportField),
});

export type IoBlastReportFormat = TypeOf<typeof ioBlastReportFormat>;

export const ioBlastLocation = type({
  start: number,
  end: number,
});

export type IoBlastLocation = TypeOf<typeof ioBlastLocation>;

export const ioJobStatus = union([
  literal('queued'),
  literal('in-progress'),
  literal('completed'),
  literal('errored'),
  literal('expired'),
]);

export type IoJobStatus = TypeOf<typeof ioJobStatus>;

export const ioBlastPScoringMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
  literal('IDENTITY'),
]);

export type IOBlastPScoringMatrix = TypeOf<typeof ioBlastPScoringMatrix>;

export const ioBlastXScoringMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
]);

export type IOBlastXScoringMatrix = TypeOf<typeof ioBlastXScoringMatrix>;

export const ioTBlastNScoringMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
  literal('IDENTITY'),
]);

export type IOTBlastNScoringMatrix = TypeOf<typeof ioTBlastNScoringMatrix>;

export const ioTBlastXScoringMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
]);

export type IOTBlastXScoringMatrix = TypeOf<typeof ioTBlastXScoringMatrix>;

export const ioBlastNTask = union([
  literal('megablast'),
  literal('dc-megablast'),
  literal('blastn'),
  literal('blastn-short'),
]);

export type IoBlastNTask = TypeOf<typeof ioBlastNTask>;

export const ioBlastPTask = union([
  literal('blastp'),
  literal('blastp-short'),
  literal('blastp-fast'),
]);

export type IoBlastPTask = TypeOf<typeof ioBlastPTask>;

export const ioBlastXTask = union([literal('blastx'), literal('blastx-fast')]);

export type IoBlastXTask = TypeOf<typeof ioBlastXTask>;

export const ioTBlastNTask = union([
  literal('tblastn'),
  literal('tblastn-fast'),
]);

export type IoTBlastNTask = TypeOf<typeof ioTBlastNTask>;

export const ioBlastNDust = union([
  literal('yes'),
  literal('no'),
  type({
    level: number,
    window: number,
    linker: number,
  }),
]);

export type IoBlastNDust = TypeOf<typeof ioBlastNDust>;

export const ioBlastNDcTemplateType = union([
  literal('coding'),
  literal('optimal'),
  literal('both'),
]);

export type IoBlastNDcTemplateType = TypeOf<typeof ioBlastNDcTemplateType>;

export const ioBlastNConfig = intersection([
  type({
    tool: literal('blastn'),
  }),
  partial({
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
    taxIds: array(number),
    negativeTaxIds: array(number),
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
  }),
]);

export type IoBlastNConfig = TypeOf<typeof ioBlastNConfig>;

export const ioBlastPConfig = intersection([
  type({
    tool: literal('blastp'),
  }),
  partial({
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
    taxIds: array(number),
    negativeTaxIds: array(number),
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
  }),
]);

export type IoBlastPConfig = TypeOf<typeof ioBlastPConfig>;

export const ioBlastXConfig = intersection([
  type({
    tool: literal('blastx'),
    queryGeneticCode: number,
  }),
  partial({
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
    taxIds: array(number),
    negativeTaxIds: array(number),
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
  }),
]);

export type IoBlastXConfig = TypeOf<typeof ioBlastXConfig>;

export const ioTBlastNConfig = intersection([
  type({
    tool: literal('tblastn'),
  }),
  partial({
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
    taxIds: array(number),
    negativeTaxIds: array(number),
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
  }),
]);

export type IoTBlastNConfig = TypeOf<typeof ioTBlastNConfig>;

export const ioTBlastXConfig = intersection([
  type({
    tool: literal('tblastx'),
    queryGeneticCode: number,
  }),
  partial({
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
    taxIds: array(number),
    negativeTaxIds: array(number),
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    windowSize: number,
  }),
]);

export type IoTBlastXConfig = TypeOf<typeof ioTBlastXConfig>;

export const ioBlastConfig = union([
  ioBlastNConfig,
  ioBlastPConfig,
  ioBlastXConfig,
  ioTBlastNConfig,
  ioTBlastXConfig,
]);

export type IoBlastConfig = TypeOf<typeof ioBlastConfig>;

export const target = type({
  organism: string,
  target: string,
});

export type Target = TypeOf<typeof target>;

export const shortJobResponse = intersection([
  type({
    id: string,
    status: ioJobStatus,
    created: string,
    site: string,
    targets: array(target),
    // FIXME: This field no longer appears in the response. Service bug?
    // expires: string,
  }),
  partial({
    description: string,
    // FIXME: This field is missing from "secondary" jobs. Service bug?
    isPrimary: boolean,
    childJobs: array(
      type({
        id: string,
        index: number,
      })
    ),
    parentJobs: array(
      type({
        id: string,
        index: number,
      })
    ),
  }),
]);

export type ShortJobResponse = TypeOf<typeof shortJobResponse>;

export const longJobResponse = intersection([
  shortJobResponse,
  type({
    config: ioBlastConfig,
  }),
]);

export type LongJobResponse = TypeOf<typeof longJobResponse>;

export const createJobResponse = type({
  jobId: string,
});

export type CreateJobResponse = TypeOf<typeof createJobResponse>;

export const reportConfig = partial({
  format: ioBlastFormat,
  fieldDelim: string,
  fields: array(ioBlastReportField),
  numDescriptions: number,
  numAlignments: number,
  lineLength: number,
  sortHits: ioHitSorting,
  sortHSPs: ioHspSorting,
  maxTargetSeqs: number,
  parseDefLines: boolean,
});

export type ReportConfig = TypeOf<typeof reportConfig>;

export const shortReportResponse = intersection([
  type({
    jobID: string,
    reportID: string,
    config: reportConfig,
    status: ioJobStatus,
  }),
  partial({
    description: string,
  }),
]);

export type ShortReportResponse = TypeOf<typeof shortReportResponse>;

export const longReportResponse = intersection([
  shortReportResponse,
  partial({
    files: array(string),
  }),
]);

export type LongReportResponse = TypeOf<typeof longReportResponse>;

export const createReportResponse = shortReportResponse;

export type CreateReportReponse = ShortJobResponse;

export const reportStrand = union([literal('Plus'), literal('Minus')]);

export type ReportStrand = TypeOf<typeof reportStrand>;

export const reportDescriptionJson = type({
  id: string,
  accession: string,
  title: string,
});

export const reportHspJson = intersection([
  type({
    num: number,
    bit_score: number,
    score: number,
    evalue: number,
    identity: number,
    query_from: number,
    query_to: number,
    hit_from: number,
    hit_to: number,
    align_len: number,
    gaps: number,
    qseq: string,
    hseq: string,
    midline: string,
  }),
  partial({
    query_strand: reportStrand,
    hit_strand: reportStrand,
  }),
]);

export type ReportHspJson = TypeOf<typeof reportHspJson>;

export const reportHitJson = type({
  num: number,
  description: array(reportDescriptionJson),
  len: number,
  hsps: array(reportHspJson),
});

export type ReportHitJson = TypeOf<typeof reportHitJson>;

export const reportStatJson = type({
  db_num: number,
  db_len: number,
  hsp_len: number,
  eff_space: number,
  kappa: number,
  lambda: number,
  entropy: number,
});

export type ReportStatJson = TypeOf<typeof reportStatJson>;

export const reportSearchJson = intersection([
  type({
    query_id: string,
    query_len: number,
    hits: array(reportHitJson),
    stat: reportStatJson,
  }),
  partial({
    query_title: string,
    message: string,
  }),
]);

export type ReportSearchJson = TypeOf<typeof reportSearchJson>;

export const reportResultsJson = type({
  search: reportSearchJson,
});

export type ReportResultsJson = TypeOf<typeof reportResultsJson>;

export const reportSearchTargetJson = type({
  db: string,
});

export type ReportSearchTargetJson = TypeOf<typeof reportSearchTargetJson>;

export const singleQueryReportJson = type({
  program: string,
  version: string,
  reference: string,
  search_target: reportSearchTargetJson,
  results: reportResultsJson,
});

export type SingleQueryReportJson = TypeOf<typeof singleQueryReportJson>;

export const multiQueryReportJson = type({
  BlastOutput2: array(
    type({
      report: singleQueryReportJson,
    })
  ),
});

export type MultiQueryReportJson = TypeOf<typeof multiQueryReportJson>;

export const badRequestError = type({
  status: literal('bad-request'),
  message: string,
});

export type BadRequestError = TypeOf<typeof badRequestError>;

export const tooLargeError = type({
  status: literal('too-large'),
  message: string,
});

export type TooLargeError = TypeOf<typeof tooLargeError>;

export const unauthorizedError = type({
  status: literal('unauthorized'),
  message: string,
});

export type UnauthorizedError = TypeOf<typeof unauthorizedError>;

export const forbiddenError = type({
  status: literal('forbidden'),
  message: string,
});

export type ForbiddenError = TypeOf<typeof forbiddenError>;

export const notFoundError = type({
  status: literal('not-found'),
  message: string,
});

export type NotFoundError = TypeOf<typeof notFoundError>;

export const methodNotAllowedError = type({
  status: literal('bad-method'),
  message: string,
});

export type MethodNotAllowedError = TypeOf<typeof methodNotAllowedError>;

export const inputErrors = type({
  general: array(string),
  byKey: record(string, array(string)),
});

export type InputErrors = TypeOf<typeof inputErrors>;

export const unprocessableEntityError = type({
  status: literal('invalid-input'),
  errors: inputErrors,
});

export type UnprocessableEntityError = TypeOf<typeof unprocessableEntityError>;

export const serverError = type({
  status: literal('server-error'),
  message: string,
  requestId: string,
});

export type ServerError = TypeOf<typeof serverError>;

export const unknownError = type({
  status: literal('unknown'),
  message: string,
});

export type UnknownError = TypeOf<typeof unknownError>;

export const errorDetails = union([
  badRequestError,
  tooLargeError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  methodNotAllowedError,
  unprocessableEntityError,
  serverError,
  unknownError,
]);

export type ErrorDetails = TypeOf<typeof errorDetails>;

export type ApiResult<T, E> = ApiResultSuccess<T> | ApiResultError<E>;

export type ApiResultSuccess<T> = { status: 'ok'; value: T };

export type ApiResultError<E> = { status: 'error'; details: E };
