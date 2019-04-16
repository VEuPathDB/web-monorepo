import React from 'react';

import { changeGroupVisibility, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { PreAndPostParameterEntries, ParamLine } from 'wdk-client/Views/Question/Forms/FoldChange/ParamLine';
import { SampleParameterPane } from 'wdk-client/Views/Question/Forms/FoldChange/SampleParameterPane';
import { valueToArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';

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

const cx = makeClassNameHelper('wdk-QuestionForm');

const metaboliteFoldChangePreAndPostParams: PreAndPostParameterEntries[] = [
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
];

export const MetaboliteFoldChangeParamGroup: React.FunctionComponent<Props> = ({
  state: {
    paramValues,
    question: {
      parametersByName
    }
  },
  parameterElements
}) =>
  <div className={`${cx()}`}>
    {
      metaboliteFoldChangePreAndPostParams.map(
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
    <div className={`${cx('FoldChangeParamGroup')}`}>
      <ParamLine
        preParameterContent="Between each compound's "
        parameterElement={
          valueToArray(paramValues['samples_fc_ref_generic']).length >= 2
            ? parameterElements['min_max_avg_ref']
            : null
        }
        parameter={parametersByName['min_max_avg_ref']}
        postParameterContent={<b>metabolite level</b>}
      />
      <SampleParameterPane
        tabHeader="Reference Samples"
        parameterElement={parameterElements['samples_fc_ref_generic']}
      />
      <ParamLine
        preParameterContent="and its "
        parameterElement={
          valueToArray(paramValues['samples_fc_comp_generic']).length >= 2
            ? parameterElements['min_max_avg_comp']
            : null
        }
        parameter={parametersByName['min_max_avg_comp']}
        postParameterContent={<b>metabolite level</b>}
      />
      <SampleParameterPane
        tabHeader="Comparison Samples"
        parameterElement={parameterElements['samples_fc_comp_generic']}
      />
    </div>
  </div>;
