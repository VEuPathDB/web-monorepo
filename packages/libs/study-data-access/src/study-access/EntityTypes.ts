import {
  TypeOf,
  array,
  boolean,
  intersection,
  literal,
  number,
  type,
  union,
  partial,
  record,
  string,
  keyof,
} from 'io-ts';

export const datastoreId = number;

export type DatastoreId = TypeOf<typeof datastoreId>;

export const userDetails = type({
  userId: number,
  firstName: string,
  lastName: string,
  organization: string,
  email: string,
});

export type UserDetails = TypeOf<typeof userDetails>;

export const staff = type({
  staffId: datastoreId,
  user: userDetails,
  isOwner: boolean,
});

export type Staff = TypeOf<typeof staff>;

export const staffList = type({
  data: array(staff),
  rows: number,
  offset: number,
  total: number,
});

export type StaffList = TypeOf<typeof staffList>;

export const newStaffRequest = type({
  userId: number,
  isOwner: boolean,
});

export type NewStaffRequest = TypeOf<typeof newStaffRequest>;

export const newStaffResponse = type({
  staffId: number,
});

export type NewStaffResponse = TypeOf<typeof newStaffResponse>;

export const staffPatch = array(
  type({
    op: literal('replace'),
    path: literal('/isOwner'),
    value: boolean,
  })
);

export type StaffPatch = TypeOf<typeof staffPatch>;

export const restrictionLevel = keyof({
  public: null,
  prerelease: null,
  protected: null,
  controlled: null,
  private: null,
});

export type RestrictionLevel = TypeOf<typeof restrictionLevel>;

export const approvalStatus = keyof({
  approved: null,
  requested: null,
  denied: null,
});

export type ApprovalStatus = TypeOf<typeof approvalStatus>;

export const endUser = intersection([
  type({
    user: userDetails,
    datasetId: string,
    restrictionLevel,
    approvalStatus,
  }),
  partial({
    startDate: string,
    duration: number,
    // FIXME: The api docs say this is required. Who is right?
    purpose: string,
    // FIXME: The api docs say this is required. Who is right?
    researchQuestion: string,
    // FIXME: The api docs say this is required. Who is right?
    analysisPlan: string,
    // FIXME: The api docs say this is required. Who is right?
    disseminationPlan: string,
    denialReason: string,
    // FIXME: The api docs say this is required. Who is right?
    priorAuth: string,
  }),
]);

export type EndUser = TypeOf<typeof endUser>;

export const endUserCreateRequest = intersection([
  union([type({ userId: number }), type({ email: string })]),
  intersection([
    type({
      purpose: string,
      researchQuestion: string,
      analysisPlan: string,
      disseminationPlan: string,
      priorAuth: string,
      datasetId: string,
    }),
    partial({
      startDate: string,
      duration: number,
      restrictionLevel: restrictionLevel,
      approvalStatus: approvalStatus,
      denialReason: string,
    }),
  ]),
]);

export type EndUserCreateRequest = TypeOf<typeof endUserCreateRequest>;

export const endUserCreateResponse = union([
  type({
    created: literal(false),
  }),
  type({
    created: literal(true),
    endUserId: string,
  }),
]);

export type EndUserCreateResponse = TypeOf<typeof endUserCreateResponse>;

export const endUserList = type({
  data: array(endUser),
  rows: number,
  offset: number,
  total: number,
});

export type EndUserList = TypeOf<typeof endUserList>;

export const endUserPatchOp = keyof({
  add: null,
  remove: null,
  replace: null,
});

export type EndUserPatchOp = TypeOf<typeof endUserPatchOp>;

export const endUserPatch = array(
  union([
    type({
      op: literal('add'),
      path: string,
      value: string,
    }),
    type({
      op: literal('remove'),
      path: string,
    }),
    type({
      op: literal('replace'),
      path: string,
      value: string,
    }),
  ])
);

export type EndUserPatch = TypeOf<typeof endUserPatch>;

export const datasetProvider = type({
  providerId: number,
  datasetId: string,
  user: userDetails,
  isManager: boolean,
});

export type DatasetProvider = TypeOf<typeof datasetProvider>;

export const datasetProviderList = type({
  data: array(datasetProvider),
  rows: number,
  offset: number,
  total: number,
});

export type DatasetProviderList = TypeOf<typeof datasetProviderList>;

export const datasetProviderCreateRequest = intersection([
  union([type({ userId: number }), type({ email: string })]),
  type({
    datasetId: string,
    isManager: boolean,
  }),
]);

export type DatasetProviderCreateRequest = TypeOf<
  typeof datasetProviderCreateRequest
>;

export const datasetProviderCreateResponse = union([
  type({
    created: literal(false),
  }),
  type({
    created: literal(true),
    providerId: number,
  }),
]);

export type DatasetProviderCreateResponse = TypeOf<
  typeof datasetProviderCreateResponse
