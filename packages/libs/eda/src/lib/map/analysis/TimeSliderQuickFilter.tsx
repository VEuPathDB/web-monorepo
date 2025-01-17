import { useMemo, useState, useCallback, useEffect } from 'react';
import { ChevronRight, H6, Toggle } from '@veupathdb/coreui';
import TimeSlider, {
  TimeSliderDataProp,
} from '@veupathdb/components/lib/components/plotControls/TimeSlider';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import { VariablesByInputName } from '../../core/utils/data-element-constraints';
import { DistributionRequestParams, useSubsettingClient } from '../../core';
import { DateVariable, StudyEntity } from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';

import Spinner from '@veupathdb/components/lib/components/Spinner';
import { useFindEntityAndVariable, Filter } from '../../core';
import { zip } from 'lodash';
import { AppState } from './appState';
import { timeSliderVariableConstraints } from './config/eztimeslider';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import HelpIcon from '@veupathdb/wdk-client/lib/Components/Icon/HelpIcon';
import { SiteInformationProps } from './Types';
import { mapSidePanelBackgroundColor } from '../constants';
import { useQuery } from '@tanstack/react-query';

import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';

interface Props {
  studyId: string;
  entities: StudyEntity[];
  // to handle filters
  filters: Filter[] | undefined;
  starredVariables: VariableDescriptor[];
  config: NonNullable<AppState['timeSliderConfig']>;
  updateConfig: (newConfig: NonNullable<AppState['timeSliderConfig']>) => void;
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  siteInformation: SiteInformationProps;
}

interface selectedRangeProp {
  start: string;
  end: string;
}

