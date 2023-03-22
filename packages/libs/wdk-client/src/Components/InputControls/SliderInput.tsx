/**
 * Provides a simple wrapper around <input type="range"/>.  The only differences
 * are that
 * (1) the value the component receives must be numeric
 * (2) the (optional) min, max, and step props must be numeric
 * (3) the value passed to the onChange property is the new value from the range,
 *     not the event causing the change
 */

import React, { useCallback } from 'react';

import { wrappable } from 'wdk-client/Utils/ComponentUtils';

type BaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'>;

interface Props extends BaseProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

function SliderInput(originalProps: Props) {
  const { onChange, ...props } = originalProps;

  const changeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  }, [ onChange ]);

  return (
    <input
      {...props}
      type="range"
      onChange={changeHandler}
    />
  );
}

export default wrappable(SliderInput);
