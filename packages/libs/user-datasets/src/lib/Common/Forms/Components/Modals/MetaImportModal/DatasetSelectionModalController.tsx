import React, { ReactElement, useEffect } from 'react';
import { ifDefined, useSimpleState } from '../../../../../Utils';
import {
  DatasetListEntry,
  useVdiService, DatasetId
} from '../../../../../Service';
import { DatasetSelectionModal } from './DatasetSelectionModal';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { projectIdToDisplayName } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import { projectId } from '../../../../../config';
import { MetadataImportModalProps } from './MetadataImportModalProps';
import { Loading } from '@veupathdb/coreui';

export function DatasetSelectionModalController(
  props: MetadataImportModalProps
): ReactElement {
  const datasets = useSimpleState<DatasetListEntry[]>();
  const selection = useSimpleState<DatasetId>();

  const vdi = useVdiService();
  const userId = useWdkService((wdk) => wdk.getCurrentUser())?.id;

  useEffect(
    () => {
      if (vdi) {
        (async function() {
          const responseList = await vdi.getDatasetList();
          responseList.push(...(await vdi.getCommunityDatasetList()));
          datasets.set(responseList);
        })();
      }
    },
    // eslint-disable-next-line -- don't care if it is the same 'vdi' object
    [vdi != null]
  );

  if (datasets.isUndefined || userId === undefined)
    return <Loading />;

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
