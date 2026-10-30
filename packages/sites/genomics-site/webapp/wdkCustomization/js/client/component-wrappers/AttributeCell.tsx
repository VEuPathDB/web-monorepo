import React, { ComponentType } from 'react';

import { formatSignificantFigures } from '@veupathdb/components/lib/utils/significant-figures';
import {
  AttributeField,
  RecordInstance,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

interface Props {
  attribute: AttributeField;
  recordInstance: RecordInstance;
}

// Result columns shown to 3 significant figures. These names are used only by the
// DESeq / effect-size searches whose values come straight from the EDA computation
// (GenesByRNASeq<dataset>DESeq, GenesByEdaVizWithCompute, GenesByDESeqUserDataset,
// GenesByAntibodyArrayEdaSubset_<dataset>), which otherwise display full doubles.
const SIGNIFICANT_FIGURE_ATTRIBUTES = new Set(['pValue', 'effectSize']);

// Display only: the full-precision value from the service is kept for sorting and
// downloads, and is shown on hover.
export function AttributeCell(
  DefaultComponent: ComponentType<Props>
): ComponentType<Props> {
  return function SignificantFiguresAttributeCell(props) {
    const { attribute, recordInstance } = props;
    const value = recordInstance.attributes[attribute.name];
    const formatted = SIGNIFICANT_FIGURE_ATTRIBUTES.has(attribute.name)
      ? formatSignificantFigures(value)
      : undefined;
    if (formatted == null) return <DefaultComponent {...props} />;
    return (
      <div title={value as string}>
        <DefaultComponent
          {...props}
          recordInstance={{
            ...recordInstance,
            attributes: {
              ...recordInstance.attributes,
              [attribute.name]: formatted,
            },
          }}
        />
      </div>
    );
  };
}
