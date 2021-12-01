import React, { useState } from 'react';

import { ButtonStyleSpec } from '..';
import typography from '../../../styleDefinitions/typography';
import { UITheme } from '../../theming/types';

export type SwissArmyButtonProps = {
  /** Text of the button */
  text: string;
  /** Action to take when the button is clicked. */
  onPress: () => void;
  /** Optional. Text to display as a tooltip when button is hovered over. */
  tooltip?: string;
  /**
   * Optional. Used to indicate which color properties to calculate based on
   * a UI theme. Not indicating a value here will mean that button should not
   * pick up styling options from the theme. */
  themeRole?: keyof UITheme['palette'];
  /** The size of the button. */
  size?: 'small' | 'medium' | 'large';
  /** Optional. SVG component to use as an icon. */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Additional styles to apply to the button container. */
  styleSpec: ButtonStyleSpec;
};

/** Basic button with a variety of customization options. */
export default function SwissArmyButton({
  text,
  onPress,
  tooltip,
  size = 'medium',
  icon = () => null,
  styleSpec,
}: SwissArmyButtonProps) {
  const [buttonState, setButtonState] = useState<
    'default' | 'hover' | 'pressed'
  >('default');

  /**
   * If textColor is specified, use it. Otherwise if `type` is solid, use
   * white. If `type` is outline, use `color` unless button is pressed, then
   * use `onPressColor` if specified.
   */
  const calculatedTextColor = styleSpec[buttonState].textColor ?? 'white';
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
            textTransform: styleSpec[buttonState].textTransform ?? 'uppercase',
            fontWeight: styleSpec[buttonState].fontWeight ?? 600,
            fontSize: calculatedFontSize,
            ...styleSpec.container,
            backgroundColor: `${
              styleSpec[buttonState].color ?? 'transparent'
            } !important`,
            borderRadius: styleSpec[buttonState].border?.radius ?? 5,
            outlineStyle: styleSpec[buttonState].border?.style ?? 'none',
            outlineColor: styleSpec[buttonState].border?.color,
            outlineWidth: styleSpec[buttonState].border?.width,
            outlineOffset: styleSpec[buttonState].border?.width
              ? -1 * styleSpec[buttonState].border?.width!
              : undefined,
            border: 'none',
          },
          styleSpec[buttonState].dropShadow && {
            boxShadow: `${styleSpec[buttonState].dropShadow?.offsetX} ${styleSpec[buttonState].dropShadow?.offsetY} ${styleSpec[buttonState].dropShadow?.blurRadius} ${styleSpec[buttonState].dropShadow?.color}`,
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
              transitionDelay: buttonState === 'hover' ? '.25s' : 'initial',
            },
          ]}
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}
