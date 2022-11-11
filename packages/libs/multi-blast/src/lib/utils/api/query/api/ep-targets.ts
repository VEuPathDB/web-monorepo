import { array, partial, record, string, TypeOf } from 'io-ts';

export const ioBlastableTarget = partial({
  naTargets: array(string),
  aaTargets: array(string),
});

export const ioBlastTargetMap = record(string, ioBlastableTarget);

export const ioBlastTargetIndex = record(string, ioBlastTargetMap);

export type IOBlastableTarget = TypeOf<typeof ioBlastableTarget>;
export type IOBlastTargetMap = TypeOf<typeof ioBlastTargetMap>;
export type IOBlastTargetIndex = TypeOf<typeof ioBlastTargetIndex>;
