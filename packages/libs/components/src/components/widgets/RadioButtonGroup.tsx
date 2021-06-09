// widget for radio button group
import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { Typography } from '@material-ui/core';

export type RadioButtonGroupProps = {
  /** Label for the widget. Optional. */
  label?: string;
  /** How buttons are displayed. Vertical or Horizontal */
  orientation?: 'vertical' | 'horizontal';
  /** Options that will be presented as buttons. */
  options: Array<string>;
  /** The currently selected option.  */
  selectedOption: string;
  /** Action to take when an option is selected by the user. */
  onOptionSelected: (option: string) => void;
  /** Additional widget container styles. Optional. */
  containerStyles?: React.CSSProperties;
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
};

/**
 * A simple group of radio buttons in which only a single
 * radio button can be selected at any given time.
 */
export default function RadioButtonGroup({
  label = undefined,
  orientation = 'horizontal',
  options,
  selectedOption,
  onOptionSelected,
  containerStyles = {},
  labelPlacement,
  minWidth,
  buttonColor,
  margins,
  itemMarginRight,
}: RadioButtonGroupProps) {
  // perhaps not using focused?
  // const [focused, setFocused] = useState(false);

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
      // perhaps not using focused?
      // onMouseOver={() => setFocused(true)}
      // onMouseOut={() => setFocused(false)}
    >
      {label && (
        <Typography
          variant="button"
          // perhaps not using focused?
          // style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
          style={{ color: '#000000', fontWeight: 'bold' }}
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
          {options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option}
              label={option}
              labelPlacement={labelPlacement}
              // primary: blue; secondary: red
              control={<Radio color={buttonColor} />}
              style={{
                // padding: 5,
                // paddingLeft: 7.5,
                // paddingRight: 7.5,
                marginRight: itemMarginRight,
                fontSize: '0.75em',
                fontWeight: 400,
                textTransform: 'capitalize',
                // justifyContent: 'start',
                minWidth: minWidth,
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </div>
  );
}
