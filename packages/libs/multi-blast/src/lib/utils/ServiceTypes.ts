import {
  TypeOf,
  array,
  intersection,
  literal,
  number,
  partial,
  record,
  string,
  type,
  union,
  unknown,
} from 'io-ts';

export const target = type({
  organism: string,
  target: string,
});

export const reportStrand = union([literal('Plus'), literal('Minus')]);

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

export const reportHitJson = type({
  num: number,
  description: array(reportDescriptionJson),
  len: number,
  hsps: array(reportHspJson),
});

export const reportStatJson = type({
  db_len: number,
  db_num: number,
  eff_space: number,
  entropy: number,
  hsp_len: number,
  kappa: number,
  lambda: number,
});

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

export const reportResultsJson = type({
  search: reportSearchJson,
});

export const reportSearchTargetJson = type({
  db: string,
});

export const singleQueryReportJson = type({
  params: unknown,
  program: string,
  version: string,
  reference: string,
  search_target: reportSearchTargetJson,
  results: reportResultsJson,
});

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

export const tooLargeError = type({
  status: literal('too-large'),
  message: string,
});

export const unauthorizedError = type({
  status: literal('unauthorized'),
  message: string,
});

export const forbiddenError = type({
  status: literal('forbidden'),
  message: string,
});

export const notFoundError = type({
  status: literal('not-found'),
  message: string,
});

export const methodNotAllowedError = type({
  status: literal('bad-method'),
  message: string,
});

export const inputErrors = type({
  general: array(string),
  byKey: record(string, array(string)),
});

export type InputErrors = TypeOf<typeof inputErrors>;

export const unprocessableEntityError = type({
  status: literal('invalid-input'),
  errors: inputErrors,
});

export const serverError = type({
  status: literal('server-error'),
  message: string,
  requestId: string,
});

export const unknownError = type({
  status: literal('unknown'),
  message: string,
});

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
