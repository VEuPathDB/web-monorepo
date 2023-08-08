import { useState, useRef } from 'react';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import EzTimeFilter, {
  EZTimeFilterDataProp,
} from '@veupathdb/components/lib/components/plotControls/EzTimeFilter';
import { Undo } from '@veupathdb/coreui';
import {
  InputSpec,
  InputVariables,
  requiredInputLabelStyle,
} from '../../core/components/visualizations/InputVariables';
import { VariablesByInputName } from '../../core/utils/data-element-constraints';
import { AnalysisState } from '../../core';
import { StudyEntity } from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';

interface Props {
  data: any;
  zIndex: number;
  entities: StudyEntity[];
  // to handle filters in the near future
  analysisState: AnalysisState;
  // not quite sure yet if configuration is necessary but typed as any for now
  configuration: any;
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  // constraints: any;
}

export default function DraggableTimeFilter({
  data,
  analysisState,
  zIndex,
  starredVariables,
  entities,
  configuration,
  toggleStarredVariable,
}: // constraints,
Props) {
  // converting lineplot data to visx format
  // temporarily set to 1 (with data) and 0 (no data) manually for demo purpose
  const timeFilterData: EZTimeFilterDataProp[] = data.series[0].x.map(
    (value: any, index: number) => {
      return { x: value, y: data.series[0].y[index] >= 9 ? 1 : 0 };
    }
  );

  // set initial selectedRange
  const [selectedRange, setSelectedRange] = useState({
    start: timeFilterData[0].x,
    end: timeFilterData[timeFilterData.length - 1].x,
  });

  // set time slider width and y position
  const timeFilterWidth = 750;
  const yPosition = 0;

  // set initial position: shrink
  const [defaultPosition, setDefaultPosition] = useState({
    x: window.innerWidth / 2 - timeFilterWidth / 2,
    y: yPosition,
  });

  // set DraggablePanel key
  const [key, setKey] = useState(0);

  // set button text
  const [buttonText, setButtonText] = useState('Expand');

  const expandSlider = () => {
    setButtonText('Shrink');
    setKey((currentKey) => currentKey + 1);
    setDefaultPosition({
      x: window.innerWidth / 2 - timeFilterWidth / 2,
      y: 100,
    });
  };

  const shrinkSlider = () => {
    setButtonText('Expand');
    setKey((currentKey) => currentKey + 1);
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

    // temporarily blocked
    // onChange({
    //   ...configuration,
    //   selectedVariable: selection.overlayVariable,
    //   selectedValues: undefined,
    // });
  }

  // set constant values
  const defaultSymbolSize = 0.9;

  return (
    <DraggablePanel
      key={'TimeSlider-' + key}
      showPanelTitle
      panelTitle={'Time Slider'}
      confineToParentContainer
      defaultPosition={defaultPosition}
      isOpen={true}
      styleOverrides={{
        // check appropriate zIndex
        zIndex: 5,
      }}
    >
      <div
        style={{
          width: timeFilterWidth,
          height: 170,
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
          {/* InputVariables does not work yet */}
          <div style={{ marginTop: '-0.5em' }}>
            <InputVariables
              showClearSelectionButton={false}
              inputs={[
                {
                  name: 'overlayVariable',
                  label: 'Variable',
                  titleOverride: ' ',
                },
              ]}
              entities={entities}
              selectedVariables={{
                overlayVariable: configuration?.selectedVariable,
              }}
              onChange={handleInputVariablesOnChange}
              // configuration={activeMarkerConfiguration}
              starredVariables={starredVariables}
              toggleStarredVariable={toggleStarredVariable}
              // constraints={constraints}
            />
          </div>
          {/* display start to end value */}
          <div style={{ gridColumnStart: 2, fontSize: '1.5em' }}>
            {selectedRange?.start} ~ {selectedRange?.end}
          </div>
        </div>
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
          resizeTriggerAreas={buttonText === 'Expand' ? [] : ['left', 'right']}
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
              onClick={buttonText === 'Expand' ? expandSlider : shrinkSlider}
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
      </div>
    </DraggablePanel>
  );
}
