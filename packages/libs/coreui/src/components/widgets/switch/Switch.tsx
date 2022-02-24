import { useMemo, useState } from 'react';

// Definitions
import { SwitchProps } from '.';
import { gray } from '../../../definitions/colors';
import { primaryFont } from '../../../styleDefinitions/typography';

/** Fully controlled Switch component. */
export default function Switch({
  labels,
  styleSpec,
  options,
  selectedOption,
  onOptionChange,
}: SwitchProps) {
  const [switchState, setSwitchState] =
    useState<'default' | 'hover'>('default');

  /**
   * The styles that should be applied can depend
   * on both whether or not the component is focused/hovered
   * and which option is selected.
   */
  const currentStyles = useMemo(() => {
    const selectedOptionIndex = options.findIndex(
      (option) => option === selectedOption
    );

    return styleSpec[switchState][selectedOptionIndex]
      ? styleSpec[switchState][selectedOptionIndex]
      : styleSpec[switchState][0];
  }, [switchState, options, selectedOption, styleSpec]);

  return (
    <div css={{ display: 'flex', alignItems: 'center' }}>
      {labels?.left && (
        <span
          css={{
            fontFamily: primaryFont,
            fontWeight: 400,
            marginRight: 10,
            fontSize: 14,
            color: currentStyles.labelColor,
          }}
        >
          {labels.left}
        </span>
      )}
      <div
        css={{
          display: 'flex',
          transition: 'all ease .33s',
          alignItems: 'center',
          width: 45,
          height: 22,
          borderRadius: 5,
          backgroundColor: currentStyles.backgroundColor,
          ...(currentStyles.borderColor && {
            outlineColor: currentStyles.borderColor,
            outlineWidth: 2,
            outlineStyle: 'solid',
            outlineOffset: -2,
          }),
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
            width: 12,
            height: 12,
            ...(switchState === 'hover'
              ? selectedOption === options[0]
                ? {
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                  }
                : {
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                  }
              : { borderRadius: 10 }),

            left:
              selectedOption === options[0]
                ? switchState === 'default'
                  ? 7
                  : 7
                : switchState === 'default'
                ? 27
                : 27,

            transition: 'ease all .33s',
            backgroundColor: currentStyles.knobColor,
          }}
        />
      </div>
      {labels?.right && (
        <span
          css={{
            fontFamily: primaryFont,
            fontWeight: 400,
            marginLeft: 10,
            fontSize: 14,
            color: currentStyles.labelColor,
          }}
        >
          {labels.right}
        </span>
      )}
    </div>
  );
}
