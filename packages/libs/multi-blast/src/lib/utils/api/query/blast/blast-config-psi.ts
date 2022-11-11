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
//  PSIBlast Configuration Types
//
// // //

export const ioPSIBlastMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
]);

export type IOPSIBlastMatrix = TypeOf<typeof ioPSIBlastMatrix>;

//

export const ioPSIBlastCompBasedStats = union([
  literal('none'),
  literal('comp-based-stats'),
  literal('comp-based-score-adjustment-conditional'),
  literal('comp-based-score-adjustment-unconditional'),
]);

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
