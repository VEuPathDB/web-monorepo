import React from 'react';

import { Loading, PermissionDenied } from 'wdk-client/Components';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';
import NotFound from 'wdk-client/Views/NotFound/NotFound';

import { STUDY_ACCESS_SERVICE_URL } from 'ebrc-client/StudyAccess/api';
import { canAccessDashboard } from 'ebrc-client/StudyAccess/permission';
import { StudyAccess } from 'ebrc-client/components/StudyAccess/StudyAccess';
import {
  useEndUserTableSectionConfig,
  useOpenDialogConfig,
  useProviderTableSectionConfig,
  useStaffTableSectionConfig,
  useStudy,
  useStudyAccessApi,
  useTableUiState,
  useUserPermissions
} from 'ebrc-client/hooks/studyAccess';

interface Props {
  datasetId: string;
}

export default function StudyAccessController({ datasetId }: Props) {
  const userProfile = useWdkService(
    wdkService => wdkService.getCurrentUser(),
    []
  );

  const study = useStudy(datasetId);

  const studyAccessApi = useStudyAccessApi(STUDY_ACCESS_SERVICE_URL);

  const { value: userPermissions } = useUserPermissions(studyAccessApi.fetchPermissions);

  const dashboardAccessAllowed = (
    userPermissions != null && canAccessDashboard(userPermissions, datasetId)
  );

  const documentTitle = userProfile == null || study.status === 'loading' || userPermissions == null
    ? 'Loading...'
    : study.status === 'not-found'
    ? 'Not Found'
    : !dashboardAccessAllowed
    ? 'Permission Denied'
    : `Study Access Dashboard: ${study.record.name}`;

  useSetDocumentTitle(documentTitle);

  const {
    endUserTableUiState,
    setEndUserTableUiState,
    providerTableUiState,
    setProviderTableUiState,
    staffTableUiState,
    setStaffTableUiState
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
    datasetId,
    endUserTableUiState,
    setEndUserTableUiState,
    changeOpenDialogConfig
  );

  return (
    userProfile == null || study.status == 'loading' || userPermissions == null
      ? <Loading />
      : study.status == 'not-found'
      ? <NotFound />
      : !dashboardAccessAllowed
      ? <PermissionDenied />
      : <StudyAccess
          title={`Study: ${study.record.name}`}
          staffTableConfig={staffTableConfig}
          providerTableConfig={providerTableConfig}
          endUserTableConfig={endUserTableConfig}
          openDialogConfig={openDialogConfig}
        />
  );
}
