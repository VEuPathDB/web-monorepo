import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import {
  Action,
  actionCategories,
} from '../data-restriction/DataRestrictionUiActions';

import {
  ApprovalStatus,
  DatasetPermissionEntry,
  PermissionsResponse,
} from './EntityTypes';
import { StudyAccessApi } from './api';

export type UserPermissions = StaffPermissions | ExternalUserPermissions;

export interface StaffPermissions {
  type: 'staff';
  isOwner: boolean;
  perDataset: Record<string, DatasetPermissionEntry | undefined>;
}
export interface ExternalUserPermissions {
  type: 'external';
  perDataset: Record<string, DatasetPermissionEntry | undefined>;
}

export function permissionsResponseToUserPermissions(
  permissionsResponse: PermissionsResponse
): UserPermissions {
  if (
    permissionsResponse.isStaff === true ||
    permissionsResponse.isOwner === true
  ) {
    return {
      type: 'staff',
      isOwner: !!permissionsResponse.isOwner,
      perDataset: permissionsResponse.perDataset,
    };
  } else {
    return {
      type: 'external',
      perDataset: permissionsResponse.perDataset,
    };
  }
}

export function isOwner(userPermissions: UserPermissions) {
  return userPermissions.type === 'staff' && userPermissions.isOwner;
}

export function isStaff(userPermissions: UserPermissions) {
  return userPermissions.type === 'staff';
}

export function isManager(userPermissions: UserPermissions, datasetId: string) {
  if (userPermissions.type !== 'external') {
    return false;
  }

  const datasetPermissions = userPermissions.perDataset[datasetId];

  return (
    datasetPermissions?.type === 'provider' && datasetPermissions.isManager
  );
}

export function isProvider(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return (
    userPermissions.type === 'external' &&
    userPermissions.perDataset[datasetId]?.type === 'provider'
  );
}

export function canAccessDashboard(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return isStaff(userPermissions) || isProvider(userPermissions, datasetId);
}

export function shouldOfferLinkToDashboard(
  userPermissions: UserPermissions,
  datasetId?: string
) {
  return (
    isOwner(userPermissions) ||
    (datasetId != null && isManager(userPermissions, datasetId))
  );
}

export function shouldDisplayStaffTable(userPermissions: UserPermissions) {
  return isStaff(userPermissions);
}

// By "updating staff", we mean:
// (1) adding a new staff member
// (2) removing an existing staff member
// (3) altering a staff member's "owner"ship
export function canUpdateStaff(userPermissions: UserPermissions) {
  return isOwner(userPermissions);
}

export function shouldDisplayProvidersTable(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return isStaff(userPermissions) || isProvider(userPermissions, datasetId);
}

export function canAddProviders(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return isOwner(userPermissions) || isManager(userPermissions, datasetId);
}

export function canRemoveProviders(userPermissions: UserPermissions) {
  return isOwner(userPermissions);
}

export function canUpdateProviders(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return isOwner(userPermissions) || isManager(userPermissions, datasetId);
}

export function shouldDisplayEndUsersTable(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return canAccessDashboard(userPermissions, datasetId);
}

export function canAddEndUsers(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return isOwner(userPermissions) || isManager(userPermissions, datasetId);
}

export function canRemoveEndUsers(userPermissions: UserPermissions) {
  return isOwner(userPermissions);
}

export function canUpdateApprovalStatus(
  userPermissions: UserPermissions,
  datasetId: string
) {
  return isOwner(userPermissions) || isProvider(userPermissions, datasetId);
}

export function shouldDisplayHistoryTable(userPermissions: UserPermissions) {
  return isOwner(userPermissions);
}

export function isUserApprovedForAction(
  userPermissions: UserPermissions,
  datasetId: string,
  action: Action
) {
  const actionAuthorization =
    userPermissions.perDataset[datasetId]?.actionAuthorization;

  if (actionAuthorization == null) {
    return false;
  }

  return actionAuthorization[actionCategories[action]];
}

export function isUserFullyApprovedForStudy(
  userPermissions: UserPermissions,
  datasetId: string
) {
  const actionAuthorization =
    userPermissions.perDataset[datasetId]?.actionAuthorization;

  if (actionAuthorization == null) {
    return false;
  }

  return Object.values(actionAuthorization).every(
    (isApprovedForAction) => isApprovedForAction === true
  );
}

async function fetchPermissions(studyAccessApi: StudyAccessApi) {
  const permissionsResponse = await studyAccessApi.fetchPermissions();

  return permissionsResponseToUserPermissions(permissionsResponse);
}

export async function checkPermissions(
  user: User,
  studyAccessApi: StudyAccessApi
): Promise<UserPermissions> {
  return await fetchPermissions(studyAccessApi);
}

export function permittedApprovalStatusChanges(
  oldApprovalStatus: ApprovalStatus
): ApprovalStatus[] {
  return oldApprovalStatus === 'requested'
    ? ['requested', 'approved', 'denied']
    : oldApprovalStatus === 'approved'
    ? ['approved', 'denied']
    : ['requested', 'approved', 'denied'];
}

// The following is used for legacy sites (such as MicrobiomeDB)
// that would return an empty perDataset obj

const stubbedPermissionEntry: Omit<DatasetPermissionEntry, 'isUserStudy'> = {
  type: 'end-user',
  studyId: 'stub',
  sha1Hash: 'stub-hash',
  actionAuthorization: {
    studyMetadata: true,
    subsetting: true,
    visualizations: true,
    resultsFirstPage: true,
    resultsAll: true,
  },
};

export const stubbedPerDataset: Record<string, DatasetPermissionEntry> =
  new Proxy(
    {},
    {
      get(target, property, receiver) {
        // Always return the stubbed permission entry,
        // regardless of which property (dataset id) is requested
        return stubbedPermissionEntry;
      },
    }
  );
