import React, { CSSProperties } from 'react';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import NumberedHeader, {
  NumberedHeaderProps,
} from '@veupathdb/coreui/lib/components/forms/NumberedHeader';

type ComputationStepContainer = {
  children: React.ReactChild;
  computationStepInfo: {
    stepNumber: NumberedHeaderProps['number'];
    stepTitle: string;
    color?: NumberedHeaderProps['color'];
  };
  isStepDisabled?: boolean;
  showStepNumber?: boolean;
};

const disabledStyles: CSSProperties = {
  opacity: '0.5',
  pointerEvents: 'none',
};

export function ComputationStepContainer(props: ComputationStepContainer) {
  const theme = useUITheme();
  const primaryColor =
    theme?.palette.primary.hue[theme.palette.primary.level] ?? 'black';
  const {
    children,
    computationStepInfo,
    isStepDisabled,
    showStepNumber = true,
  } = props;
  return (
    <div style={isStepDisabled ? disabledStyles : undefined}>
      {showStepNumber && (
        <NumberedHeader
          number={computationStepInfo.stepNumber}
          color={isStepDisabled ? 'darkgrey' : primaryColor}
        >
          {computationStepInfo.stepTitle}
        </NumberedHeader>
      )}
      {children}
    </div>
  );
}
