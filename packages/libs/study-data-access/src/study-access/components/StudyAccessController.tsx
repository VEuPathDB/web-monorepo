import React from 'react';

import {
  Loading,
  PermissionDenied,
} from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';

import { canAccessDashboard } from '../permission';
import { StudyAccess } from './StudyAccess';
import {
  useEndUserTableSectionConfig,
  useOpenDialogConfig,
  useProviderTableSectionConfig,
  useStaffTableSectionConfig,
  useStudy,
  useStudyAccessApi,
  useTableUiState,
  useUserPermissions,
  useHistoryTableSectionConfig,
} from '../studyAccessHooks';
import { getStudyName } from '../../shared/studies';

interface Props {
  datasetId: string;
}

export default function StudyAccessController({ datasetId }: Props) {
  const userProfile = useWdkService(
    (wdkService) => wdkService.getCurrentUser(),
    []
  );

  const study = useStudy(datasetId);

  const studyAccessApi = useStudyAccessApi();

  const { value: userPermissions } = useUserPermissions(
    studyAccessApi.fetchPermissions
  );

  const dashboardAccessAllowed =
    userPermissions != null && canAccessDashboard(userPermissions, datasetId);

  const documentTitle =
    userProfile == null || study.status === 'loading' || userPermissions == null
      ? 'Loading...'
      : study.status === 'not-found'
      ? 'Not Found'
      : !dashboardAccessAllowed
      ? 'Permission Denied'
      : `Study Access Dashboard: ${getStudyName(study.record)}`;

  useSetDocumentTitle(documentTitle);

  const {
    endUserTableUiState,
    setEndUserTableUiState,
    providerTableUiState,
    setProviderTableUiState,
    staffTableUiState,
    setStaffTableUiState,
  } = useTableUiState(datasetId);

  const { openDialogConfig, changeOpenDialogConfig } = useOpenDialogConfig();

  const staffTableConfig = useStaffTableSectionConfig(
    userProfile?.id,
    userPermissions,
    studyAccessApi.fetchStaffList,
    studyAccessApi.updateStaffEntry,
    staffTableUiState,
    setStaffTableUiState
  );
  const providerTableConfig = useProviderTableSectionConfig(
    userProfile?.id,
    userPermissions,
    studyAccessApi.fetchProviderList,
    studyAccessApi.createProviderEntry,
    studyAccessApi.updateProviderEntry,
    studyAccessApi.deleteProviderEntry,
    datasetId,
    providerTableUiState,
    setProviderTableUiState,
    changeOpenDialogConfig
  );
  const endUserTableConfig = useEndUserTableSectionConfig(
    userProfile?.id,
    userPermissions,
    studyAccessApi.fetchEndUserList,
    studyAccessApi.createEndUserEntry,
    studyAccessApi.updateEndUserEntry,
    studyAccessApi.deleteEndUserEntry,
    datasetId,
    endUserTableUiState,
    setEndUserTableUiState,
    changeOpenDialogConfig
  );
  const historyTableConfig = useHistoryTableSectionConfig(
    userPermissions,
    studyAccessApi.fetchHistory,
    datasetId
  );

  return userProfile == null ||
    study.status == 'loading' ||
    userPermissions == null ? (
    <Loading />
  ) : study.status == 'not-found' ? (
    <NotFound />
  ) : !dashboardAccessAllowed ? (
    <PermissionDenied />
  ) : (
    <StudyAccess
      title={`Study: ${getStudyName(study.record)}`}
      staffTableConfig={staffTableConfig}
      providerTableConfig={providerTableConfig}
      endUserTableConfig={endUserTableConfig}
      historyTableConfig={historyTableConfig}
      openDialogConfig={openDialogConfig}
    />
  );
}
