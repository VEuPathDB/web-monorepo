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

import { ioBlastQueryConfig, ioBlastSeg, ioBlastStrand } from './blast-common';

// // //
//
//  BlastX Configuration Types
//
// // //

export const ioBlastXTask = keyof({
  blastx: null,
  'blastx-fast': null,
});

export type IOBlastXTask = TypeOf<typeof ioBlastXTask>;

//

export const ioBlastXMatrix = keyof({
  BLOSUM45: null,
  BLOSUM50: null,
  BLOSUM62: null,
  BLOSUM80: null,
  BLOSUM90: null,
  PAM30: null,
  PAM70: null,
  PAM250: null,
});

export type IOBlastXMatrix = TypeOf<typeof ioBlastXMatrix>;

//

export const ioBlastXCompBasedStats = keyof({
  none: null,
  'comp-based-stats': null,
  'comp-based-score-adjustment-conditional': null,
  'comp-based-score-adjustment-unconditional': null,
});

export type IOBlastXCompBasedStats = TypeOf<typeof ioBlastXCompBasedStats>;

//

export const ioBlastXConfig = intersection([
  type({
    tool: literal('blastx'),
  }),
  ioBlastQueryConfig,
  partial({
    strand: ioBlastStrand,
    queryGenCode: number,
    task: ioBlastXTask,
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    maxIntronLength: number,
    matrix: ioBlastXMatrix,
    threshold: number,
    compBasedStats: ioBlastXCompBasedStats,
    seg: ioBlastSeg,
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    xDropoffPrelimGapped: number,
    xDropoffFinalGapped: number,
    ungappedOnly: boolean,
    useSWTraceback: boolean,
  }),
]);

export type IOBlastXConfig = TypeOf<typeof ioBlastXConfig>;
