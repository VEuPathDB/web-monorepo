import React from 'react';
import { useState } from 'react';

// Various Icon Imports
import CloudDownload from '@material-ui/icons/CloudDownload';
import AddCircle from '@material-ui/icons/AddCircle';

import { DARK_BLUE, LIGHT_BLUE } from '../../constants/colors';

export type SwissArmyButtonProps = {
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
  pressedColor?: string;
  /** Button text color. Defaults to LIGHT_BLUE if type is
   * `outlined` or white if type is `solid`. */
  textColor?: string;
  /** Optional. Icon selector. */
  icon?: 'new' | 'download';
  /** Additional styles to apply to the widget container. */
  styleOverrides?: React.CSSProperties;
};

/** Basic button with a variety of customization options. */
export default function SwissArmyButton({
  text,
  onPress,
  type = 'solid',
  size = 'medium',
  color = LIGHT_BLUE,
  pressedColor = DARK_BLUE,
  textColor,
  icon,
  styleOverrides = {},
}: SwissArmyButtonProps) {
  const [pressed, setPressed] = useState(false);
  // TODO: useTheme

  const calculatedOnPressColor = pressedColor ? pressedColor : color;
  console.log('INITIAL', pressedColor, color);

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

  const renderIcon = (icon: SwissArmyButtonProps['icon']) => {
    // TODO: Make this more efficient.
    switch (icon) {
      case 'download':
        return (
          <CloudDownload
            css={{ paddingRight: 10, boxSizing: 'initial' }}
            fontSize={size}
          />
        );
      case 'new':
        return (
          <AddCircle
            css={{ paddingRight: 10, boxSizing: 'initial' }}
            fontSize={size}
          />
        );

      default:
        break;
    }
  };

  return (
    <>
      <button
        css={[
          {
            height: size === 'large' ? 50 : size === 'medium' ? 35 : 25,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
            color: calculatedTextColor,
            borderRadius: 5,
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: calculatedFontSize,
            filter:
              pressed && !pressedColor ? 'brightness(75%)' : 'brightness(100%)',
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
          setPressed(true);
        }}
        onMouseUp={() => {
          setPressed(false);
        }}
        onClick={onPress}
      >
        {icon && renderIcon(icon)}
        {text}
      </button>
    </>
  );
}
