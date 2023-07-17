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

  // set forwardRef to call handleResetClick function from EzTimeFilter component
  const childRef = useRef<{ handleResetClick: () => void }>(null);
  const timeFilterWidth = 750;

  // control panel open/close
  const [panelOpen, setPanelOpen] = useState(false);
  const panelTitle = 'Time filter';
  function handleOnPanelDismiss() {
    // reset time filter
    childRef.current?.handleResetClick();
    setPanelOpen(!panelOpen);
  }

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
  const defaultColor = 'lightgray';

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 200,
          right: 300,
          zIndex: zIndex,
        }}
      >
        <button
          onClick={() => {
            // reset time filter here when closing
            childRef.current?.handleResetClick();
            setPanelOpen(!panelOpen);
          }}
          style={{ backgroundColor: panelOpen ? 'tomato' : 'lightgreen' }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              padding: '0.25rem 0.5rem',
            }}
          >
            {panelOpen ? 'Close' : 'Open'} {panelTitle}
          </span>
        </button>
      </div>

      <DraggablePanel
        key={panelTitle}
        showPanelTitle
        panelTitle={'Time filter'}
        confineToParentContainer
        defaultPosition={{
          x: window.innerWidth / 2 - timeFilterWidth / 2,
          y: 100,
        }}
        isOpen={panelOpen}
        onPanelDismiss={handleOnPanelDismiss}
        styleOverrides={{
          zIndex: panelOpen ? zIndex : 0,
        }}
      >
        <div
          style={{
            width: timeFilterWidth,
            height: 200,
            marginTop: '-1em',
            marginLeft: '0em',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr repeat(1, auto) 1fr',
              gridColumnGap: '5px',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '1em',
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
            {/* button to reset selectedRange */}
            <div
              style={{
                marginLeft: 'auto',
                marginTop: '-0.1em',
                paddingRight: '1.5em',
              }}
            >
              <a
                href="#"
                title="Reset filter"
                role="button"
                aria-label="Reset filter"
                onClick={childRef.current?.handleResetClick}
              >
                <Undo width={'1.5em'} height={'1.5em'} fill={'#4A6BD6'} />
              </a>
            </div>
          </div>
          <EzTimeFilter
            ref={childRef}
            data={timeFilterData}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            width={timeFilterWidth - 30}
            height={100}
            // line color of the selectedRange
            accentColor={'#4A6BD6'}
            // axis tick and tick label color
            axisColor={'#000'}
          />
          {/* DKDK add a legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: defaultSymbolSize + 'em',
            }}
          >
            <div
              style={{
                height: defaultSymbolSize + 'em',
                width: defaultSymbolSize + 'em',
                borderWidth: '0',
                backgroundColor: defaultColor,
              }}
            />
            <div>&nbsp;&nbsp;Has visible data on the map</div>
            <div
              style={{
                marginLeft: '5em',
                height: defaultSymbolSize / 2 + 'em',
                width: defaultSymbolSize + 'em',
                borderWidth: '0',
                backgroundColor: defaultColor,
              }}
            />
            <div>&nbsp;&nbsp;Has no visible data on the map</div>
          </div>
        </div>
      </DraggablePanel>
    </>
  );
}
