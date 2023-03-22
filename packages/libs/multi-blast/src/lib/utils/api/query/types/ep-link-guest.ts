import { number, type, TypeOf } from 'io-ts';

export const ioGuestJobTransferRequest = type({ guestID: number });

export type IOGuestJobTransferRequest = TypeOf<
  typeof ioGuestJobTransferRequest
>;
