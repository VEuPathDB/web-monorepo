import { useMemo } from 'react';

import { RouteComponentProps, useHistory } from 'react-router-dom';

import DatasetManagementController from '../Components/Management/DatasetManagementController';
import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';
import {
  DatasetTypeConfig,
  filterAvailableDataTypes,
  promoteTypeConfig,
} from '../Common/Configuration';
import { useUserDatasetRouterContext } from './UserDatasetRouterContext';

/*
 * Route components for `UserDatasetRouter`.
 *
 * These are deliberately defined at module scope. `WdkRoute` renders its
 * `component` as `<Component {...routeProps} />`, so a component defined inline
 * in the router's body gets a new identity on every router render (which
 * happens on every navigation) and the entire page below it remounts.
 */

/**
 * Renders the workspace for the list (`/`), new-dataset (`/new/:type?`) and help
 * (`/help`) routes. The workspace chooses its content from the URL.
 */
export function UserDatasetsWorkspaceRoute(props: RouteComponentProps) {
  const {
    baseUrl,
    helpRoute,
    workspaceConfig,
    workspaceTitle,
    helpTabContents,
    dataNoun,
    enablePublicUserDatasets,
    vdiMetadata,
  } = useUserDatasetRouterContext();

  const urlParams = useMemo(() => {
    const searchParamEntries = new URLSearchParams(
      props.location.search
    ).entries();

    return Object.fromEntries(searchParamEntries);
  }, [props.location.search]);

  return (
    <UserDatasetsWorkspace
      baseUrl={baseUrl}
      helpRoute={helpRoute}
      workspaceConfig={workspaceConfig}
      urlParams={urlParams}
      workspaceTitle={workspaceTitle}
      helpTabContents={helpTabContents}
      dataNoun={dataNoun}
      enablePublicUserDatasets={enablePublicUserDatasets}
      vdiMetadata={vdiMetadata}
    />
  );
}

/**
 * Renders the dataset details page (`/:id`), with the edit modal open when the
 * URL ends in `/edit` (`/:id/edit`). Both URLs must reach this same component
 * so that opening the modal does not remount the page.
 */
export function ManageOrEditDatasetRoute(
  props: RouteComponentProps<{ id: string }>
) {
  const history = useHistory();

  const {
    baseUrl,
    detailsPageTitle,
    workspaceTitle,
    dataNoun,
    enablePublicUserDatasets,
    workspaceConfig,
    vdiMetadata,
  } = useUserDatasetRouterContext();

  const datasetTypes = useMemo(
    () =>
      filterAvailableDataTypes(
        workspaceConfig.baseDatasetTypeConfigs,
        vdiMetadata.plugins
      )
        .map((cdt) => promoteTypeConfig(cdt, vdiMetadata.plugins))
        .filter((v) => v !== undefined) as readonly DatasetTypeConfig[],
    [workspaceConfig.baseDatasetTypeConfigs, vdiMetadata.plugins]
  );

  const editModalProps = props.location.pathname.endsWith('/edit')
    ? {
        showModal: true,
        updateToPublic: props.location.search.indexOf('updateToPublic') > -1,
      }
    : undefined;

  return (
    <DatasetManagementController
      baseUrl={baseUrl}
      detailsPageTitle={detailsPageTitle}
      workspaceTitle={workspaceTitle}
      dataNoun={dataNoun}
      enablePublicUserDatasets={enablePublicUserDatasets}
      datasetTypes={datasetTypes}
      formConfigs={workspaceConfig.uploadFormConfigurators}
      fetchEdaStudyLinks={workspaceConfig.fetchEdaStudyMetadata}
      includeAllLink
      includeNameHeader
      editModal={editModalProps}
      history={history}
      {...props.match.params}
    />
  );
}
