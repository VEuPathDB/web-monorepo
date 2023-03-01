import { ReactNode, useMemo } from 'react';
import { StudyEntity } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import {
  DataElementConstraintRecord,
  filterConstraints,
  disabledVariablesForInput,
  VariablesByInputName,
} from '../../utils/data-element-constraints';

import VariableTreeDropdown from '../variableTrees/VariableTreeDropdown';
import { Toggle } from '@veupathdb/coreui';
import { makeEntityDisplayName } from '../../utils/study-metadata';
import { useInputStyles } from './inputStyles';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { isEqual } from 'lodash';
import { red } from '@veupathdb/coreui/dist/definitions/colors';

export interface InputSpec {
  name: string;
  label: string;
  /** Provide a string here to indicate that the input is readonly.
   * The string will be displayed instead of a variable selector.
   */
  readonlyValue?: string;
  role?: 'axis' | 'stratification';
  /**
   * Instead of just providing a string, as above, provide a variable that the
   * user will be able to choose with a radio button group (the other option is "no variable").
   *
   * However, you should additionaly use the `readonlyValue` prop as a label to display
   * when the provided variable is null.
   *
   * The variable will only be selected/selectable if the constraints are met.
   * (Meaning that if you pass a new provided variable that isn't compatible, the radio button
   * will switch to "no variable")
   */
  providedOptionalVariable?: VariableDescriptor;
  /**
   * Can be used to override an input role's default title assigned in sectionInfo
   * when we want the behavior/logic of an existing role but with a different
   * title. Example: 2x2 mosaic's 'axis' variables.
   */
  titleOverride?: ReactNode;
  styleOverride?: React.CSSProperties;
}

interface SectionSpec {
  order: number;
  title: ReactNode;
}

// order is used to sort the inputGroups
// (customInput ordering will use the same coordinate system, so you can slot
// one in where you need it)
const sectionInfo: Record<string, SectionSpec> = {
  default: {
    order: 0,
    title: 'Variables',
  },
  axis: {
    order: 50,
    title: 'Axis variables',
  },
  stratification: {
    order: 100,
    title: 'Stratification variables',
  },
};

export const requiredInputLabelStyle = {
  color: red[600],
};

// ensures labels are stacked nicely based on the width of the longer string, "Overlay"
const multipleStratificationVariableLabelStyle = {
  width: '45px',
};

interface CustomSectionSpec extends SectionSpec {
  content: ReactNode;
}

export interface Props {
  /**
   * This defines the order the variables appear, and the names associated with
   * their selectedVariable. If the name properties exist in `constraints`, the
   * associated constraint will be applied.
   */
  inputs: InputSpec[];
  /**
   * If you need additional controls or sections in the input variable area
     you can add them here.
   */
  customSections?: CustomSectionSpec[];
  /**
   * Study entities used to look up entity and variable details.
   */
  entities: StudyEntity[];
  /**
   * Current set of selectedVariables for `inputs`.
   * In other words, the currently selected variables.
   */
  selectedVariables: VariablesByInputName;
  /**
   * Change handler that is called when any input value is changed.
   */
  onChange: (selectedVariables: VariablesByInputName) => void;
  /**
   * Constraints to apply to `inputs`
   */
  constraints?: DataElementConstraintRecord[];
  /**
   * Order in which to apply entity-specific relationships between inputs.
   * The entity of a given element in the array must be of the same entity, or
   * lower in the tree, of the element to its right.
   */
  dataElementDependencyOrder?: string[][];
  /**
   * An array of VariableDescriptors for the user's "My Variables"
   */
  starredVariables: VariableDescriptor[];
  /**
   * A callback for toggling the starred state of a variable
   */
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  /** When false, disable (gray out) the showMissingness toggle */
  enableShowMissingnessToggle?: boolean;
  /** controlled state of stratification variables' showMissingness toggle switch (optional) */
  showMissingness?: boolean;
  /** handler for showMissingness state change */
  onShowMissingnessChange?: (newState: boolean) => void;
  /** output entity, required for toggle switch label */
  outputEntity?: StudyEntity;
}

