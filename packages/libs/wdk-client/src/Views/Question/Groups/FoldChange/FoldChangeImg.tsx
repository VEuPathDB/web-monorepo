import React from 'react';

import { capitalize } from 'lodash';

import { UpRegulatedFoldChangeGraph, DownRegulatedFoldChangeGraph } from 'wdk-client/Views/Question/Groups/FoldChange/FoldChangeGraph';
import { UntypedSampleCollectionConfig } from 'wdk-client/Views/Question/Groups/FoldChange/SampleCollection';
import { FoldChangeDirection } from 'wdk-client/Views/Question/Groups/FoldChange/Types';

import 'wdk-client/Views/Question/Groups/FoldChange/FoldChangeImg.scss';

interface FoldChangeImgProps {
  direction: FoldChangeDirection;
  valueType: string;
  foldChange: number;
  untypedReferenceConfig: UntypedSampleCollectionConfig;
  untypedComparisonConfig: UntypedSampleCollectionConfig;
}

const classNameMap = {
  'up-regulated': 'wdk-FoldChangeImg__UpRegulated',
  'down-regulated': 'wdk-FoldChangeImg__DownRegulated',
  'up or down regulated': 'wdk-FoldChangeImg__UpOrDownRegulated'
};

export const FoldChangeImg: React.FunctionComponent<FoldChangeImgProps> = ({
  direction,
  valueType,
  foldChange,
  untypedReferenceConfig,
  untypedComparisonConfig
}) =>
  <div className="wdk-FoldChangeImg">
    <div className={classNameMap[direction]}>
      <div className="wdk-FoldChangeTitle">{capitalize(direction)}</div>
      {
        direction === 'up-regulated' && (
          <UpRegulatedFoldChangeGraph 
            foldChange={foldChange}
            referenceConfig={{
              ...untypedReferenceConfig,
              valueType
            }}
            comparisonConfig={{
              ...untypedComparisonConfig,
              valueType
            }}
          />
        )
      }
      {
        direction === 'down-regulated' && (
          <DownRegulatedFoldChangeGraph 
            foldChange={foldChange}
            referenceConfig={{
              ...untypedReferenceConfig,
              valueType
            }}
            comparisonConfig={{
              ...untypedComparisonConfig,
              valueType
            }}
          />
        )
      }
      {
        direction === 'up or down regulated' && (
          <>
            <div className="wdk-FoldChangeImgLeftSamples">
              <UpRegulatedFoldChangeGraph 
                foldChange={foldChange}
                referenceConfig={{
                  ...untypedReferenceConfig,
                  valueType
                }}
                comparisonConfig={{
                  ...untypedComparisonConfig,
                  valueType
                }}
              />
            </div>
            <div className="wdk-FoldChangeImgRightSamples">
              <DownRegulatedFoldChangeGraph 
                foldChange={foldChange}
                referenceConfig={{
                  ...untypedReferenceConfig,
                  valueType
                }}
                comparisonConfig={{
                  ...untypedComparisonConfig,
                  valueType
                }}
              />
            </div>
          </>
        )
      }
    </div>
  </div>;
