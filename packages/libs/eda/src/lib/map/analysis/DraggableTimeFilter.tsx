import { useState, useMemo, useEffect, useCallback } from 'react';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import EzTimeFilter, {
  EZTimeFilterDataProp,
} from '@veupathdb/components/lib/components/plotControls/EzTimeFilter';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import {
  VariablesByInputName,
  DataElementConstraintRecord,
  filterVariablesByConstraint,
} from '../../core/utils/data-element-constraints';
import { AnalysisState, usePromise } from '../../core';
import {
  DateVariable,
  NumberVariable,
  StudyEntity,
  Variable,
} from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';

import { SubsettingClient } from '../../core/api';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { useFindEntityAndVariable, Filter } from '../../core';
import {
  DateRange,
  NumberRange,
} from '@veupathdb/components/lib/types/general';
import { DateRangeFilter, NumberRangeFilter } from '../../core/types/filter';
import { Tooltip } from '@material-ui/core';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

interface Props {
  studyId: string;
  entities: StudyEntity[];
  // to handle filters
  analysisState: AnalysisState;
  subsettingClient: SubsettingClient;
  filters: Filter[] | undefined;
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
}

export default function DraggableTimeFilter({
  studyId,
  analysisState,
  entities,
  subsettingClient,
  filters,
  starredVariables,
  toggleStarredVariable,
}: Props) {
  // filter constraint for time slider inputVariables component
  const timeSliderVariableConstraints: DataElementConstraintRecord[] = [
    {
      overlayVariable: {
        isRequired: true,
        minNumVars: 1,
        maxNumVars: 1,
        // TODO: testing with SCORE S. mansoni Cluster Randomized Trial study
        // however, this study does not have date variable, thus temporarily use below for test purpose
        // i.e., additionally allowing 'integer'
        allowedTypes: ['date', 'integer'],
        // TODO: below two are correct ones
        // allowedTypes: ['date'],
        isTemporal: true,
      },
    },
  ];

  const temporalVariableTree = filterVariablesByConstraint(
    entities[0],
    timeSliderVariableConstraints[0]['overlayVariable']
  );

  // take the first suitable variable from the filtered variable tree

  // first find the first entity with some variables that passed the filter
  const defaultTimeSliderEntity: StudyEntity | undefined = Array.from(
    preorder(temporalVariableTree, (entity) => entity.children ?? [])
  )
    // not all `variables` are actually variables, so we filter to be sure
    .filter(
      (entity) =>
        entity.variables.filter((variable) => Variable.is(variable)).length > 0
    )[0];

  // then take the first variable from it
  const defaultTimeSliderVariable: Variable | undefined =
    defaultTimeSliderEntity.variables.filter((variable): variable is Variable =>
      Variable.is(variable)
    )[0];

  // set initial variable so that time slider loads data in the beginning
  const [timeSliderVariable, setTimeSliderVariable] = useState<
    VariableDescriptor | undefined
  >(
    defaultTimeSliderEntity && defaultTimeSliderVariable
      ? {
          entityId: defaultTimeSliderEntity.id,
          variableId: defaultTimeSliderVariable.id,
        }
      : undefined
  );

  // find variable metadata: use timeSliderVariable, not defaultTimeSlider ids
  const findEntityAndVariable = useFindEntityAndVariable();
  const timeSliderVariableMetadata = findEntityAndVariable(timeSliderVariable);

  // set initial selectedRange as empty, then change it at useEffect due to data request
  const [selectedRange, setSelectedRange] = useState({
    start: '', // TO DO: use undefined
    end: '',
  });

  // data request to distribution for time slider
  const getTimeSliderData = usePromise(
    useCallback(async () => {
      // no data request if no variable is available
      if (
        timeSliderVariableMetadata == null ||
        timeSliderVariable == null ||
        !(
          NumberVariable.is(timeSliderVariableMetadata.variable) ||
          DateVariable.is(timeSliderVariableMetadata.variable)
        )
      )
        return;

      const binSpec = {
        displayRangeMin:
          timeSliderVariableMetadata.variable.distributionDefaults.rangeMin +
          (timeSliderVariableMetadata.variable.type === 'date'
            ? 'T00:00:00Z'
            : ''),
        displayRangeMax:
          timeSliderVariableMetadata.variable.distributionDefaults.rangeMax +
          (timeSliderVariableMetadata.variable.type === 'date'
            ? 'T00:00:00Z'
            : ''),
        binWidth:
          timeSliderVariableMetadata.variable.distributionDefaults.binWidth ??
          1,
        binUnits:
          'binUnits' in timeSliderVariableMetadata.variable.distributionDefaults
            ? timeSliderVariableMetadata.variable.distributionDefaults.binUnits
            : undefined,
      };
      const distributionResponse = await subsettingClient.getDistribution(
        studyId,
        timeSliderVariable.entityId,
        timeSliderVariable.variableId,
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
    }, [
      timeSliderVariableMetadata?.variable,
      timeSliderVariable,
      subsettingClient,
      filters,
    ])
  );

  // converting data to visx format
  const timeFilterData: EZTimeFilterDataProp[] = useMemo(
    () =>
      !getTimeSliderData.pending && getTimeSliderData.value != null
        ? getTimeSliderData?.value?.x.map((value: string, index: number) => {
            return { x: value, y: getTimeSliderData.value!.y[index] };
          })
        : [],
    [getTimeSliderData]
  );

  // set time slider width and y position
  const timeFilterWidth = 750;
  const yPosition = 100; // TEMP: moved it down so I can see it all

  // set initial position: shrink
  const [defaultPosition, setDefaultPosition] = useState({
    x: window.innerWidth / 2 - timeFilterWidth / 2,
    y: yPosition,
  });

  // set DraggablePanel key to update time slider
  const [draggablePanelKey, setDraggablePanelKey] = useState(0);

  // set button text
  const [buttonText, setButtonText] = useState('Expand');

  const expandSlider = () => {
    setButtonText('Shrink');
    setDraggablePanelKey((currentKey) => currentKey + 1);
    setDefaultPosition({
      x: window.innerWidth / 2 - timeFilterWidth / 2,
      y: 100,
    });
  };

  const shrinkSlider = () => {
    setButtonText('Expand');
    setDraggablePanelKey((currentKey) => currentKey + 1);
    setDefaultPosition({
      x: window.innerWidth / 2 - timeFilterWidth / 2,
      y: yPosition,
    });
    // initialize range
    setSelectedRange({
      start: timeFilterData[0].x,
      end: timeFilterData[timeFilterData.length - 1].x,
    });
  };

  // inputVariables onChange function
  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlayVariable) {
      console.error(
        `Expected overlayVariable to be defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }

    // set time slider variable
    setTimeSliderVariable(selection.overlayVariable);
  }

  // set filter function
  const { setFilters } = analysisState;

  const filter = filters?.find(
    (f): f is NumberRangeFilter | DateRangeFilter =>
      timeSliderVariable != null &&
      f.variableId === timeSliderVariable.variableId &&
      f.entityId === timeSliderVariable.entityId &&
      (f.type === 'dateRange' || f.type === 'numberRange')
  );

  // the format of selectedRange at filter is min/max, not start/end
  // NOTE: currently, this considers both dateRange and numberRange for test purpose: indeed only dateRange is required
  // But perhaps this is just okay even if numberRange parts are redundant
  const updateFilter = useCallback(
    (selectedRange?: NumberRange | DateRange) => {
      const otherFilters = filters?.filter((f) => f !== filter) ?? [];
      if (selectedRange == null) {
        if (otherFilters.length !== filters?.length) setFilters(otherFilters);
      } else {
        if (timeSliderVariable == null) return;
        if (
          filter &&
          (filter.type === 'dateRange' || filter.type === 'numberRange') &&
          filter.min === selectedRange.min &&
          filter.max === selectedRange.max
        )
          return;
        setFilters(
          otherFilters.concat([
            timeSliderVariableMetadata?.variable.type === 'date'
              ? {
                  ...timeSliderVariable,
                  type: 'dateRange',
                  ...(selectedRange as DateRange),
                }
              : {
                  ...timeSliderVariable,
                  type: 'numberRange',
                  ...(selectedRange as NumberRange),
                },
          ])
        );
      }
    },
    [
      filters,
      filter,
      setFilters,
      timeSliderVariable,
      timeSliderVariableMetadata?.variable.type,
    ]
  );

  // submit/add filter
  const onSubmitTimeSlider = () => {
    if (updateFilter != null)
      // TODO: below is correct format
      // updateFilter({ min: selectedDomain.start, max: selectedDomain.end })
      // since there is no date variable, use number variable for test purpose
      // in this case, the value should consider the first value before dash and change it to number, not string
      updateFilter({
        min: Number(selectedRange.start.split('-')[0]),
        max: Number(selectedRange.end.split('-')[0]),
      });
  };

  // set constant values
  const defaultSymbolSize = 0.9;

  // change selectedRange considering async data request
  useEffect(() => {
    if (!getTimeSliderData.pending && getTimeSliderData.value != null) {
      setSelectedRange({
        start: getTimeSliderData.value.x[0],
        end: getTimeSliderData.value.x[getTimeSliderData.value.x.length - 1],
      });
    }
  }, [getTimeSliderData]);

  // if no variable in a study is suitable to time slider, do not show time slider
  return defaultTimeSliderVariable != null ? (
    <DraggablePanel
      key={'TimeSlider-' + draggablePanelKey}
      showPanelTitle
      panelTitle={'Time Slider'}
      confineToParentContainer
      defaultPosition={defaultPosition}
      isOpen={true}
      styleOverrides={{
        zIndex: 5,
      }}
    >
      <div
        style={{
          width: timeFilterWidth,
          // TODO: 170 is okay when using single lined variable name but 180 is for a variable name with two lines
          // height: 170,
          height: 180,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr repeat(1, auto) 1fr',
            gridColumnGap: '5px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ marginTop: '-0.5em' }}>
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
                overlayVariable: timeSliderVariable,
              }}
              onChange={handleInputVariablesOnChange}
              starredVariables={starredVariables}
              toggleStarredVariable={toggleStarredVariable}
              constraints={timeSliderVariableConstraints}
            />
          </div>
          {/* display start to end value */}
          <div style={{ gridColumnStart: 2, fontSize: '1.5em' }}>
            {selectedRange?.start} ~ {selectedRange?.end}
          </div>
          {/* button to reset selectedRange */}
          <div
            style={{
              marginLeft: 'auto',
              paddingRight: '1.5em',
            }}
          >
            <Tooltip title={'filtering selected range'}>
              <button
                role="button"
                aria-label="submit"
                style={{ padding: '0.25em' }}
                onClick={onSubmitTimeSlider}
              >
                Submit
              </button>
            </Tooltip>
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
                // whether movement of Brush should be disabled
                disableDraggingSelection={buttonText === 'Expand'}
                // disable brush selection: pass []
                resizeTriggerAreas={
                  buttonText === 'Expand' ? [] : ['left', 'right']
                }
              />
              {/* add a button to expand/shrink */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'right',
                  fontSize: defaultSymbolSize + 'em',
                }}
              >
                {/* reset position to hide panel title */}
                <div style={{ marginTop: '-0.3em', marginRight: '0.5em' }}>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'blue',
                      cursor: 'pointer',
                    }}
                    type="button"
                    onClick={
                      buttonText === 'Expand' ? expandSlider : shrinkSlider
                    }
                  >
                    {buttonText === 'Expand' ? (
                      <i className="fa fa-expand" aria-hidden="true"></i>
                    ) : (
                      <i className="fa fa-compress" aria-hidden="true"></i>
                    )}
                    &nbsp; {buttonText}
                  </button>
                </div>
              </div>
            </>
          )}
      </div>
    </DraggablePanel>
  ) : null;
}
