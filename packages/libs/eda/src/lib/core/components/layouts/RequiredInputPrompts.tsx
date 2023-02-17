import { CSSProperties } from 'react';
import { red } from '@veupathdb/coreui/dist/definitions/colors';

const requiredInputsContainerStyles: CSSProperties = {
  position: 'relative',
  height: '0',
  width: '0',
};

const requiredInputsHeaderStyles: CSSProperties = {
  position: 'absolute',
  width: 'max-content',
  left: '4.25em',
  zIndex: '1000',
  fontWeight: '500',
  fontStyle: 'normal',
  backgroundColor: '#fff',
  padding: '0.5em',
};

const requiredTextStyles: CSSProperties = {
  color: red[600],
};

interface RequiredPromptProps {
  isMosaicPlot: boolean | undefined;
}

export function RequiredInputsPrompt({ isMosaicPlot }: RequiredPromptProps) {
  return (
    <div style={requiredInputsContainerStyles}>
      <h3
        style={{
          ...requiredInputsHeaderStyles,
          top: isMosaicPlot ? '4em' : '0.5em',
        }}
      >
        Please select all{' '}
        <span style={requiredTextStyles}>
          required<sup>*</sup>
        </span>{' '}
        parameters.
      </h3>
    </div>
  );
}
