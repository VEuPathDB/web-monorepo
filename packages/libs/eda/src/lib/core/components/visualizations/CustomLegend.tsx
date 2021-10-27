import React from 'react';
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  withStyles,
} from '@material-ui/core';

// set props for CustomLegend function
interface customLegendProps {
  legendItemArray: string[];
  checkedLegendItems: string[];
  setCheckedLegendItems: React.Dispatch<React.SetStateAction<string[]>>;
  legendTitle?: string;
}
export default function CustomLegend({
  legendItemArray,
  checkedLegendItems,
  setCheckedLegendItems,
  legendTitle,
}: customLegendProps) {
  // change checkbox state by click
  const handleLegendCheckboxClick = (checked: boolean, id: string) => {
    if (checked) {
      setCheckedLegendItems([...checkedLegendItems, id]);
    } else {
      // uncheck
      setCheckedLegendItems(
        checkedLegendItems.filter((el: string) => el !== id)
      );
    }
  };

  // white background tooltip
  const LightTooltip = withStyles({
    tooltip: {
      color: 'black',
      backgroundColor: 'white',
      fontSize: '1em',
      border: '2px solid #E6E8ED',
    },
  })(Tooltip);

  return (
    <>
      <div style={{ fontSize: '1.2em' }}>{legendTitle}</div>
      {/* for accepting markers, this needs to be changed to use <Checkbox> & HTML <label> tag
          In that case, Tooltip may be replaced with title attribute
      */}
      <div className="customLegendCheckbox">
        <FormGroup>
          {legendItemArray.map((id: string, index: number) => (
            <LightTooltip key={id + index} title={id} placement="right">
              <FormControlLabel
                label={id}
                style={{
                  marginTop: '-0.5em',
                  marginBottom: '-0.5em',
                }}
                control={
                  <Checkbox
                    key={id}
                    id={id}
                    value={id}
                    // color="default"
                    color="primary"
                    onChange={(e) => {
                      handleLegendCheckboxClick(e.target.checked, id);
                    }}
                    checked={checkedLegendItems.includes(id) ? true : false}
                  />
                }
              />
            </LightTooltip>
          ))}
        </FormGroup>
      </div>
    </>
  );
}
