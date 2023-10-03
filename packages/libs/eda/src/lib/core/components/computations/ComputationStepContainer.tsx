import React, { CSSProperties } from 'react';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import {
  NumberedHeader,
  NumberedHeaderProps,
} from '../../../workspace/Subsetting/SubsetDownloadModal';
import { ExpandablePanel } from '@veupathdb/coreui';

type ComputationStepContainer = {
  children: React.ReactChild;
  computationStepInfo: {
    stepNumber: NumberedHeaderProps['number'];
    stepTitle: NumberedHeaderProps['text'];
    color?: NumberedHeaderProps['color'];
  };
  isStepDisabled?: boolean;
};

const disabledStyles: CSSProperties = {
  opacity: '0.5',
  pointerEvents: 'none',
};

export function ComputationStepContainer(props: ComputationStepContainer) {
  const { children, computationStepInfo, isStepDisabled } = props;
  return (
    <div style={isStepDisabled ? disabledStyles : undefined}>
      <ExpandablePanel
        title={computationStepInfo.stepTitle}
        subTitle={''}
        state={'open'}
        stylePreset="floating"
        themeRole="primary"
      >
        {children}
      </ExpandablePanel>
    </div>
  );
}
