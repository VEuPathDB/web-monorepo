import React from 'react';
import { MEDIUM_GRAY } from '../../constants/colors';

type ControlsHeaderType = {
  text: string;
  color?: string;
  styleOverrides?: React.CSSProperties;
};

/**
 * Header for use in plot controls components.
 */
export default function ControlsHeader({
  text,
  color = MEDIUM_GRAY,
  styleOverrides = {},
}: ControlsHeaderType) {
  return (
    <div
      style={{
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        fontSize: '18px',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color,
        fontWeight: 500,
        ...styleOverrides,
      }}
    >
      {text}
    </div>
  );
}
