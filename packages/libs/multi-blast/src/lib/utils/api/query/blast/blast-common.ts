import {
  boolean,
  literal,
  number,
  partial,
  string,
  type,
  TypeOf,
  union,
} from 'io-ts';

// // //
//
//  Common Blast Types
//
//  Types that are common across multiple blast configuration specifications.
//
// // //

export const ioBlastLocation = type({
  start: number,
  stop: number,
});

export type IOBlastLocation = TypeOf<typeof ioBlastLocation>;

//

export const ioBlastSeg = partial({
  enabled: boolean,
  window: number,
  locut: number,
  hicut: number,
});

export type IOBlastSeg = TypeOf<typeof ioBlastSeg>;

//

export const ioBlastStrand = union([
  literal('plus'),
  literal('minus'),
  literal('both'),
]);

export type IOBlastStrand = TypeOf<typeof ioBlastStrand>;

//

export const ioBlastQueryConfig = partial({
  queryLocation: ioBlastLocation,
  eValue: string,
  softMasking: boolean,
  lowercaseMasking: boolean,
  queryCoverageHSPPercent: number,
  maxHSPs: number,
  maxTargetSequences: number,
  dbSize: number,
  searchSpace: number,
  xDropoffUngapped: number,
  windowSize: number,
  parseDefLines: boolean,
});

export type IOBlastQueryConfig = TypeOf<typeof ioBlastQueryConfig>;

//
