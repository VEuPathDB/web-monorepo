import React from 'react';
import { useState } from 'react';

import { DARK_BLUE, DARK_GRAY, LIGHT_BLUE } from '../../constants/colors';

export type ButtonProps = {
  /** Text of the button */
  text: string;
  /** Action to take when the button is clicked. */
  onPress: () => void;
  /** Indicates if the button should be have a colored outline and
   * transparent center or have a solid fill color. */
  type?: 'outlined' | 'solid';
  /** The size of the button. */
  size?: 'small' | 'medium' | 'large';
  /** Color to use for outline/fill. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  color?: string;
  /** Color to use for outline/fill when the button is pressed. */
  onPressColor?: string;
  /** Button text color. Defaults to LIGHT_BLUE if type is
   * `outlined` or white if type is `solid`. */
  textColor?: string;
  /** Additional styles to apply to the widget container. */
  styleOverrides?: React.CSSProperties;
};

/** Basic button with a variety of customization options. */
export default function Button({
  text,
  onPress,
  type = 'solid',
  size = 'medium',
  color = LIGHT_BLUE,
  onPressColor,
  textColor,
  styleOverrides = {},
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  // TODO: useTheme

  const calculatedOnPressColor = onPressColor ? onPressColor : color;

  /**
   * If textColor is specified, use it. Otherwise if `type` is solid, use
   * white. If `type` is outline, use `color` unless button is pressed, then
   * use `onPressColor` if specified.
   */
  const calculatedTextColor = textColor
    ? textColor
    : type === 'solid'
    ? 'white'
    : pressed
    ? calculatedOnPressColor
    : color;

  const calculatedFontSize = size === 'large' ? '1rem' : '.80rem';
  const horizontalPadding = size === 'large' ? 15 : 15;

  return (
    <>
      <button
        css={[
          {
            height: size === 'large' ? 50 : size === 'medium' ? 35 : 25,
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
            color: calculatedTextColor,
            borderRadius: 5,
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: calculatedFontSize,
            filter:
              pressed && !onPressColor ? 'brightness(75%)' : 'brightness(100%)',
          },
          type === 'solid'
            ? {
                backgroundColor:
                  pressed === true ? calculatedOnPressColor : color,
                border: 'none',
              }
            : {
                borderColor: pressed === true ? calculatedOnPressColor : color,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
              },
          { ...styleOverrides },
        ]}
        onMouseDown={() => {
          console.log('Hello');
          setPressed(true);
        }}
        onMouseUp={() => {
          console.log(calculatedOnPressColor, onPressColor, color);
          setPressed(false);
        }}
        onClick={onPress}
      >
        {text}
      </button>
    </>
  );
}
