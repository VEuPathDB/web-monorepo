import {
  boolean,
  intersection,
  keyof,
  literal,
  number,
  partial,
  string,
  type,
  TypeOf,
  union,
} from 'io-ts';

import { ioBlastQueryConfig, ioBlastStrand } from './blast-common';

// // //
//
//  BlastN Configuration Types
//
// // //

export const ioBlastNTask = keyof({
  blastn: null,
  'blastn-short': null,
  'dc-megablast': null,
  megablast: null,
  rmblastn: null,
});

export type IOBlastNTask = TypeOf<typeof ioBlastNTask>;

//

export const ioBlastNDust = partial({
  enabled: boolean,
  level: number,
  window: number,
  linker: number,
});

export type IOBlastNDust = TypeOf<typeof ioBlastNDust>;

//

export const ioBlastNTemplateType = keyof({
  coding: null,
  'coding-and-optimal': null,
  optimal: null,
});

export type IOBlastNTemplateType = TypeOf<typeof ioBlastNTemplateType>;

//

export const ioBlastNTemplateLength = union([
  literal(16),
  literal(18),
  literal(21),
]);

export type IOBlastNTemplateLength = TypeOf<typeof ioBlastNTemplateLength>;

//

export const ioBlastNConfig = intersection([
  type({
    tool: literal('blastn'),
  }),
  ioBlastQueryConfig,
  partial({
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
    dbSoftMask: string,
    dbHardMask: string,
    percentIdentity: number,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    templateType: ioBlastNTemplateType,
    templateLength: ioBlastNTemplateLength,
    sumStats: boolean,
    xDropoffPrelimGapped: number,
    xDropoffFinalGapped: number,
    nonGreedy: boolean,
    minRawGappedScore: number,
    ungappedOnly: boolean,
    offDiagonalRange: number,
  }),
]);

export type IOBlastNConfig = TypeOf<typeof ioBlastNConfig>;
