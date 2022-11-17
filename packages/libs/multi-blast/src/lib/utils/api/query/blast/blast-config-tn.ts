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
//  TBlastN Configuration Types
//
// // //

export const ioTBlastNMatrix = keyof({
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

export type IOTBlastNMatrix = TypeOf<typeof ioTBlastNMatrix>;

//

export const ioTBlastNTask = keyof({
  tblastn: null,
  'tblastn-fast': null,
});

export type IOTBlastNTask = TypeOf<typeof ioTBlastNTask>;

//

export const ioTBlastNCompBasedStats = keyof({
  none: null,
  'comp-based-stats': null,
  'comp-based-score-adjustment-conditional': null,
  'comp-based-score-adjustment-unconditional': null,
});

export type IOTBlastNCompBasedStats = TypeOf<typeof ioTBlastNCompBasedStats>;

//

export const ioTBlastNConfig = intersection([
  type({
    tool: literal('tblastn'),
  }),
  ioBlastQueryConfig,
  partial({
    task: ioTBlastNTask,
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    dbGenCode: number,
    maxIntronLength: number,
    matrix: ioTBlastNMatrix,
    threshold: number,
    compBasedStats: ioTBlastNCompBasedStats,
    seg: ioBlastSeg,
    dbSoftMask: string,
    dbHardMask: string,
    cullingLimit: number,
    bestHitOverhang: number,
    betsHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    xDropoffPrelimGapped: number,
    xDropoffFinalGapped: number,
    ungappedOnly: boolean,
    useSWTraceback: boolean,
  }),
]);

export type IOTBlastNConfig = TypeOf<typeof ioTBlastNConfig>;
