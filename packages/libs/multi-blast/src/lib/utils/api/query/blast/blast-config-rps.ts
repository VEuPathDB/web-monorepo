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
//  RPSBlast Configuration Types
//
// // //

export const ioRPSBlastCompBasedStats = union([
  literal('simplified'),
  literal('comp-based-stats'),
]);

export type IORPSBlastCompBasedStats = TypeOf<typeof ioRPSBlastCompBasedStats>;

//

export const ioRPSBlastConfig = intersection([
  type({
    tool: literal('rpsblast'),
  }),
  ioBlastQueryConfig,
  partial({
    compBasedStats: ioRPSBlastCompBasedStats,
    seg: ioBlastSeg,
    cullingLimit: number,
    bestHitOverhang: number,
    bestHitScoreEdge: number,
    subjectBestHit: boolean,
    sumStats: boolean,
    xDropoffPrelimGapped: number,
    xDropoffFinalGapped: number,
    useSWTraceback: boolean,
  }),
]);

export type IORPSBlastConfig = TypeOf<typeof ioRPSBlastConfig>;
