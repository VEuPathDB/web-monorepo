import React from 'react';

import { memoize } from 'lodash';

import { changeGroupVisibility, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { PreAndPostParameterEntries, ParamLine } from 'wdk-client/Views/Question/Groups/FoldChange/ParamLine';
import { SamplesParamSubgroup } from 'wdk-client/Views/Question/Groups/FoldChange/SamplesParamSubgroup';

type EventHandlers = {
  setGroupVisibility: typeof changeGroupVisibility,
  updateParamValue: typeof updateParamValue
};

type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
  parameterElements: Record<string, React.ReactNode>;
};

const metaboliteFoldChangePreAndPostParams = memoize((props: Props): PreAndPostParameterEntries[] => [
  {
    preParameterContent: <span>For the <b>Experiment</b></span>, 
    parameterName: 'profileset',
    postParameterContent: null
  },
  {
    preParameterContent: <span>return compounds that are</span>,
    parameterName: 'regulated_dir',
    postParameterContent: null
  },
  {
    preParameterContent: <span>with a <b>Fold change</b> >=</span>,
    parameterName: 'fold_change_compound',
    postParameterContent: null
  }
]);

export const MetaboliteFoldChangeParamGroup: React.FunctionComponent<Props> = props => {
  const {
    state: {
      question: {
        parametersByName
      }
    },
    parameterElements
  } = props;

  return (
    <div className="wdk-FoldChangeParams">
      {
        metaboliteFoldChangePreAndPostParams(props).map(
          ({
            preParameterContent,
            parameterName,
            postParameterContent
          }) => (
            <ParamLine
              key={parameterName}
              preParameterContent={preParameterContent} 
              parameterElement={parameterElements[parameterName]}
              parameter={parametersByName[parameterName]}
              postParameterContent={postParameterContent}
            />
          )
        )
      }
      <SamplesParamSubgroup {...props} />
    </div>
  );
};
