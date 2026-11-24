import * as io from 'io-ts';

export const ContainerCoreErrorCodes = {
  BadRequest: 'bad-request',
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  NotFound: 'not-found',
  BadMethod: 'bad-method',
  Conflict: 'conflict',
  Gone: 'gone',
  InvalidInput: 'invalid-input',
  FailedDependency: 'failed-dependency',
  TooEarly: 'too-early',
  InternalServerError: 'server-error',
} as const;

const makeErrorBody = <T extends string>(status: T) => io.intersection([
  io.type({ status: io.literal(status) }),
  io.partial({ message: io.string }),
]);

export const cc400Body = makeErrorBody(ContainerCoreErrorCodes.BadRequest);
export const cc401Body = makeErrorBody(ContainerCoreErrorCodes.Unauthorized);
export const cc403Body = makeErrorBody(ContainerCoreErrorCodes.Forbidden);
export const cc404Body = makeErrorBody(ContainerCoreErrorCodes.NotFound);
export const cc405Body = makeErrorBody(ContainerCoreErrorCodes.BadMethod);
export const cc409Body = makeErrorBody(ContainerCoreErrorCodes.Conflict);
export const cc410Body = makeErrorBody(ContainerCoreErrorCodes.Gone);
export const cc424Body = makeErrorBody(ContainerCoreErrorCodes.FailedDependency);
export const cc425Body = makeErrorBody(ContainerCoreErrorCodes.TooEarly);

export const simpleContainerCoreErrorBody = io.union([
  cc400Body,
  cc401Body,
  cc403Body,
  cc404Body,
  cc405Body,
  cc409Body,
  cc410Body,
  cc424Body,
  cc425Body,
]);
export type SimpleServiceErrorBody = io.TypeOf<
  typeof simpleContainerCoreErrorBody
>;

export const ccServerErrorBody = io.intersection([
  io.type({
    status: io.literal(ContainerCoreErrorCodes.InternalServerError),
    requestId: io.string,
  }),
  io.partial({ message: io.string }),
]);
export type ServerErrorBody = io.TypeOf<typeof ccServerErrorBody>;

const ccValidationErrors = io.type({
  general: io.array(io.string),
  byKey: io.record(io.string, io.array(io.string)),
});
export type ValidationErrors = io.TypeOf<typeof ccValidationErrors>;

export const ccValidationErrorBody = io.intersection([
  io.type({
    status: io.literal(ContainerCoreErrorCodes.InvalidInput),
    errors: ccValidationErrors,
  }),
  io.partial({ message: io.string }),
]);
export type ValidationErrorBody = io.TypeOf<typeof ccValidationErrorBody>;

export const ccErrorBodyUnion = io.union([
  ccValidationErrorBody,
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
]);
export type ServiceError = io.TypeOf<typeof ccErrorBodyUnion>;
