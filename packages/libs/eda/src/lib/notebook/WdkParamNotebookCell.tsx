import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { WdkParamCellDescriptor } from './NotebookPresets';
import { SingleSelect } from '@veupathdb/coreui';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';
import { useEffect } from 'react';

const uiStateKey = '@@NOTEBOOK_WDK_PARAMS@@';

interface DynamicObject {
  [key: string]: number | string | undefined;
}

export function WdkParamNotebookCell(
  props: NotebookCellProps<WdkParamCellDescriptor>
) {
  const { cell, isDisabled, analysisState } = props;

  const { paramNames, title, wdkParameters, wdkUpdateParamValue } = cell;

  useEffect(() => {
    const uiSettings: DynamicObject = (analysisState.analysis?.descriptor.subset
      .uiSettings[uiStateKey] ?? {}) as DynamicObject;

    // Exit if we already have defined parameters
    if (Object.keys(uiSettings).length > 0) {
      return;
    }

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
            {wdkParameters &&
              wdkParameters.map((param) => {
                const paramCurrentValue =
                  analysisState.analysis?.descriptor.subset.uiSettings[
                    uiStateKey
                  ]?.[param.name];

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
                        onSelect={(value: string) => {
                          if (wdkUpdateParamValue) {
                            const uiSettingsAsRecord: Record<string, string> =
                              Object.entries(
                                analysisState.analysis?.descriptor.subset
                                  .uiSettings[uiStateKey] ?? {}
                              ).reduce((acc, [key, value]) => {
                                acc[key] = value?.toString() ?? ''; // Convert value to string or use an empty string if undefined
                                return acc;
                              }, {} as Record<string, string>);
                            wdkUpdateParamValue(
                              param,
                              value,
                              uiSettingsAsRecord
                            );
                          }
                          analysisState.setVariableUISettings(
                            (currentState) => ({
                              ...currentState,
                              [uiStateKey]: {
                                ...currentState[uiStateKey],
                                [param.name]: value,
                              },
                            })
                          );
                        }}
                        buttonDisplayContent={'Select an option'}
                      />
                    </div>
                  );
                } else if (param.type === 'string') {
                  // HACK - this is temporary until wgcna correlation cutoff is renamed a "number"
                  return (
                    <div className="InputGroup">
                      <span>{param.displayName}</span>
                      <NumberInput
                        value={Number(paramCurrentValue) ?? '1'}
                        minValue={0}
                        maxValue={1}
                        step={0.01}
                        onValueChange={(newValue?: NumberOrDate) => {
                          newValue &&
                            analysisState.setVariableUISettings(
                              (currentState) => ({
                                ...currentState,
                                [uiStateKey]: {
                                  ...currentState[uiStateKey],
                                  [param.name]: newValue,
                                },
                              })
                            );
                        }}
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
