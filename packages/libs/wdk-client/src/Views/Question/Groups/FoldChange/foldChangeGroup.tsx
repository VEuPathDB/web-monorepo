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
import { valueToArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { FoldChangeDirection, FoldChangeOperation } from 'wdk-client/Views/Question/Groups/FoldChange/Types';

import 'wdk-client/Views/Question/Groups/FoldChange/FoldChange.scss';

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

export const CompoundsByFoldChange: React.FunctionComponent<Props> = props => {
  const {
    state: {
      paramValues,
      recordClass: {
        displayName,
        displayNamePlural
      }
    },
  } = props;

  const refSampleSize = valueToArray(paramValues['samples_fc_ref_generic']).length;
  const compSampleSize = valueToArray(paramValues['samples_fc_comp_generic']).length;

  const referenceOperation = refSampleSize === 1
    ? 'none'
    : paramValues['min_max_avg_ref'].slice(0, -1);

  const comparisonOperation = compSampleSize === 1
    ? 'none'
    : paramValues['min_max_avg_comp'].slice(0, -1);

  return (
    <div className={`${cx()} ${cx('FoldChange')}`}>
      <MetaboliteFoldChangeParamGroup {...props} />
      <FoldChangeParamPreview
        foldChange={+paramValues['fold_change_compound']}
        hasHardFloorParam={!!paramValues['hard_floor']}
        recordDisplayName={displayName.toLowerCase()}
        recordDisplayNamePlural={displayNamePlural.toLowerCase()}
        valueType="metabolite level"
        valueTypePlural="metabolite levels"
        refSampleSize={valueToArray(paramValues['samples_fc_ref_generic']).length}
        compSampleSize={valueToArray(paramValues['samples_fc_comp_generic']).length}
        direction={paramValues['regulated_dir'] as FoldChangeDirection}
        referenceOperation={referenceOperation as FoldChangeOperation}
        comparisonOperation={comparisonOperation as FoldChangeOperation}
      />
    </div>
  );
};
