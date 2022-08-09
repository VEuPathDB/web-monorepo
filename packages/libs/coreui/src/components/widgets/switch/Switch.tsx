import { useMemo, useState } from 'react';

// Definitions
import { SwitchProps } from '.';
import { primaryFont } from '../../../styleDefinitions/typography';

/** Fully controlled Switch component. */
export default function Switch<T extends boolean | string | number>({
  labels,
  styleSpec,
  options,
  selectedOption,
  onOptionChange,
  disabled,
}: SwitchProps<T>) {
  const [switchState, setSwitchState] =
    useState<'default' | 'hover'>('default');

  /**
   * The CSS styles that should be applied can depend
   * on (1) whether or not the component is
   * focused/hovered and (2) which option is selected.
   */
  const currentStyles = useMemo(() => {
    if (disabled) return styleSpec.disabled;

    const selectedOptionIndex = options.findIndex(
      (option) => option === selectedOption
    );

    return styleSpec[switchState][selectedOptionIndex]
      ? styleSpec[switchState][selectedOptionIndex]
      : styleSpec[switchState][0];
  }, [switchState, options, selectedOption, styleSpec, disabled]);

  const { size } = styleSpec;

  const ariaLabel = useMemo(() => {
    if (!labels) return 'Switch';

    if (labels.left && labels.right) {
      return `${labels.left}/${labels.right} Switch`;
    } else if (labels.left) {
      return `${labels.left} Switch`;
    } else {
      return `${labels.right} Switch`;
    }
  }, [labels]);

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
      {labels?.left && (
        <span
          css={{
            marginRight: size === 'medium' ? 10 : 5,
            color: currentStyles.labelColor,
          }}
        >
          {labels.left}
        </span>
      )}
      <div
        role='switch'
        aria-label={ariaLabel}
        aria-checked={selectedOption === options[0] ? false : true}
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
            onOptionChange(
              selectedOption === options[0] ? options[1] : options[0]
            );
          }
        }}
        onFocus={() => setSwitchState('hover')}
        onBlur={() => setSwitchState('default')}
        onMouseEnter={() => setSwitchState('hover')}
        onMouseLeave={() => setSwitchState('default')}
        onClick={() =>
          onOptionChange(
            selectedOption === options[0] ? options[1] : options[0]
          )
        }
        tabIndex={0}
      >
        <div
          css={{
            position: 'relative',
            width: knobSize,
            height: knobSize,
            ...(switchState === 'hover'
              ? selectedOption === options[0]
                ? {
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: height / 4,
                    borderBottomLeftRadius: height / 4,
                  }
                : {
                    borderTopRightRadius: height / 4,
                    borderBottomRightRadius: height / 4,
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                  }
              : { borderRadius: 10 }),
            left: selectedOption === options[0] ? width / 5 : width - knobSize - width / 5,
            transition: 'ease all .33s',
            backgroundColor: currentStyles.knobColor,
          }}
        />
      </div>
      {labels?.right && (
        <span
          css={{
            marginLeft: size === 'medium' ? 10 : 5,
            color: currentStyles.labelColor,
          }}
        >
          {labels.right}
        </span>
      )}
    </div>
  );
}
