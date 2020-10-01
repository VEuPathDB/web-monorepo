import React from 'react';

import { memoize } from 'lodash';

import { PreAndPostParameterEntries, ParamLine } from './ParamLine';
import { SamplesParamSubgroup } from './SamplesParamSubgroup';
import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

type GroupProps = Props & {
  valueType: string;
};

const metaboliteFoldChangePreAndPostParams = memoize((props: GroupProps): PreAndPostParameterEntries[] => 
  props.state.question.parametersByName['is_preferred_compound']
    ? [
  {
    preParameterContent: <span>For the <b>Experiment</b></span>, 
    parameterName: 'profileset',
    postParameterContent: null
  },
  {
    preParameterContent: <span>with return</span>,
    parameterName: 'is_preferred_compound',
    postParameterContent: <span><b>Compounds</b></span>
  },
  {
    preParameterContent: <span>and return <b>Any or All</b> peaks per compound</span>,
    parameterName: 'any_or_all_compound_peaks',
    postParameterContent: null
  },
  {
    preParameterContent: <span>that are</span>,
    parameterName: 'regulated_dir',
    postParameterContent: null
  },
  {
    preParameterContent: <span>with a <b>Fold change</b> >=</span>,
    parameterName: 'fold_change_compound',
    postParameterContent: null
  }
   ]
   : [
  {
    preParameterContent: <span>For the <b>Experiment</b></span>,
    parameterName: 'profileset',
    postParameterContent: null
  },
  {
    preParameterContent: <span>return <b>Any or All</b> peaks</span>,
    parameterName: 'any_or_all_compound_peaks',
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

export const MetaboliteFoldChangeParamGroup: React.FunctionComponent<GroupProps> = props => {
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
