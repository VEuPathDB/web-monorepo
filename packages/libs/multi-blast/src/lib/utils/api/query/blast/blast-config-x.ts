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

import { ioBlastQueryConfig, ioBlastSeg, ioBlastStrand } from './blast-common';

// // //
//
//  BlastX Configuration Types
//
// // //

export const ioBlastXTask = union([literal('blastx'), literal('blastx-fast')]);

export type IOBlastXTask = TypeOf<typeof ioBlastXTask>;

//

export const ioBlastXMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
]);

export type IOBlastXMatrix = TypeOf<typeof ioBlastXMatrix>;

//

export const ioBlastXCompBasedStats = union([
  literal('none'),
  literal('comp-based-stats'),
  literal('comp-based-score-adjustment-conditional'),
  literal('comp-based-score-adjustment-unconditional'),
]);

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