export function InputVariables(props: Props) {
  const {
    inputs,
    entities,
    selectedVariables,
    onChange,
    constraints,
    dataElementDependencyOrder,
    starredVariables,
    toggleStarredVariable,
    enableShowMissingnessToggle = false,
    showMissingness = false,
    onShowMissingnessChange,
    outputEntity,
    customSections,
  } = props;
  const classes = useInputStyles();
  const handleChange = (
    inputName: string,
    selectedVariable?: VariableDescriptor
  ) => {
    onChange({ ...selectedVariables, [inputName]: selectedVariable });
  };

  // Find entities that are excluded for each variable, and union their variables
  // with the disabled variables.
  const disabledVariablesByInputName: Record<
    string,
    VariableDescriptor[]
  > = useMemo(
    () =>
      inputs.reduce((map, input) => {
        // For each input (ex. xAxisVariable), determine its constraints based on which patterns any other selected variables match.
        const filteredConstraints =
          constraints &&
          filterConstraints(
            selectedVariables,
            entities,
            constraints,
            input.name
          );

        map[input.name] = disabledVariablesForInput(
          input.name,
          entities,
          filteredConstraints,
          dataElementDependencyOrder,
          selectedVariables
        );

        return map;
      }, {} as Record<string, VariableDescriptor[]>),
    [
      dataElementDependencyOrder,
      entities,
      constraints,
      inputs,
      selectedVariables,
    ]
  );

  const hasMultipleStratificationValues =
    inputs.filter((input) => input.role === 'stratification').length > 1;

  return (
    <div className={classes.inputs}>
      {[undefined, 'axis', 'stratification'].map(
        (inputRole) =>
          inputs.filter((input) => input.role === inputRole).length > 0 && (
            <div
              key={String(inputRole)}
              className={classes.inputGroup}
              style={{ order: sectionInfo[inputRole ?? 'default'].order }}
            >
              <div className={classes.fullRow}>
                <h4>
                  {inputs.find((input) => input.titleOverride)?.titleOverride ??
                    sectionInfo[inputRole ?? 'default'].title}
                </h4>
              </div>
              {inputs
                .filter((input) => input.role === inputRole)
                .map((input) => (
                  <div
                    key={input.name}
                    className={classes.input}
                    style={input.readonlyValue ? {} : input.styleOverride}
                  >
                    <Tooltip
                      title={
                        !input.readonlyValue &&
                        constraints &&
                        constraints.length &&
                        constraints[0][input.name]?.isRequired
                          ? 'Required parameter'
                          : ''
                      }
                    >
                      <div
                        className={classes.label}
                        style={
                          !input.readonlyValue &&
                          constraints &&
                          constraints.length &&
                          constraints[0][input.name]?.isRequired &&
                          !selectedVariables[input.name]
                            ? requiredInputLabelStyle
                            : input.role === 'stratification' &&
                              hasMultipleStratificationValues
                            ? multipleStratificationVariableLabelStyle
                            : undefined
                        }
                      >
                        {input.label +
                          (input.readonlyValue &&
                          !input.providedOptionalVariable
                            ? ' (fixed)'
                            : '')}
                        {!input.readonlyValue &&
                        constraints &&
                        constraints.length &&
                        constraints[0][input.name]?.isRequired ? (
                          <sup>*</sup>
                        ) : (
                          ''
                        )}
                      </div>
                    </Tooltip>
                    {input.providedOptionalVariable ? (
                      // render a radio button to choose between provided and nothing
                      // check if provided var is in disabledVariablesByInputName[input.name]
                      // and disable radio input if needed
                      <RadioButtonGroup
                        disabledList={
                          disabledVariablesByInputName[
                            input.name
                          ].find((variable) =>
                            isEqual(variable, input.providedOptionalVariable)
                          )
                            ? ['provided']
                            : []
                        }
                        options={['none', 'provided']}
                        optionLabels={[
                          'None',
                          input.readonlyValue ?? 'Provided',
                        ]}
                        selectedOption={
                          selectedVariables[input.name] ? 'provided' : 'none'
                        }
                        onOptionSelected={(selection) =>
                          handleChange(
                            input.name,
                            selection === 'none'
                              ? undefined
                              : input.providedOptionalVariable
                          )
                        }
                        //                        onSelectedOptionDisabled={(_) => {
                        //                          handleChange(input.name, undefined);
                        //                          enqueueSnackbar(
                        //                            `The newly chosen ${input.label} variable has been disabled because is not compatible with this visualization as currently configured.`,
                        //                            { preventDuplicate: true } // nasty hack to workaround double calls to this callback which I tried for more than an hour to fix (and when I did fix it, the radio button was not switched to "none"...)
                        //                          );
                        //                        }}
                      />
                    ) : input.readonlyValue ? (
                      <span style={{ height: '32px', lineHeight: '32px' }}>
                        {input.readonlyValue}
                      </span>
                    ) : (
                      <VariableTreeDropdown
                        scope="variableTree"
                        showMultiFilterDescendants
                        disabledVariables={
                          disabledVariablesByInputName[input.name]
                        }
                        customDisabledVariableMessage={
                          (constraints &&
                            constraints.length &&
                            constraints[0][input.name]?.description) ||
                          undefined
                        }
                        starredVariables={starredVariables}
                        toggleStarredVariable={toggleStarredVariable}
                        entityId={selectedVariables[input.name]?.entityId}
                        variableId={selectedVariables[input.name]?.variableId}
                        variableLinkConfig={{
                          type: 'button',
                          onClick: (variable) =>
                            handleChange(
                              input.name,
                              variable as VariableDescriptor
                            ),
                        }}
                      />
                    )}
                  </div>
                ))}
              {
                // slightly hacky add-on for the stratification section
                // it could possibly be done using a custom section?
                inputRole === 'stratification' && onShowMissingnessChange && (
                  <div className={classes.showMissingness}>
                    <Toggle
                      label={`Include ${
                        outputEntity
                          ? makeEntityDisplayName(outputEntity, true)
                          : 'points'
                      } with no data for selected stratification variable(s)`}
                      value={showMissingness ?? false}
                      onChange={onShowMissingnessChange}
                      disabled={!enableShowMissingnessToggle}
                      labelPosition="right"
                      themeRole="primary"
                    />
                  </div>
                )
              }
            </div>
          )
      )}
      {customSections?.map(({ order, title, content }) => (
        <div key={order} className={classes.inputGroup} style={{ order }}>
          <div className={classes.fullRow}>
            <h4>{title}</h4>
          </div>
          {content}
        </div>
      ))}
    </div>
  );
}
