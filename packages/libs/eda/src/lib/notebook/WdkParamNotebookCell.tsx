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
import { useEffect } from 'react';
import { AnalysisState } from '../core';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

const uiStateKey = NOTEBOOK_UI_STATE_KEY;

interface DynamicObject {
  [key: string]: number | string | undefined;
}

export function WdkParamNotebookCell(
  props: NotebookCellProps<WdkParamCellDescriptor>
) {
  const { cell, isDisabled, analysisState } = props;

  const { paramNames, title, wdkParameters, wdkUpdateParamValue } = cell;

  // The following sets the default values for the parameters in the anlaysis state by
  // taking advantage of the initialDisplayValue property already set in the parameter.
  useEffect(() => {
    // Use a DynamicObject here because we won't know parameter names and types ahead of time.
    const uiSettings: DynamicObject = (analysisState.analysis?.descriptor.subset
      .uiSettings[uiStateKey] ?? {}) as DynamicObject;

    // Exit if we already have defined parameters in uiSettings.
    if (Object.keys(uiSettings).length > 0) {
      return;
    }

    // Set initial values for each parameter we care about.
    wdkParameters?.forEach((param) => {
      if (uiSettings[param.name] === undefined) {
        uiSettings[param.name] = param.initialDisplayValue;
      }
    });

    analysisState.setVariableUISettings((currentState) => ({
      ...currentState,
      [uiStateKey]: uiSettings,
    }));
  }, [wdkParameters, analysisState]);

  // userInputParameters are the wdk parameters that the user will
  // fill out in the search. For example, in wgcna the user needs to select a module,
  // but doesn't need to select the hidden param for this search called "dataset".
  const userInputParameters = wdkParameters?.filter((param) =>
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
              userInputParameters.map((param) => {
                const paramCurrentValue =
                  analysisState.analysis?.descriptor.subset.uiSettings[
                    uiStateKey
                  ]?.[param.name];

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
                        value={paramCurrentValue as string}
                        buttonDisplayContent={paramCurrentValue as string}
                        onSelect={updateParamValue(
                          analysisState,
                          wdkUpdateParamValue,
                          param
                        )}
                      />
                    </div>
                  );
                } else if (param.type === 'string' && param.isNumber) {
                  return (
                    <div className="InputGroup">
                      <span>{param.displayName}</span>
                      <NumberInput
                        value={Number(paramCurrentValue) ?? '1'}
                        minValue={0} // Currently not derived from the parameter, though they should be.
                        maxValue={1}
                        step={0.01}
                        onValueChange={updateParamValue(
                          analysisState,
                          wdkUpdateParamValue,
                          param
                        )}
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

export const updateParamValue = (
  analysisState: AnalysisState,
  wdkUpdateParamValue: WdkParamCellDescriptor['wdkUpdateParamValue'],
  param: Parameter
) => {
  return (value: NumberOrDate | string | undefined) => {
    const stringValue = value?.toString() ?? '';

    if (wdkUpdateParamValue) {
      // translate the uiSettings stored in the analysisState to
      // an object that the wdkUpdateParamValue can handle.
      const uiSettingsAsRecord: Record<string, string> = Object.entries(
        analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey] ?? {}
      ).reduce((acc, [key, val]) => {
        acc[key] = val?.toString() ?? '';
        return acc;
      }, {} as Record<string, string>);

      // Set the new value (stringValue) in the uiSettings.
      wdkUpdateParamValue(param, stringValue, uiSettingsAsRecord);
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
