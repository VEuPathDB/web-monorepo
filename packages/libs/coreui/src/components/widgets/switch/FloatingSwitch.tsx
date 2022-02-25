import { useMemo } from 'react';
import { merge } from 'lodash';

// Definitions
import { SwitchStyleSpec, SwitchStyleSpecSubset, SwitchVariantProps } from '.';
import { blue, gray } from '../../../definitions/colors';

// Components
import Switch from './Switch';
import { useUITheme } from '../../theming';

/** "Floating" style Switch component. */
export default function FloatingSwitch<T extends boolean | string | number>({
  labels,
  themeRole,
  styleOverrides,
  options,
  selectedOption,
  onOptionChange,
  disabled,
}: SwitchVariantProps<T>) {
  const theme = useUITheme();

  const styleSpec: SwitchStyleSpec = useMemo(() => {
    const defaultStyleSpec: SwitchStyleSpec = {
      container: {},
      default: [
        {
          backgroundColor: blue[100],
          knobColor: blue[500],
          borderColor: undefined,
          labelColor: gray[600],
        },
      ],
      hover: [
        {
          backgroundColor: blue[200],
          knobColor: blue[500],
          borderColor: undefined,
          labelColor: gray[600],
        },
      ],
      disabled: {
        backgroundColor: gray[100],
        knobColor: gray[500],
        borderColor: undefined,
        labelColor: gray[600],
      },
    };

    const themeStyles: SwitchStyleSpecSubset | undefined = theme &&
      themeRole && {
        default: [
          {
            backgroundColor: theme?.palette[themeRole].hue[100],
            knobColor: theme?.palette[themeRole].hue[500],
          },
        ],
        hover: [
          {
            backgroundColor: theme?.palette[themeRole].hue[200],
            knobColor: theme?.palette[themeRole].hue[500],
          },
        ],
      };

    return merge({}, defaultStyleSpec, themeStyles, styleOverrides);
  }, [styleOverrides, theme, themeRole]);

  return (
    <Switch
      styleSpec={styleSpec}
      labels={labels}
      options={options}
      onOptionChange={onOptionChange}
      selectedOption={selectedOption}
      disabled={disabled}
    />
  );
}
