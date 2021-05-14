import {
  Unpack,
  arrayOf,
  boolean,
  combine,
  constant,
  number,
  objectOf,
  oneOf,
  optional,
  record,
  string
} from '@veupathdb/wdk-client/lib/Utils/Json';

export const datastoreId = number;

export type DatastoreId = Unpack<typeof datastoreId>;

export const userDetails = record({
  userId: number,
  firstName: string,
  lastName: string,
  organization: string,
  email: string
});

export type UserDetails = Unpack<typeof userDetails>;

export const staff = record({
  staffId: datastoreId,
  user: userDetails,
  isOwner: boolean
});

export type Staff = Unpack<typeof staff>;

export const staffList = record({
  data: arrayOf(staff),
  rows: number,
  offset: number,
  total: number
});

export type StaffList = Unpack<typeof staffList>;

export const newStaffRequest = record({
  userId: number,
  isOwner: boolean
});

export type NewStaffRequest = Unpack<typeof newStaffRequest>;

export const newStaffResponse = record({
  staffId: number
});

export type NewStaffResponse = Unpack<typeof newStaffResponse>;

export const staffPatch = arrayOf(
  record({
    op: constant('replace'),
    path: constant('/isOwner'),
    value: boolean
  })
);

export type StaffPatch = Unpack<typeof staffPatch>;

export const restrictionLevel = oneOf(
  constant('public'),
  constant('prerelease'),
  constant('protected'),
  constant('controlled'),
  constant('private')
);

export type RestrictionLevel = Unpack<typeof restrictionLevel>;

export const approvalStatus = oneOf(
  constant('approved'),
  constant('requested'),
  constant('denied')
);

export type ApprovalStatus = Unpack<typeof approvalStatus>;

export const endUser = record({
  user: userDetails,
  datasetId: string,
  startDate: optional(string),
  duration: optional(number),
  restrictionLevel,
  // FIXME: The api docs say this is required. Who is right?
  purpose: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  researchQuestion: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  analysisPlan: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  disseminationPlan: optional(string),
  approvalStatus,
  denialReason: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  priorAuth: optional(string)
});

export type EndUser = Unpack<typeof endUser>;

export const endUserCreateRequest = combine(
  oneOf(
    record({ userId: number }),
    record({ email: string })
  ),
  record({
    purpose: string,
    researchQuestion: string,
    analysisPlan: string,
    disseminationPlan: string,
    priorAuth: string,
    datasetId: string,
    startDate: optional(string),
    duration: optional(number),
    restrictionLevel: optional(restrictionLevel),
    approvalStatus: optional(approvalStatus),
    denialReason: optional(string)
  })
);

export type EndUserCreateRequest = Unpack<typeof endUserCreateRequest>;

export const endUserCreateResponse = oneOf(
  record({
    created: constant(false)
  }),
  record({
    created: constant(true),
    endUserId: string
  })
);

export type EndUserCreateResponse = Unpack<typeof endUserCreateResponse>;

export const endUserList = record({
  data: arrayOf(endUser),
  rows: number,
  offset: number,
  total: number
});

export type EndUserList = Unpack<typeof endUserList>;

export const endUserPatchOp = oneOf(
  constant('add'),
  constant('remove'),
  constant('replace')
);

export type EndUserPatchOp = Unpack<typeof endUserPatchOp>;

export const endUserPatch = arrayOf(
  oneOf(
    record({
      op: constant('add'),
      path: string,
      value: string
    }),
    record({
      op: constant('remove'),
      path: string
    }),
    record({
      op: constant('replace'),
      path: string,
      value: string
    })
  )
);

export type EndUserPatch = Unpack<typeof endUserPatch>;

export const datasetProvider = record({
  providerId: number,
  datasetId: string,
  user: userDetails,
  isManager: boolean
});

export type DatasetProvider = Unpack<typeof datasetProvider>;

export const datasetProviderList = record({
  data: arrayOf(datasetProvider),
  rows: number,
  offset: number,
  total: number
});

export type DatasetProviderList = Unpack<typeof datasetProviderList>;

