import React, { ReactElement, useEffect } from 'react';
import { ifDefined, useSimpleState } from '../../../../../Utils';
import {
  DatasetListEntry,
  useVdiService,
  DatasetId,
} from '../../../../../Service';
import { DatasetSelectionModal } from './DatasetSelectionModal';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { projectIdToDisplayName } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import { projectId } from '../../../../../config';
import { MetadataImportModalProps } from './MetadataImportModalProps';
import { Loading } from '@veupathdb/coreui';

export interface DatasetSelectionListEntry extends DatasetListEntry {
  readonly isCommunity: boolean;
}

export function DatasetSelectionModalController(
  props: MetadataImportModalProps
): ReactElement {
  const datasets = useSimpleState<DatasetSelectionListEntry[]>();
  const selection = useSimpleState<DatasetId>();

  const vdi = useVdiService();
  const userId = useWdkService((wdk) => wdk.getCurrentUser())?.id;

  useEffect(
    () => {
      if (vdi) {
        // index of dataset ids for datasets that are explicitly visible to the
        // current user either by ownership or direct share.  Used to both avoid
        // dupes from the community list, and to enable filtering out community
        // datasets without removing shared datasets.
        const usersOwnDatasets: Record<string, boolean> = {};

        // list of all datasets that will be used by the selection table
        const allDatasets: Array<DatasetSelectionListEntry> = [];

        (async function () {
          for (const dataset of await vdi.getDatasetList()) {
            usersOwnDatasets[dataset.datasetId] = true;
            allDatasets.push({ ...dataset, isCommunity: false });
          }

          for (const dataset of await vdi.getCommunityDatasetList()) {
            // Ignore datasets that were in the user's own dataset list, as they
            // were directly shared and that visibility takes priority over
            // general public visibility.
            if (!usersOwnDatasets[dataset.datasetId])
              allDatasets.push({ ...dataset, isCommunity: true });
          }

          datasets.set(allDatasets);
        })();
      }
    },
    // eslint-disable-next-line -- don't care if it is the same 'vdi' object
    [vdi != null]
  );

  if (datasets.isUndefined || userId === undefined) return <Loading />;

  return (
    <DatasetSelectionModal
      {...props}
      userId={userId}
      selection={selection}
      siteDisplayName={projectIdToDisplayName(projectId)!}
      datasets={datasets.get()!}
      closeAction={() => props.visibleState.set(false)}
      copyAction={() => {
        ifDefined(selection.get(), props.onDatasetSelect);
        props.visibleState.set(false);
      }}
    />
  );
}
