import { CSSProperties } from '@emotion/serialize';
import { merge } from 'lodash';
import { useMemo } from 'react';
import { blue, gray, green } from '../../definitions/colors';
import { CheckIcon } from '../icons';
import { UITheme } from '../theming/types';
import useUITheme from '../theming/useUITheme';

export type CheckboxStyleSpec = {
  selectedColor: CSSProperties['color'];
  color: CSSProperties['color'];
  size: number;
  border: {
    width: CSSProperties['borderWidth'];
    color: CSSProperties['borderColor'];
    radius: CSSProperties['borderRadius'];
  };
};

export type CheckboxProps = {
  selected: boolean;
  onToggle: (selected: boolean) => void;
  /**
   * Optional. Used to indicate which color properties to calculate based on
   * a UI theme. Not indicating a value here will mean that button should not
   * pick up styling options from the theme. */
  themeRole?: keyof UITheme['palette'];
  styleOverrides?: Partial<CheckboxStyleSpec>;
};

export default function Checkbox({
  selected,
  onToggle,
  themeRole,
  styleOverrides,
}: CheckboxProps) {
  const defaultStyle: CheckboxStyleSpec = {
    size: 12,
    color: gray[300],
    selectedColor: blue[500],
    border: { width: 2, color: gray[300], radius: 2 },
  };

  const theme = useUITheme();
  const themeStyle = useMemo<Partial<CheckboxStyleSpec>>(
    () =>
      theme && themeRole
        ? {
            selectedColor:
              theme.palette[themeRole].hue[theme.palette[themeRole].level],
          }
        : {},
    [theme, themeRole]
  );

  const finalStyle = useMemo(
    () => merge({}, defaultStyle, themeStyle, styleOverrides),
    [themeStyle]
  );

  return (
    <div onClick={() => onToggle(selected ? false : true)}>
      {selected ? (
        <div
          css={{
            width: finalStyle.size,
            height: finalStyle.size,
            backgroundColor: finalStyle.selectedColor,
            borderColor: finalStyle.selectedColor,
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CheckIcon fill="white" fontSize={finalStyle.size} />
        </div>
      ) : (
        <div
          css={{
            width: finalStyle.size,
            height: finalStyle.size,
            borderColor: finalStyle.color,
            backgroundColor: 'white',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
}
