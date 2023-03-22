import React from 'react';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { FoldChangeParamPreview } from './FoldChangeParamPreview';
import { GenericFoldChangeParamGroup } from './GenericFoldChangeParamGroup';
import { MetaboliteFoldChangeParamGroup } from './MetaboliteFoldChangeParamGroup';
import { FoldChangeDirection, FoldChangeOperation } from './Types';
import { toMultiValueArray } from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';
import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import './FoldChange.scss';


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
