import { useMemo, useCallback, useState } from 'react';
import { ChevronRight, H6, Toggle } from '@veupathdb/coreui';
import EzTimeFilterWidget, {
  EZTimeFilterDataProp,
} from '@veupathdb/components/lib/components/plotControls/EzTimeFilter';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import { VariablesByInputName } from '../../core/utils/data-element-constraints';
import { usePromise } from '../../core';
import {
  DateVariable,
  NumberVariable,
  StudyEntity,
} from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';

import { SubsettingClient } from '../../core/api';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { useFindEntityAndVariable, Filter } from '../../core';
import { zip } from 'lodash';
import { AppState } from './appState';
import { timeSliderVariableConstraints } from './config/eztimeslider';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { SiteInformationProps, mapNavigationBackgroundColor } from '..';

interface Props {
  studyId: string;
  entities: StudyEntity[];
  // to handle filters
  subsettingClient: SubsettingClient;
  filters: Filter[] | undefined;
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;

  config: NonNullable<AppState['timeSliderConfig']>;
  updateConfig: (newConfig: NonNullable<AppState['timeSliderConfig']>) => void;
  siteInformation: SiteInformationProps;
}

export default function EZTimeFilter({
  studyId,
  entities,
  subsettingClient,
  filters,
  starredVariables,
  toggleStarredVariable,
  config,
  updateConfig,
  siteInformation,
}: Props) {
  const findEntityAndVariable = useFindEntityAndVariable();
  const theme = useUITheme();
  const [minimized, setMinimized] = useState(true);

  const { variable, active, selectedRange } = config;
  const variableMetadata = findEntityAndVariable(variable);
  const { siteName } = siteInformation;

  // data request to distribution for time slider
  const getTimeSliderData = usePromise(
    useCallback(async () => {
      // no data request if no variable is available
      if (
        variableMetadata == null ||
        variable == null ||
        !(
          NumberVariable.is(variableMetadata.variable) ||
          DateVariable.is(variableMetadata.variable)
        )
      )
        return;

      const binSpec = {
        displayRangeMin:
          variableMetadata.variable.distributionDefaults.rangeMin +
          (variableMetadata.variable.type === 'date' ? 'T00:00:00Z' : ''),
        displayRangeMax:
          variableMetadata.variable.distributionDefaults.rangeMax +
          (variableMetadata.variable.type === 'date' ? 'T00:00:00Z' : ''),
        binWidth: variableMetadata.variable.distributionDefaults.binWidth ?? 1,
        binUnits:
          'binUnits' in variableMetadata.variable.distributionDefaults
            ? variableMetadata.variable.distributionDefaults.binUnits
            : undefined,
      };
      const distributionResponse = await subsettingClient.getDistribution(
        studyId,
        variable.entityId,
        variable.variableId,
        {
          valueSpec: 'count',
          filters: filters ?? [],
          binSpec,
        }
      );

      return {
        x: distributionResponse.histogram.map((d) => d.binStart),
        // conditionally set y-values to be 1 (with data) and 0 (no data)
        y: distributionResponse.histogram.map((d) => (d.value >= 1 ? 1 : 0)),
      };
    }, [variableMetadata?.variable, variable, subsettingClient, filters])
  );

  // converting data to visx format
  const timeFilterData: EZTimeFilterDataProp[] = useMemo(
    () =>
      !getTimeSliderData.pending && getTimeSliderData.value != null
        ? zip(getTimeSliderData.value.x, getTimeSliderData.value.y)
            .map(([xValue, yValue]) => ({ x: xValue, y: yValue }))
            // and a type guard filter to avoid any `!` assertions.
            .filter(
              (val): val is EZTimeFilterDataProp =>
                val.x != null && val.y != null
            )
        : [],
    [getTimeSliderData]
  );

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

  // (easily) centering the variable picker requires two same-width divs either side
  const sideElementStyle = { width: '70px' };

  const sliderHeight = minimized ? 55 : 75;

  const background =
    siteName === 'VectorBase'
      ? '#F5FAF1D0'
      : (theme?.palette.primary.hue[100] ?? mapNavigationBackgroundColor) +
        'D0'; // add transparency

  const borderRadius = '0px 0px 7px 7px'; // TO DO: add border radius and box shadow to the theme?
  const boxShadow =
    'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,rgba(0, 0, 0, 0.3) 0px 1px 3px -1px';

  // if no variable in a study is suitable to time slider, do not show time slider
  return variable != null && variableMetadata != null ? (
    <div
      style={
        {
          //  zIndex: 10, // still need to figure out z-index stuff
        }
      }
    >
      <div
        style={{
          width: timeFilterWidth,
          height: sliderHeight + (minimized ? 25 : 45),
          background,
          borderRadius,
          boxShadow,
        }}
      >
        {/* container for the slider widget or spinner */}
        <div style={{ height: sliderHeight, position: 'relative' }}>
          {/* conditional loading for EzTimeFilter */}
          {!getTimeSliderData.pending &&
          getTimeSliderData.value != null &&
          timeFilterData.length > 0 ? (
            <EzTimeFilterWidget
              data={timeFilterData}
              selectedRange={selectedRange}
              setSelectedRange={(selectedRange) =>
                updateConfig({ ...config, selectedRange })
              }
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
        </div>
        <div
          style={{
            display: 'flex',
            padding: '5px 10px 0px 10px',
            justifyContent: minimized ? 'center' : 'space-between',
            alignItems: 'center',
          }}
        >
          {minimized /* just show the variable name as text */ ? (
            <div style={{}}>{variableMetadata.variable.displayName}</div>
          ) : (
            <>
              <div style={sideElementStyle}></div>
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
              <div style={sideElementStyle}>
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