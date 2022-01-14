import { useMemo, useState } from 'react';

import { ButtonStyleSpec, SwissArmyButtonVariantProps } from '..';
import typography from '../../../styleDefinitions/typography';

export type SwissArmyButtonProps = Omit<
  SwissArmyButtonVariantProps,
  'styleOverrides' | 'themeRole'
> & { styleSpec: ButtonStyleSpec };

/** Basic button with a variety of customization options. */
export default function SwissArmyButton({
  text,
  textTransform = 'uppercase',
  onPress,
  disabled = false,
  tooltip,
  size = 'medium',
  icon,
  styleSpec,
  ariaLabel,
}: SwissArmyButtonProps) {
  const [buttonState, setButtonState] = useState<
    'default' | 'hover' | 'pressed'
  >('default');

  const styleState = useMemo<'default' | 'hover' | 'pressed' | 'disabled'>(
    () => (disabled ? 'disabled' : buttonState),
    [buttonState, disabled]
  );

  const calculatedFontSize = size === 'large' ? '1rem' : '.80rem';
  const calculatedIconSize =
    size === 'large' ? '1.5rem' : size === 'medium' ? '1.25rem' : '1rem';
  const horizontalPadding = size === 'large' ? 15 : 15;
  const buttonHeight = size === 'large' ? 50 : size === 'medium' ? 35 : 25;

  const Icon = icon;

  return (
    <div css={{ position: 'relative' }}>
      <button
        aria-label={ariaLabel}
        tabIndex={0}
        disabled={disabled}
        css={[
          typography.primaryFont,
          {
            cursor: disabled ? 'not-allowed' : 'auto',
            height: buttonHeight,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
            color: styleSpec[styleState].textColor,
            textTransform: textTransform,
            fontWeight: styleSpec[styleState].fontWeight ?? 600,
            fontSize: calculatedFontSize,
            ...styleSpec.container,
            backgroundColor: `${
              styleSpec[styleState].color ?? 'transparent'
            } !important`,
            borderRadius: styleSpec[styleState].border?.radius ?? 5,
            outlineStyle: styleSpec[styleState].border?.style ?? 'none',
            outlineColor: styleSpec[styleState].border?.color,
            outlineWidth: styleSpec[styleState].border?.width,
            outlineOffset: styleSpec[styleState].border?.width
              ? -1 * styleSpec[styleState].border?.width!
              : undefined,
            border: 'none',
          },
          styleSpec[styleState].dropShadow && {
            boxShadow: `${styleSpec[styleState].dropShadow?.offsetX} ${styleSpec[styleState].dropShadow?.offsetY} ${styleSpec[styleState].dropShadow?.blurRadius} ${styleSpec[styleState].dropShadow?.color}`,
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
        {Icon && (
          <Icon
            fontSize={calculatedIconSize}
            fill={styleSpec[styleState].textColor}
            css={text && { marginRight: 10 }}
          />
        )}
        {text}
      </button>
      {tooltip && (
        <span
          css={[
            typography.pre,
            {
              pointerEvents: 'none',
              position: 'absolute',
              zIndex: 1000,
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
