import React, { useEffect } from 'react';

import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import ParameterComponent from '@veupathdb/wdk-client/lib/Views/Question/ParameterComponent';
import { Props } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';

export const GenesByWGCNAModules = (props: Props<Parameter>) => {
  useEffect(() => {
    // const bindingSiteImage = document.getElementById('tfbs_image') as HTMLImageElement;

    // if (bindingSiteImage) {
    //   bindingSiteImage.src = `/a/images/pf_tfbs/${props.value}.png`;
    // }
    console.log("hi ann!!");
  }, [ props.value ]);

  return <ParameterComponent {...props} />;
};
