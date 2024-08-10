import React, { ReactNode } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { Typography } from '@material-ui/core';
import { Tooltip } from '@veupathdb/coreui';
import { DARKEST_GRAY, MEDIUM_GRAY } from '../../constants/colors';

export type RadioButtonGroupProps = {
  /** Label for the widget. Optional. */
  label?: string;
  /** How buttons are displayed. Vertical or Horizontal */
  orientation?: 'vertical' | 'horizontal';
  /** Options that will be presented as buttons. */
  options: Array<string>;
  /** Optional display labels for the options (otherwise the `options` array will be used) */
  optionLabels?: Array<ReactNode>;
  /** The currently selected option.  */
  selectedOption: string;
  /** Action to take when an option is selected by the user. */
  onOptionSelected: (option: string) => void;
  /** Additional widget container styles. Optional. */
  containerStyles?: React.CSSProperties;
  /** Additional label (title) styles. Optional. */
  labelStyles?: React.CSSProperties;
  /** Additional option label styles. Optional. */
  optionLabelStyles?: React.CSSProperties;
  /** location of radio button label: start: label & button; end: button & label */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
  /** minimum width to set up equivalently spaced width per item */
  minWidth?: number;
  /** button color: for now, supporting blue and red only - primary: blue; secondary: red */
  buttonColor?: 'primary' | 'secondary';
  /** margin of radio button group: string array for top, left, bottom, and left, e.g., ['10em', '0', '0', '10em'] */
  margins?: string[];
  /** marginRight of radio button item: default 16px from MUI */
  itemMarginRight?: number | string;
  /** disabled list (same values as `options`) to disable radio button item(s): grayed out
   * if a Map is used, then the values are used in Tooltips to explain why each option is disabled
   */
  disabledList?: string[] | Map<string, ReactNode>;
};

/**
 * A simple group of radio buttons in which only a single
 * radio button can be selected at any given time.
 */
export default function RadioButtonGroup({
  label = undefined,
  orientation = 'horizontal',
  options,
  optionLabels,
  selectedOption,
  onOptionSelected,
  containerStyles = {},
  labelStyles = {},
  optionLabelStyles = {},
  labelPlacement,
  minWidth,
  buttonColor = 'primary',
  margins,
  itemMarginRight,
  disabledList,
}: RadioButtonGroupProps) {
  const isDisabled = (option: string) => {
    if (!disabledList) return false;
    if (Array.isArray(disabledList)) {
      return disabledList.includes(option);
    }
    return disabledList.has(option);
  };

  const getDisabledReason = (option: string) => {
    if (disabledList instanceof Map) {
      return disabledList.get(option);
    }
    return null;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: margins ? margins[0] : '',
        marginRight: margins ? margins[1] : '',
        marginBottom: margins ? margins[2] : '',
        marginLeft: margins ? margins[3] : '',
        ...containerStyles,
      }}
    >
      {label && (
        <Typography
          variant="button"
          style={{
            color: DARKEST_GRAY,
            fontWeight: 500,
            fontSize: '1.2em',
            ...labelStyles,
          }}
        >
          {label}
        </Typography>
      )}
      <FormControl style={{ width: '100%' }}>
        <RadioGroup
          value={selectedOption}
          onChange={(_, value) => value && onOptionSelected(value)}
          aria-label={`${label} control button group`}
          row={orientation === 'horizontal' ? true : false}
        >
          {options.map((option, index) => {
            const disabled = isDisabled(option);
            const disabledReason = getDisabledReason(option);

            const labelElement = (
              <span
                style={{
                  color: disabled ? MEDIUM_GRAY : DARKEST_GRAY,
                  fontSize: '0.9em',
                  ...optionLabelStyles,
                }}
              >
                {optionLabels != null && optionLabels.length === options.length
                  ? optionLabels[index]
                  : option}
              </span>
            );

            const formControlLabel = (
              <FormControlLabel
                key={index}
                value={option}
                label={labelElement}
                disabled={disabled}
                labelPlacement={labelPlacement}
                control={<Radio color={buttonColor} />}
                style={{
                  marginRight: itemMarginRight,
                  fontSize: '0.75em',
                  fontWeight: 400,
                  textTransform: 'capitalize',
                  minWidth: minWidth,
                }}
              />
            );

            return disabledReason ? (
              <Tooltip title={disabledReason} key={index}>
                {formControlLabel}
              </Tooltip>
            ) : (
              formControlLabel
            );
          })}
        </RadioGroup>
      </FormControl>
    </div>
  );
}
