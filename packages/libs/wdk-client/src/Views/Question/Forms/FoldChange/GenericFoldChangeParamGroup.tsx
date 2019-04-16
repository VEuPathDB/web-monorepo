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

const genericFoldChangePreAndPostParamsNotProteinCodingOnly: PreAndPostParameterEntries[] = [
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

const genericFoldChangePreAndPostParamsProteinCodingOnly: PreAndPostParameterEntries[] = [
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
];

export const GenericFoldChangeParamGroup: React.FunctionComponent<Props> = ({
  state: {
    paramValues,
    question: {
      parametersByName,
    }
  },
  parameterElements
}) => {
  const proteinCodingOnly = !!parametersByName['protein_coding_only'];
  const preAndPostParams = proteinCodingOnly
    ? genericFoldChangePreAndPostParamsProteinCodingOnly
    : genericFoldChangePreAndPostParamsNotProteinCodingOnly;
  const hardFloorVisible = parametersByName['hard_floor'].isVisible;

  return (
    <div className={`${cx()}`}>
      {
        preAndPostParams.map(
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
              postParameterContent={null}
            />
          )
        }
        <SampleParameterPane
          tabHeader="Reference Samples"
          parameterElement={parameterElements['samples_fc_ref_generic']}
        />
        <ParamLine
          preParameterContent="and its "
          parameterElement={
            valueToArray(paramValues['samples_fc_comp_generic']).length >= 2
              ? parameterElements['min_max_avg_ref']
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
        <SampleParameterPane
          tabHeader="Comparison Samples"
          parameterElement={parameterElements['samples_fc_comp_generic']}
        />
      </div>
    </div>
  );
};
