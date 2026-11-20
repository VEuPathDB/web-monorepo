import React, { useEffect } from 'react';
import * as Utils from '../Utils';
import * as VDI from '../Service';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { ManagementView } from './components/ManagementView';
import { useUserDatasetRouterContext } from '../Controllers/UserDatasetRouterContext';
import {
  DatasetFetchState,
  setDatasetFetchError,
  setDatasetFetchNotFound,
  setDatasetFetchPending,
  setDatasetFetchSuccess
} from './ManagementViewActions';
import { Action } from 'redux';
import { useDispatch } from 'react-redux';
import { useDatasetDetails, useDatasetFetchState } from './ManagementViewHooks';
import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';
import { AllDatasetsLink } from './components/header/AllDatasetsLink';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { projectId } from '../config';
import { selectDatasetSearches } from '../Components/Management/DatasetManagement';

export type ManagementViewControllerProps = {
  readonly datasetId: VDI.DatasetId;
  readonly includeAllDatasetsLink: boolean;
};

export const ManagementViewController = ({
  datasetId,
  includeAllDatasetsLink,
}: ManagementViewControllerProps): React.ReactElement => {
  const routerContext = useUserDatasetRouterContext();

  const dataset = useDatasetDetails();
  const fetchState = useDatasetFetchState();

  const dispatch = useDispatch();
  const vdi = VDI.useVdiService();

  useEffect(
    () => {
      if (vdi != null)
        fetchDataset(datasetId, vdi, dispatch);
    },

    // Suppress `vdi != null` complaint.  The VDI instance itself does not
    // matter, only that a VDI instance exists for use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vdi != null, datasetId, dispatch]
  );


  if (fetchState === DatasetFetchState.NotFound) {
    return (
      <NotFound>
        {includeAllDatasetsLink && (
          <AllDatasetsLink workspaceTitle={routerContext.workspaceTitle} />
        )}
      </NotFound>
    );
  }
  if (fetchState === DatasetFetchState.Error) {
    // FIXME: show user something indicating that we done goofed
    throw new Error("we done goofed")
  }
  if (fetchState === undefined || dataset === undefined || fetchState === DatasetFetchState.Pending) {
    return <Loading />;
  }

  return (
    <ManagementView
      includeAllLink={includeAllDatasetsLink}

      dataset={dataset}

      workspaceTitle={routerContext.workspaceTitle}
      dataNoun={routerContext.dataNoun}
      enableCommunityPromotion={routerContext.enablePublicUserDatasets}

      isOwner={}
      isEditable={}
      tryDeleteDataset={}
      openPromotionModal={}
      openSharingModal={}
      promotionDisabledReason={}
    />
  );
};

const grantedShares = ({ shares = [] }: VDI.DatasetGetResponseBody): ReadonlyArray<VDI.DatasetShareOffer> =>
  shares.filter(it => it.status === 'grant');

const isInstalled = ({
  status: {
    import: importStatus,
    install: installStatuses = [],
  }
}: VDI.DatasetGetResponseBody): boolean =>
  importStatus?.status === 'complete'
    && installStatuses.some(
      (it) => it.installTarget === projectId
        && it.data?.status === 'complete'
        && (it.meta == null || it.meta.status === 'complete')
    );

const buildDatasetAttributeArray = (
  dataset: VDI.DatasetGetResponseBody,
  isOwner: boolean,
  includeNameHeader: boolean,
  detailsPageTitle: string,
  questionMap: Record<string, Question>,
): ReadonlyArray<DatasetAttribute> => {
  const attributes: Array<DatasetAttribute> = [];

  if (includeNameHeader) {
    attributes.push({
      attribute: detailsPageTitle,
      className: 'name',
      value: dataset.name,
    });
  }

  attributes.push({
    attribute: 'Status',
    value: <StatusRow;
  });

  const questions = selectDatasetSearches(dataset.type.name, )
}

const fetchDataset = async (
  datasetId: VDI.DatasetId,
  vdi: VDI.VdiService,
  dispatch: Utils.Consumer<Action>
) => {
  dispatch(setDatasetFetchPending())

  const result = await vdi.getDatasetDetails(datasetId);

  // If the status field exists as a string, then it was an error response.
  //
  // The dataset details object also has a field named "status", but that field
  // is an object.
  if (typeof result.status === 'string') {
    if (result.status === 'not-found') {
      dispatch(setDatasetFetchNotFound());
    } else {
      dispatch(setDatasetFetchError());
      throw new Error(`failed to fetch dataset ${datasetId} from VDI; got result status ${result.status}`);
    }

    return;
  }

  dispatch(setDatasetFetchSuccess(result));
};