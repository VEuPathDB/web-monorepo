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
import { ioBlastQueryConfig, ioBlastSeg, ioBlastStrand } from './blast-common';

// // //
//
//  RPSTBlastN Configuration Types
//
// // //

export const ioRPSTBlastNCompBasedStats = keyof({
  none: null,
  'comp-based-stats': null,
});

export type IORPSTBlastNCompBasedStats = TypeOf<
  typeof ioRPSTBlastNCompBasedStats
>;

//

export const ioRPSTBlastNConfig = intersection([
  type({
    tool: literal('rpstblastn'),
  }),
  ioBlastQueryConfig,
  partial({
    queryGenCode: number,
    strand: ioBlastStrand,
    compBasedStats: ioRPSTBlastNCompBasedStats,
    seg: ioBlastSeg,
    sumStats: number,
    xDropoffPrelimGapped: number,
    xDropoffFinalGapped: number,
    ungappedOnly: boolean,
    useSWTraceback: boolean,
  }),
]);

export type IORPSTBlastNConfig = TypeOf<typeof ioRPSTBlastNConfig>;
