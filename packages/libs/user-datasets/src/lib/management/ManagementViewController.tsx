import React, { ReactElement, useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';
import Loading from '@veupathdb/wdk-client/lib/Components/Loading';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { transitionToInternalPage } from '@veupathdb/wdk-client/lib/Actions/RouterActions';

import { projectId } from '../config';
import { DatasetTypeConfig, findDatasetTypeConfig, promotedTypeConfigs } from '../Common/Configuration';
import { UserDatasetCommunityModal } from '../Components/Sharing/UserDatasetCommunityModal';
import { UpdateFormController } from '../Components/Update/UpdateFormController';
import { useUserDatasetRouterContext } from '../Controllers/UserDatasetRouterContext';
import { DatasetGetResponseBody, DatasetId, VdiService } from '../Service';
import { ifDefined, isNonEmpty, Nullable, Optional, useToggle } from '../Utils';

import { DatasetFetchStatus, DatasetSearchesFetchStatus, fetchDataset } from './actions';
import { AllDatasetsLink } from './components/header/AllDatasetsLink';
import { ManagementView } from './components/ManagementView';
import { DatasetSharingModalWrapper } from './components/SharingModal';
import { CommunityPromotability } from './model';
import { useDatasetFetchState, useDatasetSearchFetchState } from './ManagementViewHooks';


export type ManagementViewControllerProps = {
  readonly currentUser: User

  /**
   * VDI-generated ID of the dataset being viewed.
   */
  readonly datasetId: DatasetId;

  /**
   * Whether the 'All Datasets' breadcrumb link should be shown at the top of
   * the management view.
   */
  readonly showAllDatasetsLink?: boolean;

  /**
   * Whether the dataset name should be included in the dataset attributes
   * section at the top of the dataset management page.
   */
  readonly showDatasetNameAttribute?: boolean;
};

export const ManagementViewController = ({
  datasetId,
  currentUser,
  showAllDatasetsLink = false,
  showDatasetNameAttribute = false,
}: ManagementViewControllerProps): ReactElement => {
  const dispatch = useDispatch();

  const {
    vdiMetadata: { plugins, serviceInfo },
    workspaceConfig: { baseDatasetTypeConfigs, uploadFormConfigurators },
    workspaceTitle,
    dataNoun,
    baseUrl,
    vdiService,
    ...routerContext
  } = useUserDatasetRouterContext();

  const location = useLocation();
  const history = useHistory();

  const datasetFetch = useDatasetFetchState();
  const dataset = datasetFetch.status === DatasetFetchStatus.Success
    ? datasetFetch.dataset
    : undefined;
  const isOwner = ifDefined(dataset, it => it.owner.userId === currentUser.id, false);

  const searchFetch = useDatasetSearchFetchState();
  const searches = searchFetch.status === DatasetSearchesFetchStatus.Success
    ? searchFetch.searches
    : undefined;

  const datasetTypes = useMemo(
    () => Array.from(promotedTypeConfigs(baseDatasetTypeConfigs, plugins)),
    [baseDatasetTypeConfigs, plugins]
  );

  const vdiTypeConfig = ifDefined(
    dataset?.type,
    it => findDatasetTypeConfig(it, datasetTypes)
  );

  const singularDataNoun = dataNoun.singular.toLowerCase();

  const isInstalled = dataset != null && testIsInstalled(dataset);

  const handleDelete = useCallback(
    () => {
      if (vdiService && dataset)
        deleteDataset(vdiService, isOwner, singularDataNoun, dataset)
          .then(() => dispatch(transitionToInternalPage(baseUrl)));
    },
    [vdiService, dataset, isOwner, singularDataNoun, baseUrl, dispatch],
  );

  const [sharingModalVisible, showSharingModal, hideSharingModal] = useToggle();
  const [publicModalVisible, showPublicModal, hidePublicModal] = useToggle();

  useEffect(
    () => { dispatch(fetchDataset(datasetId)); },
    [datasetId, dispatch],
  );

  switch (datasetFetch.status) {
    case DatasetFetchStatus.NotFound:
      return <NotFound>{showAllDatasetsLink && (<AllDatasetsLink />)}</NotFound>;

    case DatasetFetchStatus.Error:
      // FIXME: show user something indicating that we done goofed
      throw new Error("we done goofed");

    case undefined:
    case DatasetFetchStatus.Pending:
    default:
      if (!dataset) {
        return <Loading />;
      }
  }

  let modal: Nullable<ReactElement>;

  if (location.pathname.endsWith(EDIT_MODAL_SUFFIX)) {
    modal = (
      <UpdateFormController
        datasetId={datasetId}
        closeModal={() => history.goBack()}
        vdiConfig={serviceInfo}
        isPromotingToPublic={location.search.indexOf('updateToPublic') > -1}
        formConfigs={uploadFormConfigurators}
        datasetTypes={datasetTypes}
        dataNoun={dataNoun}
        enablePublicDatasets={routerContext.enablePublicUserDatasets}
      />
    );
  } else if (publicModalVisible) {
    modal = (
      <UserDatasetCommunityModal
        currentUser={currentUser}
        dataset={dataset}
        onClose={hidePublicModal}
        onFixErrors={() => {
          showPublicModal();
          history.push({
            pathname: makeEditPath(baseUrl, datasetId),
            search: '?updateToPublic',
          });
        }}
        dataNoun={dataNoun}
      />
    );
  } else if (sharingModalVisible) {
    modal = (
      <DatasetSharingModalWrapper
        dataset={dataset}
        onClose={() => hideSharingModal()}
        dataNoun={dataNoun}
      />
    );
  } else {
    modal = null;
  }

  return (
    <>
      <ManagementView
        includeAllLink={showAllDatasetsLink}
        includeDatasetName={showDatasetNameAttribute}

        dataset={dataset}
        userIsOwner={isOwner}
        isEditable={vdiTypeConfig != null}

        isInstalled={isInstalled}
        dataNoun={singularDataNoun}
        enableCommunityPromotion={routerContext.enablePublicUserDatasets}
        detailsPageTitle={routerContext.detailsPageTitle}
        questions={searches}
        tryDeleteDataset={handleDelete}
        openPromotionModal={showPublicModal}
        openSharingModal={showSharingModal}
        promotability={testCommunityPromotability(isInstalled, vdiTypeConfig, dataset)}
      />
      {modal}
    </>
  );
};

const EDIT_MODAL_SUFFIX = '/edit';

const makeEditPath = (baseUrl: string, datasetId: DatasetId) =>
  `${baseUrl}/${datasetId}${EDIT_MODAL_SUFFIX}`

const testCommunityPromotability = (
  isInstalled: boolean,
  typeConfig: Optional<DatasetTypeConfig>,
  dataset: DatasetGetResponseBody,
): CommunityPromotability => {
  if (isInstalled)
    return CommunityPromotability.NotInstalled;

  if (!typeConfig)
    return CommunityPromotability.UnknownError;

  if (typeConfig.vdiConfig.usesDataProperties) {
    return isNonEmpty(dataset.files.datasetProperties)
      ? CommunityPromotability.CanPromote
      : CommunityPromotability.MissingDatasetProperties;
  }

  return CommunityPromotability.CanPromote;
};

const testIsInstalled = ({
  status: {
    import: importStatus,
    install: installStatuses = [],
  }
}: DatasetGetResponseBody): boolean =>
  importStatus?.status === 'complete'
    && installStatuses.some(
      (it) => it.installTarget === projectId
        && it.data?.status === 'complete'
        && (it.meta == null || it.meta.status === 'complete')
    );

const deleteDataset = async (
  vdi: VdiService,
  isOwner: boolean,
  dataNoun: string,
  { datasetId, visibility, shares }: DatasetGetResponseBody,
): Promise<boolean> => {
  let question: string;

  if (isOwner) {
    question = `Are you sure you want to remove this ${dataNoun}?`;
  } else {
    question = `Are you sure you want to delete this ${dataNoun}?`;

    const isPublic = visibility === 'public';
    const isShared = isNonEmpty(shares);

    if (isPublic) {
      question += ' It will no longer be visible to the community'
        + (isShared ? ', and' : '.');
    }

    if (isShared) {
      const len = shares.length;
      question += `${len} collaborator${len === 1 ? '' : 's'} you've shared`
        + 'with will lose access.';
    }
  }

  return window.confirm(question)
    ? vdi.deleteDataset(datasetId)
      .then(() => true)
    : Promise.resolve(false);
}
