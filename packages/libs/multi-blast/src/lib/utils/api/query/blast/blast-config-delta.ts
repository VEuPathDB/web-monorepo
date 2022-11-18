import {
  boolean,
  intersection,
  keyof,
  literal,
  number,
  partial,
  type,
  TypeOf,
} from 'io-ts';
import { ioBlastQueryConfig, ioBlastSeg } from './blast-common';

// // //
//
//  DeltaBlast Configuration Types
//
// // //

export const ioDeltaBlastMatrix = keyof({
  BLOSUM45: null,
  BLOSUM50: null,
  BLOSUM62: null,
  BLOSUM80: null,
  BLOSUM90: null,
  PAM30: null,
  PAM70: null,
  PAM250: null,
});

export type IODeltaBlastMatrix = TypeOf<typeof ioDeltaBlastMatrix>;

//

export const ioDeltaBlastCompBasedStats = keyof({
  none: null,
  'comp-based-stats': null,
});

export type IODeltaBlastCompBasedStats = TypeOf<
  typeof ioDeltaBlastCompBasedStats
>;

//

export const ioDeltaBlastConfig = intersection([
  type({
    tool: literal('deltablast'),
  }),
  ioBlastQueryConfig,
  partial({
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    matrix: ioDeltaBlastMatrix,
    threshold: number,
    compBasedStats: ioDeltaBlastCompBasedStats,
    seg: ioBlastSeg,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    xDropoffPrelimGapped: number,
    xDropoffFinalGapped: number,
    gapTrigger: number,
    useSWTraceback: boolean,
  }),
]);

export type IODeltaBlastConfig = TypeOf<typeof ioDeltaBlastConfig>;
