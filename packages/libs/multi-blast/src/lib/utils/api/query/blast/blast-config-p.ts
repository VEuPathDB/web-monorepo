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
} from 'io-ts';

import { ioBlastQueryConfig, ioBlastSeg } from './blast-common';

// // //
//
//  BlastP Configuration Types
//
// // //

export const ioBlastPTask = keyof({
  blastp: null,
  'blastp-fast': null,
  'blastp-short': null,
});

export type IOBlastPTask = TypeOf<typeof ioBlastPTask>;

//

export const ioBlastPMatrix = keyof({
  BLOSUM45: null,
  BLOSUM50: null,
  BLOSUM62: null,
  BLOSUM80: null,
  BLOSUM90: null,
  PAM30: null,
  PAM70: null,
  PAM250: null,
  IDENTITY: null,
});

export type IOBlastPMatrix = TypeOf<typeof ioBlastPMatrix>;

//

export const ioBlastPCompBasedStats = keyof({
  none: null,
  'comp-based-stats': null,
  'comp-based-score-adjustment-conditional': null,
  'comp-based-score-adjustment-unconditional': null,
});

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
