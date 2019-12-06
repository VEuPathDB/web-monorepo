import React from 'react';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { FoldChangeParamPreview } from 'wdk-client/Views/Question/Groups/FoldChange/FoldChangeParamPreview';
import { GenericFoldChangeParamGroup } from 'wdk-client/Views/Question/Groups/FoldChange/GenericFoldChangeParamGroup';
import { MetaboliteFoldChangeParamGroup } from 'wdk-client/Views/Question/Groups/FoldChange/MetaboliteFoldChangeParamGroup';
import { FoldChangeDirection, FoldChangeOperation } from 'wdk-client/Views/Question/Groups/FoldChange/Types';
import { toMultiValueArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { Props } from '../../DefaultQuestionForm';

import 'wdk-client/Views/Question/Groups/FoldChange/FoldChange.scss';


const cx = makeClassNameHelper('wdk-QuestionForm');

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

  const refSampleSize = toMultiValueArray(refSamples).length;
  const compSampleSize = toMultiValueArray(compSamples).length;

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
