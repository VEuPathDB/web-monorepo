import React, { useState } from 'react';

// Various Icon Imports
import CloudDownload from '@material-ui/icons/CloudDownload';
import AddCircle from '@material-ui/icons/AddCircle';
import SettingsIcon from '@material-ui/icons/Settings';

import { stylePresets, SwissArmyButtonStyleSpec } from './stylePresets';

type SwissArmyButtonProps = {
  /** Text of the button */
  text: string;
  /** Action to take when the button is clicked. */
  onPress: () => void;
  /** Indicates if the button should be have a colored outline and
   * transparent center or have a solid fill color. */
  type?: 'outlined' | 'solid';
  /** The size of the button. */
  size?: 'small' | 'medium' | 'large';
  /** Optional. Icon selector. */
  icon?: 'new' | 'download' | 'settings';
  /** Presets for commonly used button styles */
  stylePreset?: keyof typeof stylePresets;
  /** Additional styles to apply to the button container. */
  styleOverrides?: Partial<SwissArmyButtonStyleSpec>;
};

/** Basic button with a variety of customization options. */
function SwissArmyButton({
  text,
  onPress,
  type = 'solid',
  size = 'medium',
  icon,
  stylePreset = 'default',
  styleOverrides = {},
}: SwissArmyButtonProps) {
  const [buttonState, setButtonState] = useState<
    'default' | 'hover' | 'pressed'
  >('default');

  const baseStyle = stylePresets[stylePreset];
  // TODO: Explore deep merging here and on DataGrid.
  const finalStyle: SwissArmyButtonStyleSpec = Object.assign(
    {},
    baseStyle,
    styleOverrides
  );
  // TODO: useTheme

  /**
   * If textColor is specified, use it. Otherwise if `type` is solid, use
   * white. If `type` is outline, use `color` unless button is pressed, then
   * use `onPressColor` if specified.
   */
  const calculatedTextColor =
    type === 'solid'
      ? finalStyle[buttonState].textColor ?? 'white'
      : finalStyle[buttonState].textColor ?? finalStyle[buttonState].color;

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
      case 'settings':
        return (
          <SettingsIcon
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
            borderRadius: finalStyle[buttonState].borderRadius ?? 5,
            textTransform: finalStyle[buttonState].textTransform ?? 'uppercase',
            fontWeight: finalStyle[buttonState].fontWeight ?? 600,
            fontSize: calculatedFontSize,
            ...finalStyle.container,
          },
          type === 'solid'
            ? {
                backgroundColor: finalStyle[buttonState].color,
                border: 'none',
              }
            : {
                borderColor: finalStyle[buttonState].color,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
              },
          finalStyle[buttonState].dropShadow && {
            // filter: `drop-shadow(${finalStyle[buttonState].dropShadow?.offsetX} ${finalStyle[buttonState].dropShadow?.offsetY} ${finalStyle[buttonState].dropShadow?.blurRadius} ${finalStyle[buttonState].dropShadow?.color})`,
            boxShadow: `${finalStyle[buttonState].dropShadow?.offsetX} ${finalStyle[buttonState].dropShadow?.offsetY} ${finalStyle[buttonState].dropShadow?.blurRadius} ${finalStyle[buttonState].dropShadow?.color}`,
          },
        ]}
        onMouseDown={() => {
          setButtonState('pressed');
        }}
        onMouseEnter={() => setButtonState('hover')}
        onMouseLeave={() => setButtonState('default')}
        onMouseUp={() => {
          setButtonState('default');
        }}
        onClick={onPress}
      >
        {icon && renderIcon(icon)}
        {text}
      </button>
    </>
  );
}

export { SwissArmyButton as default, SwissArmyButtonProps, stylePresets };
