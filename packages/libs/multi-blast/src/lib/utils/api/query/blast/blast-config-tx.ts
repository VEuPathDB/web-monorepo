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
//  TBlastX Configuration Types
//
// // //

export const ioTBlastXMatrix = union([
  literal('BLOSUM45'),
  literal('BLOSUM50'),
  literal('BLOSUM62'),
  literal('BLOSUM80'),
  literal('BLOSUM90'),
  literal('PAM30'),
  literal('PAM70'),
  literal('PAM250'),
]);

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
