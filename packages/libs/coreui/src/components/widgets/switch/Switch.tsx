import { useMemo, useState } from 'react';

// Definitions
import { SwitchProps } from '.';
import { primaryFont } from '../../../styleDefinitions/typography';

/** Fully controlled Switch component. */
export default function Switch({
  label,
  labelPosition,
  styleSpec,
  state,
  onToggle,
  disabled,
  size,
}: SwitchProps) {
  const [switchState, setSwitchState] =
    useState<'default' | 'hover'>('default');

  /**
   * The CSS styles that should be applied can depend
   * on (1) whether or not the component is
   * focused/hovered and (2) which option is selected.
   */
  const currentStyles = useMemo(() => {
    if (disabled) return styleSpec.disabled;

    const selectedOptionIndex = state ? 1 : 0;

    return styleSpec[switchState][selectedOptionIndex]
      ? styleSpec[switchState][selectedOptionIndex]
      : styleSpec[switchState][0];
  }, [switchState, state, styleSpec, disabled]);

  const ariaLabel = useMemo(() => {
    if (label) return label + ' Switch';
    else return 'Switch';
  }, [label]);

  const width = size === 'medium' ? 40 : 20;
  const height = width / 2;
  const knobSize = height / 2;

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        pointerEvents: disabled ? 'none' : 'auto',
        fontFamily: primaryFont,
        fontSize: 13,
        fontWeight: 400,
        ...styleSpec.container,
      }}
    >
      {label && labelPosition === 'left' && (
        <span
          css={{
            marginRight: size === 'medium' ? 10 : 5,
            color: currentStyles.labelColor,
          }}
        >
          {label}
        </span>
      )}
      <div
        role='switch'
        aria-label={ariaLabel}
        aria-checked={state}
        css={{
          display: 'flex',
          transition: 'all ease .33s',
          alignItems: 'center',
          width,
          height,
          borderRadius: height / 4,
          backgroundColor: currentStyles.backgroundColor,
          ...(currentStyles.borderColor
            ? {
                outlineColor: currentStyles.borderColor,
                outlineWidth: 2,
                outlineStyle: 'solid',
                outlineOffset: -2,
              }
            : {
                outline: 'none',
              }),
        }}
        onKeyDown={(event) => {
          if (['Space', 'Enter'].includes(event.code)) {
            onToggle(!state);
          }
        }}
        onFocus={() => setSwitchState('hover')}
        onBlur={() => setSwitchState('default')}
        onMouseEnter={() => setSwitchState('hover')}
        onMouseLeave={() => setSwitchState('default')}
        onClick={() =>
          onToggle(!state)
        }
        tabIndex={0}
      >
        <div
          css={{
            position: 'relative',
            width: knobSize,
            height: knobSize,
            borderRadius: 10,
            left: !state ? width / 5 : width - knobSize - width / 5,
            transition: 'ease all .33s',
            backgroundColor: currentStyles.knobColor,
          }}
        />
      </div>
      {label && labelPosition === 'right' && (
        <span
          css={{
            marginLeft: size === 'medium' ? 10 : 5,
            color: currentStyles.labelColor,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
