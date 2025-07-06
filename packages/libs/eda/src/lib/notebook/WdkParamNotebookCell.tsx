import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import {
  NOTEBOOK_UI_STATE_KEY,
  WdkParamCellDescriptor,
} from './NotebookPresets';
import { SingleSelect } from '@veupathdb/coreui';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';
import { AnalysisState } from '../core';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { UpdateParamValue } from './EdaNotebookAnalysis';

const uiStateKey = NOTEBOOK_UI_STATE_KEY;

export function WdkParamNotebookCell(
  props: NotebookCellProps<WdkParamCellDescriptor>
) {
  const { cell, isDisabled, wdkState = {} } = props;

  const { paramNames, title } = cell;
  const { parameters, paramValues, updateParamValue } = wdkState;

  // userInputParameters are the wdk parameters that the user will
  // fill out in the search. For example, in wgcna the user needs to select a module,
  // but doesn't need to select the hidden param for this search called "dataset".

  const userInputParameters = parameters?.filter((param) =>
    paramNames?.includes(param.name)
  );

  return (
    <>
      <div className="NotebookCellHelpText">
        <span>{cell.helperText}</span>
      </div>
      <ExpandablePanel
        title={title}
        subTitle={''}
        state="open"
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          <div className="WdkParamInputs">
            {userInputParameters &&
              paramNames &&
              paramValues &&
              userInputParameters.map((param) => {
                const paramCurrentValue = paramValues[param.name];

                // There are many param types. The following is not exhaustive.
                if (param.type === 'single-pick-vocabulary') {
                  const selectItems: Item<string>[] = Array.isArray(
                    param.vocabulary
                  )
                    ? param.vocabulary.map((item: [string, string, null]) => ({
                        value: item[0],
                        display: item[1],
                      }))
                    : [];

                  return (
                    <div className="InputGroup">
                      <span>{param.displayName}</span>
                      <SingleSelect
                        items={selectItems}
                        value={paramCurrentValue}
                        buttonDisplayContent={paramCurrentValue}
                        onSelect={(newValue: string) =>
                          updateParamValue?.(param, newValue)
                        }
                      />
                    </div>
                  );
                } else if (param.type === 'string' && param.isNumber) {
                  return (
                    <div className="InputGroup">
                      <span>{param.displayName}</span>
                      <NumberInput
                        value={
                          Number(paramCurrentValue) ?? param.initialDisplayValue
                        }
                        minValue={0} // TO DO: Currently not derived from the parameter, though they should be.
                        maxValue={1}
                        step={0.01}
                        onValueChange={(newValue?: NumberOrDate) =>
                          newValue != null &&
                          updateParamValue?.(param, newValue.toString())
                        }
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={param.name}>
                      <strong>{param.name}</strong>
                    </div>
                  );
                }
              })}
          </div>
        </div>
      </ExpandablePanel>
    </>
  );
}

//
// TO DO: probably get rid of this?
//
export const updateParamValue = (
  analysisState: AnalysisState,
  updateWdkParamValue: UpdateParamValue,
  param: Parameter
) => {
  return (value: NumberOrDate | string | undefined) => {
    const stringValue = value?.toString() ?? '';
    // TO DO: early return instead of using empty string fallback?

    if (updateWdkParamValue) {
      // translate the uiSettings stored in the analysisState to
      // an object that the updateWdkParamValue can handle.
      const uiSettingsAsRecord: Record<string, string> = Object.entries(
        analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey] ?? {}
      ).reduce((acc, [key, val]) => {
        acc[key] = val?.toString() ?? '';
        return acc;
      }, {} as Record<string, string>);

      // Set the new value (stringValue) in the uiSettings.
      updateWdkParamValue(param, stringValue); // there was a deprecated third arg: `uiSettingsAsRecord`
    }

    // Also update the analysisState with the new parameter value.
    analysisState.setVariableUISettings((currentState) => ({
      ...currentState,
      [uiStateKey]: {
        ...currentState[uiStateKey],
        [param.name]: stringValue,
      },
    }));
  };
};
