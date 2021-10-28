import React from 'react';
import { Checkbox } from '@material-ui/core';

// set props for custom legend function
interface CustomLegendProps {
  legendItems: string[];
  checkedLegendItems: string[];
  setCheckedLegendItems: (checkedItems: string[]) => void;
  legendTitle?: string;
}
export default function CustomLegend({
  legendItems,
  checkedLegendItems,
  setCheckedLegendItems,
  legendTitle,
}: CustomLegendProps) {
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

  return (
    <div
      style={{
        border: '1px solid #dedede',
        boxShadow: '1px 1px 4px #00000066',
        padding: '1em',
      }}
    >
      <div title={legendTitle} style={{ cursor: 'pointer', fontSize: '1.2em' }}>
        {legendTitle}
      </div>
      {legendItems.length !== 1 && (
        <div className="customLegendCheckbox">
          {legendItems.map((id: string, index: number) => (
            <div style={{ display: 'flex' }}>
              <>
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
                  style={{ padding: 0 }}
                  defaultChecked
                />
                &nbsp;&nbsp;
                <label
                  title={id}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {id}
                </label>
              </>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