export const datasetProviderCreateRequest = combine(
  oneOf(
    record({ userId: number }),
    record({ email: string })
  ),
  record({
    datasetId: string,
    isManager: boolean
  })
);

export type DatasetProviderCreateRequest = Unpack<typeof datasetProviderCreateRequest>;

export const datasetProviderCreateResponse = oneOf(
  record({
    created: constant(false)
  }),
  record({
    created: constant(true),
    providerId: number
  })
);

export type DatasetProviderCreateResponse = Unpack<typeof datasetProviderCreateResponse>;

export const datasetProviderPatch = arrayOf(
  record({
    op: constant('replace'),
    path: constant('/isManager'),
    value: boolean
  })
);

export type DatasetProviderPatch = Unpack<typeof datasetProviderPatch>;

export const providerPermissionEntry = record({
  type: constant('provider'),
  isManager: boolean
});

export type ProviderPermissionEntry = Unpack<typeof providerPermissionEntry>;

export const endUserPermissionEntry = record({
  type: constant('end-user')
});

export type EndUserPermissionEntry = Unpack<typeof endUserPermissionEntry>;

export const datasetPermissionEntry = oneOf(
  providerPermissionEntry,
  endUserPermissionEntry
);

export type DatasetPermissionEntry = Unpack<typeof datasetPermissionEntry>;

export const permissionsResponse = record({
  isOwner: optional(boolean),
  isStaff: optional(boolean),
  perDataset: optional(objectOf(datasetPermissionEntry))
});

export type PermissionsResponse = Unpack<typeof permissionsResponse>;

export const historyMeta = record({
  rows: number,
  offset: number
});

export type HistoryMeta = Unpack<typeof historyMeta>;

export const historyCause = record({
  user: userDetails,
  action: oneOf(
    constant('CREATE'),
    constant('UPDATE'),
    constant('DELETE')
  ),
  timestamp: string
});

export type HistoryCause = Unpack<typeof historyCause>;

export const historyRow = record({
  endUserID: number,
  user: userDetails,
  datasetPresenterID: string,
  restrictionLevel: oneOf(
    constant('PUBLIC'),
    constant('PRERELEASE'),
    constant('PROTECTED'),
    constant('CONTROLLED'),
    constant('PRIVATE')
  ),
  approvalStatus: oneOf(
    constant('APPROVED'),
    constant('REQUESTED'),
    constant('DENIED')
  ),
  startDate: string,
  duration: number,
  // FIXME: The api docs say this is required. Who is right?
  purpose: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  researchQuestion: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  analysisPlan: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  disseminationPlan: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  denialReason: optional(string),
  // FIXME: The api docs say this is required. Who is right?
  dateDenied: optional(string),
  allowSelfEdits: boolean
});

export type HistoryRow = Unpack<typeof historyRow>;

export const historyResult = record({
  cause: historyCause,
  row: historyRow
});

export type HistoryResult = Unpack<typeof historyResult>;

export const historyResponse = record({
  meta: historyMeta,
  results: arrayOf(historyResult)
});

export type HistoryResponse = Unpack<typeof historyResponse>;

export const badRequest = record({
  status: constant('bad-request'),
  message: string
});

export type BadRequest = Unpack<typeof badRequest>;

export const unauthorized = record({
  status: constant('unauthorized'),
  message: string
});

export type Unauthorized = Unpack<typeof unauthorized>;

export const forbidden = record({
  status: constant('forbidden'),
  message: string
});

export type Forbidden = Unpack<typeof forbidden>;

export const notFound = record({
  status: constant('not-found'),
  message: string
});

export type NotFound = Unpack<typeof notFound>;

export const methodNotAllowed = record({
  status: constant('bad-method'),
  message: string
});

export type MethodNotAllowed = Unpack<typeof methodNotAllowed>;

export const unprocessableEntity = record({
  status: constant('invalid-input'),
  message: string,
  errors: record({
    general: arrayOf(string),
    byKey: objectOf(arrayOf(string))
  })
});

export type UnprocessableEntity = Unpack<typeof unprocessableEntity>;

export const serverError = record({
  status: constant('server-error'),
  message: string,
  requestId: string
});

export type ServerError = Unpack<typeof serverError>;
