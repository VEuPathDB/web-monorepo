import React, { CSSProperties } from 'react';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import {
  NumberedHeader,
  NumberedHeaderProps,
} from '../../../workspace/Subsetting/SubsetDownloadModal';

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
  const theme = useUITheme();
  const primaryColor =
    theme?.palette.primary.hue[theme.palette.primary.level] ?? 'black';
  const { children, computationStepInfo, isStepDisabled } = props;
  return (
    <div style={isStepDisabled ? disabledStyles : undefined}>
      <NumberedHeader
        number={computationStepInfo.stepNumber}
        text={computationStepInfo.stepTitle}
        color={isStepDisabled ? 'darkgrey' : primaryColor}
      />
      {children}
    </div>
  );
}
