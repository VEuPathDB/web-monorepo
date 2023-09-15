import { useMemo, useCallback, useState } from 'react';
import { H6, Toggle } from '@veupathdb/coreui';
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
import { trimArray } from '../../core/utils/trim';

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
}: Props) {
  const findEntityAndVariable = useFindEntityAndVariable(filters); // filter aware
  const [minimized, setMinimized] = useState(true);

  const { variable, active, selectedRange } = config;
  const variableMetadata = findEntityAndVariable(variable);

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
      trimArray(
        !getTimeSliderData.pending && getTimeSliderData.value != null
          ? zip(getTimeSliderData.value.x, getTimeSliderData.value.y)
              .map(([xValue, yValue]) => ({ x: xValue, y: yValue }))
              // and a type guard filter to avoid any `!` assertions.
              .filter(
                (val): val is EZTimeFilterDataProp =>
                  val.x != null && val.y != null
              )
          : [],
        ({ y }) => y === 0 // remove leading and trailing zeroes (filter sensitivity)
      ),
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

  // if no variable in a study is suitable to time slider, do not show time slider
  return variable != null && variableMetadata != null ? (
    <div
      style={{
        width: timeFilterWidth,
        height: minimized ? 110 : 150,
        background: '#FFFFFF50',
      }}
      onMouseEnter={() => setMinimized(false)}
      onMouseLeave={() => setMinimized(true)}
    >
      <div
        style={{
          display: 'flex',
          padding: '10px 10px 0px 10px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{}}>
          <H6>
            {variableMetadata.variable.displayName +
              (active && selectedRange
                ? ` [${selectedRange?.start} to ${selectedRange?.end}]`
                : ' (all dates)')}
          </H6>
        </div>
        {/* display start to end value
	      TO DO: make these date inputs?
        {selectedRange && (
          <div style={{ gridColumnStart: 2, fontSize: '1.5em' }}>
            {selectedRange?.start} ~ {selectedRange?.end}
          </div>
        )}
	  */}
        <div style={{}}>
          <Toggle
            label={active ? 'On' : 'Off'}
            labelPosition="left"
            value={!!active}
            onChange={(active) => updateConfig({ ...config, active })}
          />
        </div>
      </div>
      {/* display data loading spinner while requesting data to the backend */}
      {getTimeSliderData.pending && (
        <div style={{ marginTop: '2em', height: 50, position: 'relative' }}>
          <Spinner size={50} />
        </div>
      )}
      {/* conditional loading for EzTimeFilter */}
      {!getTimeSliderData.pending &&
        getTimeSliderData.value != null &&
        timeFilterData.length > 0 && (
          <EzTimeFilterWidget
            data={timeFilterData}
            selectedRange={selectedRange}
            setSelectedRange={(selectedRange) =>
              updateConfig({ ...config, selectedRange })
            }
            width={timeFilterWidth - 30}
            height={75}
            // fill color of the selectedRange
            brushColor={'lightpink'}
            brushOpacity={0.4}
            // axis tick and tick label color
            axisColor={'#000'}
            // disable user-interaction
            disabled={!active}
          />
        )}
      {!minimized && (
        <div style={{ marginRight: '10px' }}>
          <InputVariables
            inputs={[
              {
                name: 'overlayVariable',
                label: 'Choose a different date variable:',
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
            flexDirection="row-reverse"
          />
        </div>
      )}
    </div>
  ) : null;
}
