import { useMemo } from 'react';
import { merge } from 'lodash';

// Definitions
import { SwitchStyleSpec, SwitchStyleSpecSubset, SwitchVariantProps } from '.';
import { blue, gray } from '../../../definitions/colors';

// Components
import Switch from './Switch';
import { useUITheme } from '../../theming';

/** "Outlined" style Switch component. */
export default function OutlinedSwitch({
  labels,
  themeRole,
  styleOverrides,
  options,
  selectedOption,
  onOptionChange,
}: SwitchVariantProps) {
  const theme = useUITheme();

  const styleSpec: SwitchStyleSpec = useMemo(() => {
    const defaultStyleSpec: SwitchStyleSpec = {
      container: {},
      default: [
        {
          borderColor: blue[500],
          knobColor: undefined,
          backgroundColor: undefined,
          labelColor: gray[600],
        },
      ],
      hover: [
        {
          borderColor: blue[600],
          knobColor: undefined,
          backgroundColor: undefined,
          labelColor: gray[600],
        },
      ],
      disabled: {
        borderColor: gray[200],
        knobColor: undefined,
        backgroundColor: undefined,
        labelColor: gray[600],
      },
    };

    const themeStyles: SwitchStyleSpecSubset | undefined = theme &&
      themeRole && {
        default: [
          {
            borderColor: theme?.palette[themeRole].hue[500],
          },
        ],
        hover: [
          {
            borderColor: theme?.palette[themeRole].hue[600],
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
    />
  );
}
