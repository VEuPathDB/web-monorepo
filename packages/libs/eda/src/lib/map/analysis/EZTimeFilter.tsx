import { useMemo, useCallback, ReactNode } from 'react';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import { Toggle } from '@veupathdb/coreui';
import EzTimeFilter, {
  EZTimeFilterDataProp,
} from '@veupathdb/components/lib/components/plotControls/EzTimeFilter';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import { VariablesByInputName } from '../../core/utils/data-element-constraints';
import { timeSliderVariableConstraints, usePromise } from '../../core';
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

interface Props {
  studyId: string;
  entities: StudyEntity[];
  // to handle filters
  subsettingClient: SubsettingClient;
  filters: Filter[] | undefined;
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;

  variable: AppState['timeSliderVariable'];
  setVariable: (newVariable: AppState['timeSliderVariable']) => void;
  selectedRange: AppState['timeSliderSelectedRange'];
  setSelectedRange: (newRange: AppState['timeSliderSelectedRange']) => void;
  active: AppState['timeSliderActive'];
  setActive: (newState: AppState['timeSliderActive']) => void;
}

export default function EZTimeFilter({
  studyId,
  entities,
  subsettingClient,
  filters,
  starredVariables,
  toggleStarredVariable,
  variable,
  setVariable,
  selectedRange,
  setSelectedRange,
  active, // to do - add a toggle to enable/disable
  setActive, // the small filter and grey everything out
}: Props) {
  const findEntityAndVariable = useFindEntityAndVariable();
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

    setVariable(selection.overlayVariable);
    setSelectedRange(undefined);
    setActive(true);
  }

  // if no variable in a study is suitable to time slider, do not show time slider
  return variable != null ? (
    <div
      style={{
        width: timeFilterWidth,
        // TODO: 170 is okay when using single lined variable name but 180 is for a variable name with two lines
        // height: 170,
        height: 180,
        background: '#FFFFFF50',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr repeat(1, auto) 1fr',
          gridColumnGap: '5px',
          padding: '0 10px 0 10px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ gridColumnStart: 1, marginTop: '-0.5em' }}>
          <InputVariables
            inputs={[
              {
                name: 'overlayVariable',
                label: 'Variable',
                titleOverride: ' ',
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
        {/* display start to end value
	      TO DO: make these date inputs
	    */}
        {selectedRange && (
          <div style={{ gridColumnStart: 2, fontSize: '1.5em' }}>
            {selectedRange?.start} ~ {selectedRange?.end}
          </div>
        )}

        <div
          style={{
            gridColumnStart: 3,
            display: 'grid',
            justifyContent: 'end',
          }}
        >
          <Toggle
            label={active ? 'On' : 'Off'}
            labelPosition="left"
            value={!!active}
            onChange={setActive}
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
          <>
            <EzTimeFilter
              data={timeFilterData}
              selectedRange={selectedRange}
              setSelectedRange={setSelectedRange}
              width={timeFilterWidth - 30}
              height={100}
              // line color of the selectedRange
              brushColor={'lightblue'}
              // add opacity
              brushOpacity={0.4}
              // axis tick and tick label color
              axisColor={'#000'}
              // whether movement of Brush should be disabled - false for now
              disableDraggingSelection={false}
              // if needing to disable brush selection: use []
              resizeTriggerAreas={['left', 'right']}
            />
          </>
        )}
    </div>
  ) : null;
}
