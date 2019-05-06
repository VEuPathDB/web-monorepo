import React from 'react';

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

const preAndPostParams = (props: Props): PreAndPostParameterEntries[] => 
  props.state.question.parametersByName['protein_coding_only']
    ? [
      {
        preParameterContent: <span>For the <b>Experiment</b></span>, 
        parameterName: 'profileset_generic',
        postParameterContent: null
      },
      {
        preParameterContent: <span>return <b>Genes</b></span>,
        parameterName: 'protein_coding_only',
        postParameterContent: null
      },
      {
        preParameterContent: <span>that are</span>,
        parameterName: 'regulated_dir',
        postParameterContent: null
      },
      {
        preParameterContent: <span>with a <b>Fold change</b> >=</span>,
        parameterName: 'fold_change',
        postParameterContent: null
      }
    ]
    : [
      {
        preParameterContent: <span>For the <b>Experiment</b></span>, 
        parameterName: 'profileset_generic',
        postParameterContent: null
      },
      {
        preParameterContent: <span>return genes that are</span>,
        parameterName: 'regulated_dir',
        postParameterContent: null
      },
      {
        preParameterContent: <span>with a <b>Fold change</b> >=</span>,
        parameterName: 'fold_change',
        postParameterContent: null
      }
    ];

export const GenericFoldChangeParamGroup: React.FunctionComponent<Props> = props => {
  const {
    state: {
      question: {
        parametersByName,
      }
    },
    parameterElements
  } = props;

  return (
    <div className="wdk-FoldChangeParams">
      {
        preAndPostParams(props).map(
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
