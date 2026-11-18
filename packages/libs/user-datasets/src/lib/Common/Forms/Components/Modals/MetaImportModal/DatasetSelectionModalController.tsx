import React from 'react';
import { ifDefined } from '../../../../../Utils';
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

export function DatasetSelectionModalController({
  hideModal,
  onDatasetSelect,
  ...props
}: MetadataImportModalProps): React.ReactElement {
  const [ datasets, setDatasets ] = React.useState<ReadonlyArray<DatasetSelectionListEntry>>();
  const [ selection, setSelection ] = React.useState<DatasetId>();

  const vdi = useVdiService();
  const userId = useWdkService((wdk) => wdk.getCurrentUser())?.id;

  React.useEffect(
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

          setDatasets(allDatasets);
        })();
      }
    },
    // eslint-disable-next-line -- don't care if it is the same 'vdi' object
    [vdi != null]
  );

  const copyAction = React.useCallback(
    () => {
      ifDefined(selection, onDatasetSelect);
      hideModal();
    },
    [selection, onDatasetSelect, hideModal]
  )

  if (datasets === undefined || userId === undefined) {
    return <Loading />;
  }

  return (
    <DatasetSelectionModal
      {...props}
      userId={userId}
      selection={selection}
      setSelection={setSelection}
      siteDisplayName={projectIdToDisplayName(projectId)!}
      datasets={datasets}
      closeAction={hideModal}
      copyAction={copyAction}
    />
  );
}
