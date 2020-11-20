import React from 'react';

import { changeGroupVisibility, updateParamValue } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { DispatchAction } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { ParamLine } from './ParamLine';
import { ReferenceSampleParameterPane, ComparisonSampleParameterPane } from './sampleParameterPane';
import { toMultiValueArray } from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';

type EventHandlers = {
  setGroupVisibility: typeof changeGroupVisibility,
  updateParamValue: typeof updateParamValue
};

type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
  parameterElements: Record<string, React.ReactNode>
  valueType: string;
};

const cx = makeClassNameHelper('wdk-QuestionForm');

export const SamplesParamSubgroup: React.FunctionComponent<Props> = ({
  state: {
    paramValues,
    question: {
      parametersByName
    },
    recordClass: {
      displayName
    }
  },
  parameterElements,
  valueType
}) => {
  const hardFloorVisible = parametersByName['hard_floor'] && parametersByName['hard_floor'].isVisible;

  return (
    <div className={`${cx('FoldChangeSampleParamSubgroup')}`}>
      <ParamLine
        preParameterContent={`between each ${displayName.toLowerCase()}'s `}
        parameterElement={parameterElements['min_max_avg_ref']}
        parameter={parametersByName['min_max_avg_ref']}
        postParameterContent={<b>{' '}{valueType}</b>}
        hideParameter={toMultiValueArray(paramValues['samples_fc_ref_generic']).length < 2}
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
        parameter={parametersByName['samples_fc_ref_generic']}
      />
      <ParamLine
        preParameterContent="and its "
        parameterElement={parameterElements['min_max_avg_comp']}
        parameter={parametersByName['min_max_avg_comp']}
        postParameterContent={<b>{' '}{valueType}</b>}
        hideParameter={toMultiValueArray(paramValues['samples_fc_comp_generic']).length < 2}
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
        parameter={parametersByName['samples_fc_comp_generic']}
      />
    </div>
  );
};
