import React from 'react';

import { ComparisonSampleCollection, ReferenceSampleCollection, SampleCollectionConfig } from './SampleCollection';

interface FoldChangeGraphProps {
  foldChange: number;
  referenceConfig: SampleCollectionConfig;
  comparisonConfig: SampleCollectionConfig;
}

const foldChangeGraph = (direction: 'up-regulated' | 'down-regulated'): React.FunctionComponent<FoldChangeGraphProps> => ({
  foldChange,
  referenceConfig,
  comparisonConfig
}) => {
  const shouldPlaceReferenceHigh = direction === 'down-regulated';

  return (
    <>
      {
        (referenceConfig.sampleCount > 0 && comparisonConfig.sampleCount > 0 && foldChange > 0) && (
          <div className="wdk-FoldChangeLabel">
            <div className="wdk-FoldChangeLabelUpArrow"></div>
            <div className="wdk-FoldChangeLabelText">{foldChange} fold</div>
            <div className="wdk-FoldChangeLabelDownArrow"></div>
          </div>
        )
      }
      <ReferenceSampleCollection
        {...referenceConfig}
        shouldPlaceHigh={shouldPlaceReferenceHigh}
      />
      <ComparisonSampleCollection
        {...comparisonConfig}
        shouldPlaceHigh={!shouldPlaceReferenceHigh}
      />
    </>
  );
};

export const UpRegulatedFoldChangeGraph = foldChangeGraph('up-regulated');
export const DownRegulatedFoldChangeGraph = foldChangeGraph('down-regulated');
