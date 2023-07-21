import React from 'react';

import { FoldChangeImg } from './FoldChangeImg';
import { HelpText } from './HelpText';

import { FoldChangeDirection, FoldChangeOperation } from './Types';

interface FoldChangeParamPreviewProps {
  foldChange: number;
  hasHardFloorParam: boolean;
  recordDisplayName: string;
  recordDisplayNamePlural: string;
  valueType: string;
  valueTypePlural: string;
  refSampleSize: number;
  compSampleSize: number;
  referenceOperation: FoldChangeOperation;
  comparisonOperation: FoldChangeOperation;
  direction: FoldChangeDirection;
}

export const FoldChangeParamPreview: React.FunctionComponent<FoldChangeParamPreviewProps> =
  ({
    foldChange,
    hasHardFloorParam,
    recordDisplayName,
    recordDisplayNamePlural,
    valueType,
    valueTypePlural,
    refSampleSize,
    compSampleSize,
    referenceOperation,
    comparisonOperation,
    direction,
  }) => (
    <div className="wdk-FoldChangeParamPreview">
      <div className="wdk-FoldChangeTitle">
        Example showing one {recordDisplayName} that would meet search criteria
      </div>
      <div className="wdk-FoldChangeSubtitle">
        (Dots represent this {recordDisplayName}'s {valueTypePlural} for
        selected samples)
      </div>
      <FoldChangeImg
        direction={direction}
        valueType={valueType}
        foldChange={foldChange}
        untypedReferenceConfig={{
          sampleCount: refSampleSize,
          operation: referenceOperation,
        }}
        untypedComparisonConfig={{
          sampleCount: compSampleSize,
          operation: comparisonOperation,
        }}
      />
      {(refSampleSize > 4 || compSampleSize > 4) && (
        <div className="wdk-FoldChangeCaption">
          A maximum of four samples are shown when more than four are selected.
        </div>
      )}
      <HelpText
        foldChange={foldChange}
        hasHardFloorParam={hasHardFloorParam}
        recordDisplayName={recordDisplayName}
        recordDisplayNamePlural={recordDisplayNamePlural}
        valueType={valueType}
        valueTypePlural={valueTypePlural}
        refSampleSize={refSampleSize}
        compSampleSize={compSampleSize}
        referenceOperation={referenceOperation}
        comparisonOperation={comparisonOperation}
        direction={direction}
      />
    </div>
  );
