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
//  PSIBlast Configuration Types
//
// // //

export const ioPSIBlastMatrix = keyof({
  BLOSUM45: null,
  BLOSUM50: null,
  BLOSUM62: null,
  BLOSUM80: null,
  BLOSUM90: null,
  PAM30: null,
  PAM70: null,
  PAM250: null,
});

export type IOPSIBlastMatrix = TypeOf<typeof ioPSIBlastMatrix>;

//

export const ioPSIBlastCompBasedStats = keyof({
  none: null,
  'comp-based-stats': null,
  'comp-based-score-adjustment-conditional': null,
  'comp-based-score-adjustment-unconditional': null,
});

export type IOPSIBlastCompBasedStats = TypeOf<typeof ioPSIBlastCompBasedStats>;

//

export const ioPSIBlastConfig = intersection([
  type({
    tool: literal('psiblast'),
  }),
  ioBlastQueryConfig,
  partial({
    wordSize: number,
    gapOpen: number,
    gapExtend: number,
    matrix: ioPSIBlastMatrix,
    threshold: number,
    compBasedStats: ioPSIBlastCompBasedStats,
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

export type IOPSIBlastConfig = TypeOf<typeof ioPSIBlastConfig>;
