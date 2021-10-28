import React from 'react';
import { Checkbox } from '@material-ui/core';

//DKDK define legendItems props
export interface LegendItemsProps {
  label: string;
  marker: string;
  hasData: boolean;
  group?: number;
  rank?: number;
}

// set props for custom legend function
interface PlotLegendProps {
  // legendItems: string[];
  legendItems: LegendItemsProps[];
  checkedLegendItems: string[];
  setCheckedLegendItems: (checkedItems: string[]) => void;
  legendTitle?: string;
}
export default function PlotLegend({
  legendItems,
  checkedLegendItems,
  setCheckedLegendItems,
  legendTitle,
}: PlotLegendProps) {
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
        <div className="plotLegendCheckbox">
          {legendItems.map((item: LegendItemsProps, index: number) => (
            <div style={{ display: 'flex' }}>
              <>
                <Checkbox
                  key={item.label}
                  id={item.label}
                  value={item.label}
                  // color="default"
                  color="primary"
                  onChange={(e) => {
                    handleLegendCheckboxClick(e.target.checked, item.label);
                  }}
                  checked={
                    checkedLegendItems.includes(item.label) ? true : false
                  }
                  style={{ padding: 0 }}
                />
                &nbsp;&nbsp;
                <label
                  title={item.label}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {item.label}
                </label>
              </>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
