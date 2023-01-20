import React from 'react';
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
};

export function ComputationStepContainer(props: ComputationStepContainer) {
  const theme = useUITheme();
  const primaryColor = theme?.palette.primary.hue[theme.palette.primary.level];
  const { children, computationStepInfo } = props;
  return (
    <div>
      <NumberedHeader
        number={computationStepInfo.stepNumber}
        text={computationStepInfo.stepTitle}
        color={primaryColor ?? 'black'}
      />
      {children}
    </div>
  );
}
