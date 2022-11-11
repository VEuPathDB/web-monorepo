import {
  boolean,
  intersection,
  literal,
  number,
  partial,
  type,
  TypeOf,
  union,
} from 'io-ts';
import { ioBlastQueryConfig, ioBlastSeg } from './blast-common';

// // //
//
//  DeltaBlast Configuration Types
//
// // //

export const ioDeltaBlastMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
]);

export type IODeltaBlastMatrix = TypeOf<typeof ioDeltaBlastMatrix>;

//

export const ioDeltaBlastCompBasedStats = union([
  literal('none'),
  literal('comp-based-stats'),
]);

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
