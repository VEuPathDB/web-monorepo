import React, { ReactElement, useEffect, useState } from 'react';
import { DataNoun } from '../../../../../Utils';
import { DatasetListEntry, useVdiService, VdiServiceConfig } from '../../../../../Service';
import { ServiceConfig } from '@veupathdb/wdk-client/lib/Service/ServiceBase';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { MetadataImportModal } from './MetadataImportModal';


export interface MetadataImportModalControllerProps {
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceConfig;
  readonly config: ServiceConfig;
  readonly userId: number;
  readonly dataNoun: DataNoun;
  readonly arePublicDatasetsEnabled: boolean;
}

export function MetadataImportModalController(
  props: MetadataImportModalControllerProps,
): ReactElement {
  const vdi = useVdiService();

  const [ datasets, setDatasets ] = useState<DatasetListEntry[]>();
  const [ visible, setVisible ] = useState(false);

  useEffect(
    () => {
      if (vdi)
        vdi.getDatasetList()
          .then(setDatasets)
          .catch(e => { throw e; });
    },
    // eslint-disable-next-line -- don't care if it is the same 'vdi' object
    [ vdi != null ],
  );

  if (datasets === undefined)
    return <Loading />;

  return <MetadataImportModal
    modalProps={{ visible, setVisible }}
    tableProps={{ ...props, datasets }}
  />;
}
