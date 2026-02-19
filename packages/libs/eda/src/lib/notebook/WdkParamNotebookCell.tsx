import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { WdkParamCellDescriptor } from './NotebookPresets';
import { NotebookCellPreHeader } from './NotebookCellPreHeader';
import { SingleSelect } from '@veupathdb/coreui';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';

export function WdkParamNotebookCell(
  props: NotebookCellProps<WdkParamCellDescriptor>
) {
  const { cell, isDisabled, wdkState, stepNumber } = props;

  if (!wdkState) return null;

  const { paramNames, title, requiredParamNames } = cell;
  const { parameters, paramValues, updateParamValue } = wdkState;

  // userInputParameters are the wdk parameters that the user will
  // fill out in the search. For example, in wgcna the user needs to select a module,
  // but doesn't need to select the hidden param for this search called "dataset".

  const userInputParameters = parameters.filter((param) =>
    paramNames?.includes(param.name)
  );

  return (
    <>
      <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
      <ExpandablePanel
        title={title}
        subTitle={''}
        state={cell.initialPanelState ?? 'open'}
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          <div className="WdkParamInputs">
            {userInputParameters.map((param) => {
              const paramCurrentValue = paramValues[param.name];
              const isRequired =
                requiredParamNames?.includes(param.name) ?? false;

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

                const buttonDisplayContent = selectItems.find(
                  ({ value }) => value === paramCurrentValue
                )?.display;

                return (
                  <div className="InputGroup" key={param.name}>
                    <span>
                      {param.displayName}
                      {isRequired && <sup>*</sup>}
                    </span>
                    <SingleSelect
                      items={selectItems}
                      value={paramCurrentValue}
                      buttonDisplayContent={buttonDisplayContent}
                      onSelect={(newValue: string) =>
                        updateParamValue(param, newValue)
                      }
                    />
                  </div>
                );
              } else if (param.type === 'string' && param.isNumber) {
                return (
                  <div className="InputGroup" key={param.name}>
                    <span>
                      {param.displayName}
                      {isRequired && <sup>*</sup>}
                    </span>
                    <NumberInput
                      value={Number(paramCurrentValue)}
                      minValue={0} // TO DO: Currently not derived from the parameter, though they should be.
                      maxValue={1}
                      step={0.01}
                      onValueChange={(newValue?: NumberOrDate) =>
                        newValue != null &&
                        updateParamValue(param, newValue.toString())
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
