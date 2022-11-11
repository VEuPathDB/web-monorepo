import {
  boolean,
  intersection,
  literal,
  number,
  partial,
  string,
  type,
  TypeOf,
  union,
} from 'io-ts';

import { ioBlastQueryConfig, ioBlastSeg } from './blast-common';

// // //
//
//  BlastP Configuration Types
//
// // //

export const ioBlastPTask = union([
  literal('blastp'),
  literal('blastp-fast'),
  literal('blastp-short'),
]);

export type IOBlastPTask = TypeOf<typeof ioBlastPTask>;

//

export const ioBlastPMatrix = union([
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

export type IOBlastPMatrix = TypeOf<typeof ioBlastPMatrix>;

//

export const ioBlastPCompBasedStats = union([
  literal('none'),
  literal('comp-based-stats'),
  literal('comp-based-score-adjustment-conditional'),
  literal('comp-based-score-adjustment-unconditional'),
]);

export type IOBlastPCompBasedStats = TypeOf<typeof ioBlastPCompBasedStats>;

//

export const ioBlastPConfig = intersection([
  type({
    tool: literal('blastp'),
  }),
  ioBlastQueryConfig,
  partial({
    task: ioBlastPTask,
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    matrix: ioBlastPMatrix,
    threshold: number,
    compBasedStats: ioBlastPCompBasedStats,
    seg: ioBlastSeg,
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    xDropoffPrelimGapped: number,
    xDropoffFinalGapped: number,
    ungappedOnly: boolean,
    useSWTraceback: boolean,
  }),
]);

export type IOBlastPConfig = TypeOf<typeof ioBlastPConfig>;
