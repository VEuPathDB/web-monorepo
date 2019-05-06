import React from 'react';

import { changeGroupVisibility, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { ParamLine } from 'wdk-client/Views/Question/Groups/FoldChange/ParamLine';
import { ReferenceSampleParameterPane, ComparisonSampleParameterPane } from 'wdk-client/Views/Question/Groups/FoldChange/sampleParameterPane';
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

export const SamplesParamSubgroup: React.FunctionComponent<Props> = ({
  state: {
    paramValues,
    question: {
      parametersByName,
    }
  },
  parameterElements
}) => {
  const hardFloorVisible = parametersByName['hard_floor'] && parametersByName['hard_floor'].isVisible;

  return (
    <div className={`${cx('FoldChangeSampleParamSubgroup')}`}>
      <ParamLine
        preParameterContent="Between each gene's "
        parameterElement={
          valueToArray(paramValues['samples_fc_ref_generic']).length >= 2
            ? parameterElements['min_max_avg_ref']
            : null
        }
        parameter={parametersByName['min_max_avg_ref']}
        postParameterContent={<b>expression value</b>}
      />
      {
        hardFloorVisible && (
          <ParamLine
            preParameterContent={<span> (or a <b>Floor</b> of </span>}
            parameterElement={parameterElements['hard_floor']}
            parameter={parametersByName['hard_floor']}
            postParameterContent={<span>)</span>}
          />
        )
      }
      <ReferenceSampleParameterPane
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
        postParameterContent={<b>expression value</b>}
      />
      {
        hardFloorVisible && (
          <span>
            (or the <b>Floor</b> selected above)
          </span>
        )
      }
      <ComparisonSampleParameterPane
        parameterElement={parameterElements['samples_fc_comp_generic']}
      />
    </div>
  );
};
