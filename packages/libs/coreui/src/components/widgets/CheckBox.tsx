import { CSSProperties } from '@emotion/serialize';
import { merge } from 'lodash';
import { useMemo } from 'react';
import { blue, gray, green } from '../../definitions/colors';
import { CheckIcon } from '../icons';
import { UITheme } from '../theming/types';
import useUITheme from '../theming/useUITheme';

export type CheckBoxStyleSpec = {
  selectedColor: CSSProperties['color'];
  color: CSSProperties['color'];
  size: CSSProperties['width'];
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
  role?: keyof UITheme['palette'];
  style?: Partial<CheckBoxStyleSpec>;
};

export default function CheckBox({
  selected,
  onToggle,
  role,
  style = {
    size: 12,
    color: gray[300],
    selectedColor: blue[500],
    border: { width: 2, color: gray[300], radius: 2 },
  },
}: CheckboxProps) {
  const theme = useUITheme();
  const themeStyle = useMemo<Partial<CheckBoxStyleSpec>>(
    () =>
      theme && role
        ? { selectedColor: theme.palette[role].hue[theme.palette[role].level] }
        : {},
    [theme, role]
  );

  const finalStyle = useMemo(() => merge({}, style, themeStyle), [themeStyle]);

  return (
    <div onClick={() => onToggle(selected ? false : true)}>
      {selected ? (
        <div
          css={{
            width: 12,
            height: 12,
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
          <CheckIcon fill='white' fontSize={20} />
        </div>
      ) : (
        <div
          css={{
            width: 12,
            height: 12,
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
