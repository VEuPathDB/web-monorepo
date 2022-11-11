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
//  TBlastN Configuration Types
//
// // //

export const ioTBlastNMatrix = union([
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

export type IOTBlastNMatrix = TypeOf<typeof ioTBlastNMatrix>;

//

export const ioTBlastNTask = union([
  literal('tblastn'),
  literal('tblastn-fast'),
]);

export type IOTBlastNTask = TypeOf<typeof ioTBlastNTask>;

//

export const ioTBlastNCompBasedStats = union([
  literal('none'),
  literal('comp-based-stats'),
  literal('comp-based-score-adjustment-conditional'),
  literal('comp-based-score-adjustment-unconditional'),
]);

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
