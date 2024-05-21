import { useMemo, useState, useCallback } from 'react';
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
  const extendedDisplayRange =
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
      : undefined;

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
    variableMetadata?.variable,
    variable,
    subsettingClient,
    filters,
    extendedDisplayRange?.start,
    extendedDisplayRange?.end,
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
    [updateConfig]
  );

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
              <div style={{}}>
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
              {/* add axis range control */}
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
                  marginLeft: '3em',
                  marginBottom: '0.5em',
                }}
                // change the height of the input element
                inputHeight={30}
                disabled={!active}
              />
              <div
                style={{
                  marginRight: '1em',
                  marginBottom: '0.5em',
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
