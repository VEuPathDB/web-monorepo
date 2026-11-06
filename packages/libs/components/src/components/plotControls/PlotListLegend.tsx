import React from 'react';
import { Checkbox } from '@material-ui/core';
import * as ColorMath from 'color-math';

export type LegendMarker =
  | 'square'
  | 'lightSquareBorder'
  | 'circle'
  | 'circleOutline'
  | 'line'
  | 'lineWithCircle'
  | 'fainted'
  | 'x'
  | '';

// define legendItems props
export interface LegendItemsProps {
  label: string;
  marker: LegendMarker;
  italicizeLabel?: boolean;
  markerColor?: string;
  hasData: boolean;
  group?: number;
  rank?: number;
  hideFromLegend?: boolean;
  lineThickness?: string; // determines the stroke width. Example: '3px'. Default: '0.15em'.
}

export interface PlotListLegendProps {
  legendItems: LegendItemsProps[];
  checkedLegendItems?: string[];
  onCheckedLegendItemsChange?: (checkedLegendItems: string[]) => void;
  // add a condition to show legend for single overlay data
  showOverlayLegend?: boolean;
  /** Currently only has an effect on 'circle' markers */
  markerBodyOpacity?: number;
  // show checkbox: defualt is true
  showCheckbox?: boolean;
}

export default function PlotListLegend({
  legendItems,
  checkedLegendItems,
  onCheckedLegendItemsChange,
  showOverlayLegend = false,
  markerBodyOpacity = 1,
  showCheckbox = true,
}: PlotListLegendProps) {
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
  const circleMarkerSizeNum = 0.7;
  const circleMarkerSize = circleMarkerSizeNum.toString() + 'em';
  const scatterMarkerSpace = '2em';

  const Line = (props: { color?: string; thickness?: string }) => (
    <div
      style={{
        height: props.thickness ?? '0.15em',
        width: scatterMarkerSpace,
        borderWidth: '0',
        backgroundColor: props.color,
      }}
    />
  );

  return (
    <>
      {/* add a condition to show legend for single overlay data */}
      {(legendItems.length > 1 || showOverlayLegend) && (
        <div className="plotLegendCheckbox">
          {legendItems.map(
            (item: LegendItemsProps) =>
              !item.hideFromLegend && (
                <div key={item.label}>
                  {/* wrap checkbox with label so that label text is clickable */}
                  <label
                    key={item.label}
                    title={item.label}
                    style={{
                      // only those items with checkboxes that actually have data should look clickable
                      cursor:
                        showCheckbox && item.hasData ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: legendTextSize,
                      color: '',
                      // add this for general usage (e.g., story)
                      margin: 0,
                      height: showCheckbox ? undefined : '1.5em',
                    }}
                  >
                    {/* control checkbox based on the showCheckbox */}
                    {showCheckbox && (
                      <>
                        <Checkbox
                          key={item.label}
                          id={item.label}
                          value={item.label}
                          // gray checkbox: default
                          color={'default'}
                          onChange={(e) => {
                            handleLegendCheckboxClick(
                              e.target.checked,
                              item.label
                            );
                          }}
                          checked={
                            checkedLegendItems?.includes(item.label)
                              ? true
                              : false
                          }
                          style={{ padding: 0, width: '1em', height: '1em' }}
                          // disable when hasData is false
                          // but scatter plot needs further change due to smoothed mean and best fit
                          disabled={!item.hasData}
                        />
                        &nbsp;&nbsp;
                      </>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {/* for histogram, barplot, Mosaic (2X2, RXC) - Mosaic does not use custom legend though */}
                      {item.marker === 'square' && (
                        <div
                          style={{
                            height: defaultMarkerSize,
                            width: defaultMarkerSize,
                            borderWidth: '0',
                            backgroundColor: item.markerColor,
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
                            borderColor: item.markerColor,
                            backgroundColor: ColorMath.evaluate(
                              item.markerColor + ' @a 50%'
                            ).result.css(),
                          }}
                        />
                      )}
                      {/* for scatter plot marker and lineplot 0/0 case */}
                      {(item.marker === 'circle' ||
                        item.marker === 'circleOutline') && (
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
                                item.marker === 'circleOutline' ||
                                markerBodyOpacity === 0
                                  ? item.markerColor
                                  : 'transparent',
                              backgroundColor:
                                item.marker === 'circleOutline' ||
                                markerBodyOpacity === 0
                                  ? 'transparent'
                                  : ColorMath.evaluate(
                                      item.markerColor +
                                        ' @a ' +
                                        (markerBodyOpacity * 100).toString() +
                                        '%'
                                    ).result.css(),
                            }}
                          />
                        </div>
                      )}
                      {/* for scatter plot: smoothed mean or best fit line */}
                      {item.marker === 'line' && (
                        <div style={{ width: scatterMarkerSpace }}>
                          <Line
                            color={item.markerColor}
                            thickness={item.lineThickness}
                          />
                        </div>
                      )}
                      {item.marker === 'lineWithCircle' && (
                        <div
                          style={{
                            width: scatterMarkerSpace,
                            position: 'relative',
                          }}
                        >
                          <Line color={item.markerColor} />
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              height: circleMarkerSize,
                              width: circleMarkerSize,
                              margin: 'auto',
                              backgroundColor: item.markerColor,
                              borderRadius:
                                (circleMarkerSizeNum / 2).toString() + 'em',
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
                              backgroundColor: ColorMath.evaluate(
                                item.markerColor + ' @a 30%'
                              ).result.css(),
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
                              color: '#A6A6A6',
                            }}
                          >
                            &times;
                          </div>
                        </div>
                      )}
                    </div>
                    {/* below is legend label */}
                    &nbsp;&nbsp;
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        // set width to avoid unnecessary ellipsis for image export
                        width: '100%',
                      }}
                    >
                      {item.label === 'No data' ||
                      item.label.includes('No data,') ||
                      item.italicizeLabel ? (
                        <i>{item.label}</i>
                      ) : (
                        item.label
                      )}
                    </div>
                  </label>
                </div>
              )
          )}
        </div>
      )}
    </>
  );
}