>;

export const datasetProviderPatch = array(
  type({
    op: literal('replace'),
    path: literal('/isManager'),
    value: boolean,
  })
);

export type DatasetProviderPatch = TypeOf<typeof datasetProviderPatch>;

export const actionAuthorization = type({
  studyMetadata: boolean,
  subsetting: boolean,
  visualizations: boolean,
  resultsFirstPage: boolean,
  resultsAll: boolean,
});

export type ActionAuthorization = TypeOf<typeof actionAuthorization>;

export const permissionEntryBase = type({
  studyId: string,
  sha1Hash: string,
  isUserStudy: boolean,
  actionAuthorization,
});

export type PermissionEntryBase = TypeOf<typeof permissionEntryBase>;

export const providerPermissionEntry = intersection([
  permissionEntryBase,
  type({
    type: literal('provider'),
    isManager: boolean,
  }),
]);

export type ProviderPermissionEntry = TypeOf<typeof providerPermissionEntry>;

export const endUserPermissionEntry = intersection([
  permissionEntryBase,
  type({
    type: literal('end-user'),
  }),
]);

export type EndUserPermissionEntry = TypeOf<typeof endUserPermissionEntry>;

export const datasetPermissionEntry = union([
  providerPermissionEntry,
  endUserPermissionEntry,
]);

export type DatasetPermissionEntry = TypeOf<typeof datasetPermissionEntry>;

export const permissionsResponse = intersection([
  type({
    perDataset: record(string, datasetPermissionEntry),
  }),
  partial({
    isOwner: boolean,
    isStaff: boolean,
  }),
]);

export type PermissionsResponse = TypeOf<typeof permissionsResponse>;

export const historyMeta = type({
  rows: number,
  offset: number,
});

export type HistoryMeta = TypeOf<typeof historyMeta>;

export const historyUser = type({
  userID: number,
  firstName: string,
  lastName: string,
  organization: string,
  email: string,
});

export type HistoryUser = TypeOf<typeof historyUser>;

export const historyCause = type({
  user: historyUser,
  action: keyof({
    CREATE: null,
    UPDATE: null,
    DELETE: null,
  }),
  timestamp: string,
});

export type HistoryCause = TypeOf<typeof historyCause>;

export const historyRow = intersection([
  type({
    endUserID: number,
    user: historyUser,
    datasetPresenterID: string,
    restrictionLevel: keyof({
      PUBLIC: null,
      PRERELEASE: null,
      PROTECTED: null,
      CONTROLLED: null,
      PRIVATE: null,
    }),
    approvalStatus: keyof({
      APPROVED: null,
      REQUESTED: null,
      DENIED: null,
    }),
    startDate: string,
    duration: number,
    allowSelfEdits: boolean,
  }),
  partial({
    // FIXME: The api docs say this is required. Who is right?
    purpose: string,
    // FIXME: The api docs say this is required. Who is right?
    researchQuestion: string,
    // FIXME: The api docs say this is required. Who is right?
    analysisPlan: string,
    // FIXME: The api docs say this is required. Who is right?
    disseminationPlan: string,
    // FIXME: The api docs say this is required. Who is right?
    denialReason: string,
    // FIXME: The api docs say this is required. Who is right?
    dateDenied: string,
    // FIXME: The api docs say this is required. Who is right?
    priorAuth: string,
  }),
]);

export type HistoryRow = TypeOf<typeof historyRow>;

export const historyResult = type({
  cause: historyCause,
  row: historyRow,
});

export type HistoryResult = TypeOf<typeof historyResult>;

export const historyResponse = type({
  meta: historyMeta,
  results: array(historyResult),
});

export type HistoryResponse = TypeOf<typeof historyResponse>;

export const badRequest = type({
  status: literal('bad-request'),
  message: string,
});

export type BadRequest = TypeOf<typeof badRequest>;

export const unauthorized = type({
  status: literal('unauthorized'),
  message: string,
});

export type Unauthorized = TypeOf<typeof unauthorized>;

export const forbidden = type({
  status: literal('forbidden'),
  message: string,
});

export type Forbidden = TypeOf<typeof forbidden>;

export const notFound = type({
  status: literal('not-found'),
  message: string,
});

export type NotFound = TypeOf<typeof notFound>;

export const methodNotAllowed = type({
  status: literal('bad-method'),
  message: string,
});

export type MethodNotAllowed = TypeOf<typeof methodNotAllowed>;

export const unprocessableEntity = type({
  status: literal('invalid-input'),
  message: string,
  errors: type({
    general: array(string),
    byKey: record(string, array(string)),
  }),
});

export type UnprocessableEntity = TypeOf<typeof unprocessableEntity>;

export const serverError = type({
  status: literal('server-error'),
  message: string,
  requestId: string,
});

export type ServerError = TypeOf<typeof serverError>;
