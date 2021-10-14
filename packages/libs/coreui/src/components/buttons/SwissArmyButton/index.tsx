import React, { useState } from 'react';

import typography from '../../../styleDefinitions/typography';
import { stylePresets, SwissArmyButtonStyleSpec } from './stylePresets';

type SwissArmyButtonProps = {
  /** Text of the button */
  text: string;
  /** Action to take when the button is clicked. */
  onPress: () => void;
  /** Optional. Text to display as a tooltip when button is hovered over. */
  tooltip?: string;
  /** Indicates if the button should be have a colored outline and
   * transparent center or have a solid fill color. */
  type?: 'outlined' | 'solid';
  /** The size of the button. */
  size?: 'small' | 'medium' | 'large';
  /** Optional. SVG component to use as an icon. */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Presets for commonly used button styles */
  stylePreset?: keyof typeof stylePresets;
  /** Additional styles to apply to the button container. */
  styleOverrides?: Partial<SwissArmyButtonStyleSpec>;
};

/** Basic button with a variety of customization options. */
function SwissArmyButton({
  text,
  onPress,
  tooltip,
  type = 'solid',
  size = 'medium',
  icon = () => null,
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
  const calculatedIconSize =
    size === 'large' ? '1.5rem' : size === 'medium' ? '1.25rem' : '1rem';
  const horizontalPadding = size === 'large' ? 15 : 15;
  const buttonHeight = size === 'large' ? 50 : size === 'medium' ? 35 : 25;

  const Icon = icon;

  return (
    <div css={{ position: 'relative' }}>
      <button
        css={[
          {
            height: buttonHeight,
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
                backgroundColor: `${finalStyle[buttonState].color} !important`,
                border: 'none',
              }
            : {
                borderColor: `${finalStyle[buttonState].color} !important`,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
              },
          finalStyle[buttonState].dropShadow && {
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
        <Icon
          fontSize={calculatedIconSize}
          fill={calculatedTextColor}
          css={{ marginRight: 10 }}
        />
        {text}
      </button>
      {tooltip && (
        <span
          css={[
            typography.pre,
            {
              position: 'absolute',
              top: buttonHeight + 5,
              backgroundColor: 'rgb(115, 115, 115)',
              padding: '4px 8px',
              borderRadius: 5,
              color: 'white',
              opacity: buttonState === 'hover' ? 1 : 0,
              transition: 'opacity .25s',
            },
          ]}
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}

export { SwissArmyButton as default, SwissArmyButtonProps, stylePresets };
