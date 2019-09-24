import React, { useEffect } from 'react';

import { Parameter } from 'wdk-client/Utils/WdkModel';
import ParameterComponent from 'wdk-client/Views/Question/ParameterComponent';
import { Props } from 'wdk-client/Views/Question/Params/Utils';

export const GenesByBindingSiteFeature = (props: Props<Parameter>) => {
  useEffect(() => {
    const bindingSiteImage = document.getElementById('tfbs_image') as HTMLImageElement;

    if (bindingSiteImage) {
      bindingSiteImage.src = `/a/images/pf_tfbs/${props.value}.png`;
    }
  }, [ props.value ]);

  return <ParameterComponent {...props} />;
};