export default function TimeSliderQuickFilter({
  studyId,
  entities,
  filters,
  starredVariables,
  config,
  updateConfig,
  toggleStarredVariable,
  siteInformation,
}: Props) {
  const subsettingClient = useSubsettingClient();

  const findEntityAndVariable = useFindEntityAndVariable(filters); // filter sensitivity
  const theme = useUITheme();
  const [minimized, setMinimized] = useState(true);

  const { variable, active, selectedRange } = config;
  const variableMetadata = findEntityAndVariable(variable);
  const { siteName } = siteInformation;

  // extend the back end range request if our selectedRange is outside of it
  const extendedDisplayRange = useMemo(
    () =>
      variableMetadata && DateVariable.is(variableMetadata.variable)
        ? selectedRange == null
          ? {
              start: variableMetadata.variable.distributionDefaults.rangeMin,
              end: variableMetadata.variable.distributionDefaults.rangeMax,
            }
          : {
              start:
                variableMetadata.variable.distributionDefaults.rangeMin <
                selectedRange.start
                  ? variableMetadata.variable.distributionDefaults.rangeMin
                  : selectedRange.start,
              end:
                variableMetadata.variable.distributionDefaults.rangeMax >
                selectedRange.end
                  ? variableMetadata.variable.distributionDefaults.rangeMax
                  : selectedRange.end,
            }
        : undefined,
    [variableMetadata, selectedRange]
  );

  // converting old usePromise code to useQuery in an efficient manner
  const { enabled, queryKey, queryFn } = useMemo(() => {
    // no data request if no variable is available
    if (
      variableMetadata == null ||
      variable == null ||
      extendedDisplayRange == null ||
      !DateVariable.is(variableMetadata.variable)
    )
      return { enabled: false };

    const binSpec = {
      displayRangeMin:
        extendedDisplayRange.start +
        (variableMetadata.variable.type === 'date' ? 'T00:00:00Z' : ''),
      displayRangeMax:
        extendedDisplayRange.end +
        (variableMetadata.variable.type === 'date' ? 'T00:00:00Z' : ''),
      binWidth: variableMetadata.variable.distributionDefaults.binWidth ?? 1,
      binUnits:
        'binUnits' in variableMetadata.variable.distributionDefaults
          ? variableMetadata.variable.distributionDefaults.binUnits
          : undefined,
    };

    const payload: [string, string, string, DistributionRequestParams] = [
      studyId,
      variable.entityId,
      variable.variableId,
      {
        valueSpec: 'count',
        filters: filters ?? [],
        binSpec,
      },
    ];

    return {
      enabled: true,
      queryKey: payload,
      queryFn: async () => {
        const distributionResponse = await subsettingClient.getDistribution(
          ...payload
        );
        const histo = distributionResponse.histogram;
        // return the bin starts and the final bin end (with a fixed y value of zero)
        return {
          x: histo
            .map((d) => d.binStart)
            .concat([histo[histo.length - 1].binEnd]),
          // conditionally set y-values to be 1 (with data) and 0 (no data)
          y: histo.map<number>((d) => (d.value >= 1 ? 1 : 0)).concat([0]),
        };
      },
    };
  }, [
    variable,
    subsettingClient,
    filters,
    extendedDisplayRange,
    studyId,
    variableMetadata,
  ]);

  const timeSliderData = useQuery({
    enabled,
    queryFn,
    queryKey,
    keepPreviousData: true,
  });

  // converting data to visx format
  const timeFilterData: TimeSliderDataProp[] = useMemo(() => {
    const restructured =
      timeSliderData.data != null
        ? zip(timeSliderData.data.x, timeSliderData.data.y)
            .map(([xValue, yValue]) => ({ x: xValue, y: yValue }))
            // and a type guard filter to avoid any `!` assertions.
            .filter(
              (val): val is TimeSliderDataProp => val.x != null && val.y != null
            )
        : [];

    return restructured;
  }, [timeSliderData.data]);

  // set time slider width and y position
  const timeFilterWidth = 750;

  // inputVariables onChange function
  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlayVariable) {
      console.error(
        `Expected overlayVariable to be defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }

    updateConfig({
      variable: selection.overlayVariable,
      selectedRange: undefined,
      active: true,
    });
  }

  const sliderHeight = minimized ? 50 : 75;

  const background =
    siteName === 'VectorBase'
      ? '#F5FAF1D0'
      : (theme?.palette.primary.hue[100] ?? mapSidePanelBackgroundColor) + 'D0'; // add transparency

  const borderRadius = '0px 0px 7px 7px'; // TO DO: add border radius and box shadow to the theme?
  const boxShadow =
    'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,rgba(0, 0, 0, 0.3) 0px 1px 3px -1px';

  const helpText = (
    <div style={{ paddingTop: 10 }}>
      <H6>Timeline help</H6>
      <p>
        Black bars indicate when <i>in time</i> there is data that...
        <ul>
          <li>is located anywhere on Earth*, not just currently in view</li>
          <li>
            has a value for <b>{variableMetadata?.variable.displayName}</b>
          </li>
          <li>satisfies any filters you have applied</li>
          <li>
            has values for the variable currently displayed on markers,
            including custom-configurations
          </li>
        </ul>
        (* data that has no geolocation will also be shown on the timeline)
      </p>
      <p>
        How to use
        <ul>
          <li>
            Apply a temporary time-based filter by dragging a window across the
            graphic
          </li>
          <li>
            Click once on the graphic outside the window to cancel the temporary
            filter
          </li>
        </ul>
      </p>
      <p>
        Expand the panel with the{' '}
        <ChevronRight transform={'matrix(0,1,-1,0,0,0)'} /> tab or click{' '}
        <a style={{ cursor: 'pointer' }} onClick={() => setMinimized(false)}>
          here
        </a>{' '}
        to reveal further controls that allow you to...
        <ul>
          <li>
            change the date variable (currently{' '}
            <b>{variableMetadata?.variable.displayName}</b>)
          </li>
          <li>set start and end dates precisely</li>
          <li>step the window forwards and backwards through the timeline</li>
          <li>toggle the temporary time window filter on/off</li>
        </ul>
      </p>
      {minimized && !active && (
        <p>
          <b>
            The timeline temporary filter is currently disabled. To enable it,
            expand the panel and click on the toggle.
          </b>
        </p>
      )}
    </div>
  );

  // disable arrow button
  const [disableLeftArrow, setDisableLeftArrow] = useState(false);
  const [disableRightArrow, setDisableRightArrow] = useState(false);

  // control selectedRange
  const handleAxisRangeChange = useCallback(
    (newRange?: NumberOrDateRange) => {
      if (newRange) {
        const newSelectedRange = {
          start: newRange.min as string,
          end: newRange.max as string,
        };
        updateConfig({ ...config, selectedRange: newSelectedRange });
      }
    },
    [config, updateConfig]
  );

  // step buttons
  const handleArrowClick = useCallback(
    (arrow: string) => {
      if (
        selectedRange &&
        selectedRange.start != null &&
        selectedRange.end != null
      ) {
        const newSelectedRange = newArrowRange(selectedRange, arrow);
        updateConfig({ ...config, selectedRange: newSelectedRange });
      }
    },
    [config, updateConfig, selectedRange]
  );

  // enabling/disabling date range arrows
  useEffect(() => {
    if (extendedDisplayRange && selectedRange) {
      const diff =
        new Date(selectedRange.end).getTime() -
        new Date(selectedRange.start).getTime();

      const expectedStartDate = new Date(
        new Date(selectedRange.start).getTime() - diff
      )
        .toISOString()
        .split('T')[0];

      const expectedEndDate = new Date(
        new Date(selectedRange.end).getTime() + diff
      )
        .toISOString()
        .split('T')[0];

      // left arrow
      if (
        new Date(expectedStartDate).getTime() <
        new Date(extendedDisplayRange.start).getTime()
      ) {
        setDisableLeftArrow(true);
      } else {
        setDisableLeftArrow(false);
      }

      // right arrow
      if (
        new Date(expectedEndDate).getTime() >
        new Date(extendedDisplayRange.end).getTime()
      ) {
        setDisableRightArrow(true);
      } else {
        setDisableRightArrow(false);
      }
    }
  }, [extendedDisplayRange, selectedRange]);

  // if no variable in a study is suitable to time slider, do not show time slider
  return variable != null && variableMetadata != null ? (
    <div>
      <div
        style={{
          width: timeFilterWidth,
          height: sliderHeight + (minimized ? 5 : 45),
          background,
          borderRadius,
          boxShadow,
        }}
      >
        {/* container for the slider widget or spinner */}
        <div style={{ height: sliderHeight, position: 'relative' }}>
          {/* conditional loading for TimeSlider */}
          {!timeSliderData.isFetching &&
          timeFilterData != null &&
          timeFilterData.length > 0 ? (
            <TimeSlider
              data={timeFilterData}
              selectedRange={selectedRange}
              setSelectedRange={(selectedRange) =>
                updateConfig({ ...config, selectedRange })
              }
              xAxisRange={extendedDisplayRange}
              width={timeFilterWidth - 30}
              height={sliderHeight}
              // fill color of the selectedRange
              brushColor={'lightpink'}
              brushOpacity={0.4}
              // axis tick and tick label color
              barColor={!active ? '#aaa' : '#000'}
              axisColor={!active ? '#888' : '#000'}
              // disable user-interaction
              disabled={!active}
            />
          ) : (
            <Spinner size={25} />
          )}
          <div style={{ position: 'absolute', right: 2, top: 5 }}>
            <HelpIcon children={helpText} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {!minimized && (
            <>
              <div style={{ maxWidth: 200, marginRight: 'auto' }}>
                <InputVariables
                  inputs={[
                    {
                      name: 'overlayVariable',
                      label: '',
                      noTitle: true,
                      isNonNullable: true,
                    },
                  ]}
                  entities={entities}
                  selectedVariables={{
                    overlayVariable: variable,
                  }}
                  onChange={handleInputVariablesOnChange}
                  starredVariables={starredVariables}
                  toggleStarredVariable={toggleStarredVariable}
                  constraints={timeSliderVariableConstraints}
                />
              </div>
              <div style={{ marginRight: '1em', marginLeft: 'auto' }}>
                <button
                  title={'move range left'}
                  onClick={() => handleArrowClick('left')}
                  disabled={!active || disableLeftArrow}
                >
                  <i
                    className="fa fa-arrow-left"
                    aria-hidden="true"
                    style={{
                      color:
                        active && !disableLeftArrow ? 'black' : 'lightgray',
                    }}
                  ></i>
                </button>
              </div>
              {/* add axis range control */}
              <div>
                <AxisRangeControl
                  range={
                    selectedRange != null
                      ? {
                          min: selectedRange.start,
                          max: selectedRange.end,
                        }
                      : undefined
                  }
                  onRangeChange={handleAxisRangeChange}
                  valueType={'date'}
                  containerStyles={{
                    flex: 1,
                  }}
                  // change the height of the input element
                  inputHeight={30}
                  disabled={!active}
                />
              </div>
              <div style={{ marginRight: 'auto', marginLeft: '1em' }}>
                <button
                  title={'move range right'}
                  onClick={() => handleArrowClick('right')}
                  disabled={!active || disableRightArrow}
                >
                  <i
                    className="fa fa-arrow-right"
                    aria-hidden="true"
                    style={{
                      color:
                        active && !disableRightArrow ? 'black' : 'lightgray',
                    }}
                  ></i>
                </button>
              </div>
              <div
                style={{
                  marginRight: '1em',
                }}
              >
                <Toggle
                  label={active ? 'On' : 'Off'}
                  labelPosition="left"
                  value={!!active}
                  onChange={(active) => updateConfig({ ...config, active })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div
        onClick={() => setMinimized(!minimized)}
        style={{
          margin: 'auto',
          fontSize: 18, // controls the SVG chevron size
          width: 50,
          height: 20,
          textAlign: 'center',
          background,
          borderRadius,
          boxShadow,
        }}
      >
        <ChevronRight
          transform={
            minimized ? 'matrix(0,1,-1,0,0,0)' : 'matrix(0,-1,1,0,0,0)'
          }
        />
      </div>
    </div>
  ) : null;
}

// compute new range by step button
function newArrowRange(
  selectedRange: selectedRangeProp | undefined,
  arrow: string
) {
  if (selectedRange) {
    const diff =
      new Date(selectedRange.end).getTime() -
      new Date(selectedRange.start).getTime();

    const diffSign = arrow === 'right' ? diff : -diff;

    const newSelectedRange = {
      start: new Date(new Date(selectedRange.start).getTime() + diffSign)
        .toISOString()
        .split('T')[0],
      end: new Date(new Date(selectedRange.end).getTime() + diffSign)
        .toISOString()
        .split('T')[0],
    };

    // unit in milliseconds
    const deltaLeapDaysMS =
      (countLeapDays(newSelectedRange) - countLeapDays(selectedRange)) *
      (1000 * 3600 * 24);

    return {
      start: new Date(
        new Date(newSelectedRange.start).getTime() -
          (arrow === 'left' ? deltaLeapDaysMS : 0)
      )
        .toISOString()
        .split('T')[0],
      end: new Date(
        new Date(newSelectedRange.end).getTime() +
          (arrow === 'right' ? deltaLeapDaysMS : 0)
      )
        .toISOString()
        .split('T')[0],
    };
  } else {
    return undefined;
  }
}

// check whether leap year is
function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// compute the number of days of leap years for a date range
function countLeapDays(dateRange: selectedRangeProp) {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  let leapDayCount = 0;

  for (let year = startYear; year <= endYear; year++) {
    if (isLeapYear(year)) {
      const leapDay = new Date(year, 1, 29);
      if (leapDay >= startDate && leapDay <= endDate) {
        leapDayCount++;
      }
    }
  }

  return leapDayCount;
}
