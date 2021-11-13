import React from 'react';
import { Checkbox } from '@material-ui/core';
import * as ColorMath from 'color-math';

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

  // set some default sizes
  const defaultMarkerSize = '0.8em';
  const legendTextSize = '1.0em';
  const circleMarkerSize = '0.7em';
  const scatterMarkerSpace = '2em';

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
            style={{ cursor: 'pointer', fontSize: legendTextSize }}
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
                  <div
                    style={{
                      position: 'relative',
                      margin: 'auto 0',
                    }}
                  >
                    {/* for histogram, barplot, Mosaic (2X2, RXC) - Mosaic does not use custom legend though */}
                    {item.marker === 'square' && (
                      <div
                        style={{
                          height: defaultMarkerSize,
                          width: defaultMarkerSize,
                          borderWidth: '0',
                          backgroundColor:
                            checkedLegendItems?.includes(item.label) &&
                            item.hasData
                              ? item.markerColor
                              : '#999',
                        }}
                      />
                    )}
                    {/* for boxplot */}
                    {item.marker === 'lightSquareBorder' && (
                      <div
                        style={{
                          height: defaultMarkerSize,
                          width: defaultMarkerSize,
                          borderWidth: '0.125em',
                          borderStyle: 'solid',
                          borderColor:
                            checkedLegendItems?.includes(item.label) &&
                            item.hasData
                              ? item.markerColor
                              : '#999',
                          backgroundColor:
                            checkedLegendItems?.includes(item.label) &&
                            item.hasData
                              ? ColorMath.evaluate(
                                  item.markerColor + ' @a 50%'
                                ).result.css()
                              : '#999',
                        }}
                      />
                    )}
                    {/* for scatter plot: marker */}
                    {item.marker === 'circle' && (
                      <div style={{ width: scatterMarkerSpace }}>
                        <div
                          style={{
                            height: circleMarkerSize,
                            width: circleMarkerSize,
                            margin: 'auto',
                            borderWidth: '0.15em',
                            borderStyle: 'solid',
                            borderRadius: '0.6em',
                            borderColor:
                              checkedLegendItems?.includes(item.label) &&
                              item.hasData
                                ? item.markerColor
                                : '#999',
                          }}
                        />
                      </div>
                    )}
                    {/* for scatter plot: smoothed mean or best fit line */}
                    {item.marker === 'line' && (
                      <div style={{ width: scatterMarkerSpace }}>
                        <div
                          style={{
                            height: '0.15em',
                            width: scatterMarkerSpace,
                            borderWidth: '0',
                            // borderStyle: 'solid',
                            // borderRadius: '0.6em',
                            backgroundColor:
                              checkedLegendItems?.includes(item.label) &&
                              item.hasData
                                ? item.markerColor
                                : '#999',
                          }}
                        />
                      </div>
                    )}
                    {/* for scatter plot: confidence interval */}
                    {item.marker === 'fainted' && (
                      <div style={{ width: scatterMarkerSpace }}>
                        <div
                          style={{
                            height: '0.5em',
                            width: scatterMarkerSpace,
                            borderWidth: '0',
                            backgroundColor:
                              checkedLegendItems?.includes(item.label) &&
                              item.hasData
                                ? ColorMath.evaluate(
                                    item.markerColor + ' @a 30%'
                                  ).result.css()
                                : '#999',
                          }}
                        />
                      </div>
                    )}
                    {/* for scatter plot: No data marker, x */}
                    {item.marker === 'x' && (
                      <div style={{ width: scatterMarkerSpace }}>
                        <div
                          style={{
                            textAlign: 'center',
                            fontWeight: 'normal',
                            fontSize: `calc(1.5 * ${legendTextSize})`,
                            color:
                              checkedLegendItems?.includes(item.label) &&
                              item.hasData
                                ? '#A6A6A6'
                                : '#999',
                          }}
                        >
                          &times;
                        </div>
                      </div>
                    )}
                  </div>
                  &nbsp;&nbsp;
                  <label
                    title={item.label}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: legendTextSize,
                      // gray out for filtered item
                      color:
                        checkedLegendItems?.includes(item.label) && item.hasData
                          ? ''
                          : '#999',
                    }}
                  >
                    {item.label === 'No data' ||
                    item.label.includes('No data,') ? (
                      <i>{legendEllipsis(item.label, 20)}</i>
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
