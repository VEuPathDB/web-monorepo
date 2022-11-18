import { number, string, type, TypeOf } from 'io-ts';

export const ioFileEntry = type({
  name: string,
  size: number,
});

export type IOFileEntry = TypeOf<typeof ioFileEntry>;
