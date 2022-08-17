import React, { useEffect } from 'react';

import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import ParameterComponent from '@veupathdb/wdk-client/lib/Views/Question/ParameterComponent';
import { Props } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';

export const GenesByWGCNAModules = (props: Props<Parameter>) => {
  useEffect(() => {
    const eigengeneImage = document.getElementById('wgcna_image') as HTMLImageElement;
    if (eigengeneImage && props.value[0]  === 'P') {
      const cleanPropValue = props.value.split(" [")[0];
      eigengeneImage.src = `/cgi-bin/dataPlotter.pl?project_id=PlasmoDB&id=${cleanPropValue}&type=WGCNA::Eigengene&model=plasmo&fmt=png&datasetId=DS_b1ac1e329c`;
    }
  }, [ props.value ]);

  return <ParameterComponent {...props} />;
};
