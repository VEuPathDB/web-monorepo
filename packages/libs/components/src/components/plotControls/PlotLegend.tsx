import React from 'react';
import { Checkbox } from '@material-ui/core';

// define legendItems props
export interface LegendItemsProps {
  label: string;
  marker: string;
  markerColor?: string;
  hasData: boolean;
  group?: number;
  rank?: number;
}

// set props for custom legend function
interface PlotLegendProps {
  legendItems: LegendItemsProps[];
  checkedLegendItems: string[] | undefined;
  legendTitle?: string;
  // use onCheckedLegendItemsChange
  onCheckedLegendItemsChange?: (checkedLegendItems: string[]) => void;
}
export default function PlotLegend({
  legendItems,
  checkedLegendItems,
  legendTitle,
  // use onCheckedLegendItemsChange
  onCheckedLegendItemsChange,
}: PlotLegendProps) {
  // change checkbox state by click
  const handleLegendCheckboxClick = (checked: boolean, id: string) => {
    if (checkedLegendItems != null) {
      if (checked) {
        // for vizconfig.checkedLegendItems
        if (onCheckedLegendItemsChange != null)
          onCheckedLegendItemsChange([...checkedLegendItems, id]);
      } else {
        // for vizconfig.checkedLegendItems
        if (onCheckedLegendItemsChange != null)
          onCheckedLegendItemsChange(
            checkedLegendItems.filter((el: string) => el !== id)
          );
      }
    }
  };

  return (
    <>
      {legendItems.length > 1 && (
        <div
          style={{
            border: '1px solid #dedede',
            boxShadow: '1px 1px 4px #00000066',
            padding: '1em',
          }}
        >
          <div
            title={legendTitle}
            style={{ cursor: 'pointer', fontSize: '1.2em' }}
          >
            {legendTitle != null
              ? legendEllipsis(legendTitle, 23)
              : legendTitle}
          </div>
          <div className="plotLegendCheckbox">
            {legendItems.map((item: LegendItemsProps, index: number) => (
              <div key={item.label} style={{ display: 'flex' }}>
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
                      checkedLegendItems?.includes(item.label) ? true : false
                    }
                    style={{ padding: 0 }}
                    // disable when hasData is false
                    // but scatter plot needs further change due to smoothed mean and best fit
                    disabled={!item.hasData}
                  />
                  &nbsp;&nbsp;
                  <div style={{ position: 'relative', margin: 'auto 0' }}>
                    {/* <div style={{position: 'relative', margin: 'auto 0', height: '1.2em', width: '1.2em', borderWidth: '0'}}> */}
                    {/* for now, only support square (e.g., histogram, barplot, 2X2, RXC) */}
                    {item.marker === 'square' && (
                      <div
                        style={{
                          height: '1.2em',
                          width: '1.2em',
                          borderWidth: '0',
                          // width: '100%',
                          // height: '100%',
                          // gray out for filtered item
                          backgroundColor:
                            checkedLegendItems?.includes(item.label) &&
                            item.hasData
                              ? item.markerColor
                              : '#999',
                        }}
                      />
                    )}
                  </div>
                  &nbsp;&nbsp;
                  <label
                    title={item.label}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      // gray out for filtered item
                      color:
                        checkedLegendItems?.includes(item.label) && item.hasData
                          ? ''
                          : '#999',
                    }}
                  >
                    {item.label === 'No data' ? (
                      <i>{item.label}</i>
                    ) : (
                      legendEllipsis(item.label, 20)
                    )}
                  </label>
                </>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// legend ellipsis function for legend title (23) and legend items (20)
const legendEllipsis = (label: string, ellipsisLength: number) => {
  return (label || '').length > ellipsisLength
    ? (label || '').substring(0, ellipsisLength) + '...'
    : label;
};
