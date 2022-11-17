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
//  TBlastX Configuration Types
//
// // //

export const ioTBlastXMatrix = keyof({
  BLOSUM45: null,
  BLOSUM50: null,
  BLOSUM62: null,
  BLOSUM80: null,
  BLOSUM90: null,
  PAM30: null,
  PAM70: null,
  PAM250: null,
});

export type IOTBlastXMatrix = TypeOf<typeof ioTBlastXMatrix>;

//

export const ioTBlastXConfig = intersection([
  type({
    tool: literal('tblastx'),
  }),
  ioBlastQueryConfig,
  partial({
    strand: ioBlastStrand,
    queryGenCode: number,
    wordSize: number,
    maxIntronLength: number,
    matrix: ioTBlastXMatrix,
    threshold: number,
    dbGenCode: number,
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
  }),
]);

export type IOTBlastXConfig = TypeOf<typeof ioTBlastXConfig>;
