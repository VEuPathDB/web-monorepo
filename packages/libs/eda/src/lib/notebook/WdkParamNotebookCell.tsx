import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { WdkParamCellDescriptor } from './NotebookPresets';
import { SingleSelect } from '@veupathdb/coreui';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { NumberInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateInputs';
import { NumberOrDate } from '@veupathdb/components/lib/types/general';

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

                  const buttonDisplayContent = selectItems.find(
                    ({ value }) => value === paramCurrentValue
                  )?.display;

                  return (
                    <div className="InputGroup">
                      <span>{param.displayName}</span>
                      <SingleSelect
                        items={selectItems}
                        value={paramCurrentValue}
                        buttonDisplayContent={buttonDisplayContent}
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
                        value={Number(paramCurrentValue)}
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
