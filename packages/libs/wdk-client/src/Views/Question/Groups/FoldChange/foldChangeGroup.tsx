import React from 'react';

import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import {
  changeGroupVisibility,
  updateParamValue,
  submitQuestion
} from 'wdk-client/Actions/QuestionActions';

import { memoize } from 'lodash';
import { FoldChangeParamPreview } from 'wdk-client/Views/Question/Groups/FoldChange/FoldChangeParamPreview';
import { MetaboliteFoldChangeParamGroup } from 'wdk-client/Views/Question/Groups/FoldChange/MetaboliteFoldChangeParamGroup';
import { GenericFoldChangeParamGroup } from 'wdk-client/Views/Question/Groups/FoldChange/GenericFoldChangeParamGroup';
import { valueToArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { FoldChangeDirection, FoldChangeOperation } from 'wdk-client/Views/Question/Groups/FoldChange/Types';

import 'wdk-client/Views/Question/Groups/FoldChange/FoldChange.scss'

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

const onSubmit = memoize((dispatchAction: DispatchAction, urlSegment: string) => (e: React.FormEvent) => {
  e.preventDefault();
  dispatchAction(submitQuestion({ searchName: urlSegment }));
});

const foldChangeGroup = (
  valueType: string, 
  valueTypePlural: string, 
  foldChangeParamKey: string,
  FoldChangeParamGroup: React.FunctionComponent<Props & { valueType: string }>
): React.FunctionComponent<Props> => props => {
  const {
    state: {
      paramValues,
      recordClass: {
        displayName,
        displayNamePlural
      }
    },
  } = props;

  const refSamples = paramValues['samples_fc_ref_generic'];
  const compSamples = paramValues['samples_fc_comp_generic'];

  const refSampleSize = valueToArray(refSamples).length;
  const compSampleSize = valueToArray(compSamples).length;

  const referenceOperation = refSampleSize === 1
    ? 'none'
    : paramValues['min_max_avg_ref'].slice(0, -1);

  const comparisonOperation = compSampleSize === 1
    ? 'none'
    : paramValues['min_max_avg_comp'].slice(0, -1);

  return (
    <div className={`${cx()} ${cx('FoldChange')}`}>
      <FoldChangeParamGroup {...props} valueType={valueType} />
      <FoldChangeParamPreview
        foldChange={+paramValues[foldChangeParamKey]}
        hasHardFloorParam={!!paramValues['hard_floor']}
        recordDisplayName={displayName.toLowerCase()}
        recordDisplayNamePlural={displayNamePlural.toLowerCase()}
        valueType={valueType}
        valueTypePlural={valueTypePlural}
        refSampleSize={refSampleSize}
        compSampleSize={compSampleSize}
        direction={paramValues['regulated_dir'] as FoldChangeDirection}
        referenceOperation={referenceOperation as FoldChangeOperation}
        comparisonOperation={comparisonOperation as FoldChangeOperation}
      />
    </div>
  );
};

export const CompoundsByFoldChange = foldChangeGroup(
  'metabolite level',
  'metabolite levels',
  'fold_change_compound',
  MetaboliteFoldChangeParamGroup
);
export const GenericFoldChange = foldChangeGroup(
  'expression value',
  'expression values',
  'fold_change',
  GenericFoldChangeParamGroup
);
