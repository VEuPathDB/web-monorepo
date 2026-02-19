import { ReactNode, useEffect, useMemo } from 'react';
import { StudyEntity } from '../../types/study';
import { VariableDescriptor } from '../../types/variable';
import {
  DataElementConstraintRecord,
  filterConstraints,
  disabledVariablesForInput,
  VariablesByInputName,
} from '../../utils/data-element-constraints';

import VariableTreeDropdown from '../variableSelectors/VariableTreeDropdown';
import { Toggle } from '@veupathdb/coreui';
import {
  findEntityAndVariable,
  makeEntityDisplayName,
} from '../../utils/study-metadata';
import { useInputStyles } from './inputStyles';
import { Tooltip } from '@veupathdb/coreui';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { isEqual } from 'lodash';
// Direct import (not useSnackbar hook) is intentional here: InputVariables is a
// generic component that may render without a SnackbarProvider. The direct import
// fails silently in that case, which is fine — the auto-clear still works. Prefer
// the useSnackbar hook from @veupathdb/coreui in components where a provider is
// guaranteed (e.g. plugin config components).
import { enqueueSnackbar } from 'notistack';
import { red } from '@veupathdb/coreui/lib/definitions/colors';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

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
   * The variable will only be selectable if the constraints are met.
   */
  providedOptionalVariable?: VariableDescriptor;
  /**
   * Can be used to override an input role's default title assigned in sectionInfo
   * when we want the behavior/logic of an existing role but with a different
   * title. Example: 2x2 mosaic's 'axis' variables.
   * Note that the first input (of potentially many) found with this property sets the title.
   * See also `noTitle` - because passing `null` to this doesn't get rid of the element.
   */
  titleOverride?: ReactNode;
  /**
   * To have no title at all. Default false; Same one-to-many issues as titleOverride
   */
  noTitle?: boolean;
  /**
   * apply custom styling to the input container
   */
  styleOverride?: React.CSSProperties;
  /**
   * If an input is pre-populated and cannot be null, set this as true in order to prevent any
   * "required" input logic.
   */
  isNonNullable?: boolean;
  /** If isNonNullable is true, the clear button will not be rendered regardless of a true value */
  showClearSelectionButton?: boolean;
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
   * The complete set of variables we should use when considering
   * constraints on entities. Usually the union of computed and selected vars.
   */
  variablesForConstraints?: VariablesByInputName;
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
  flexDirection?: CSSProperties['flexDirection'];
  /** Fixed width applied to all input labels, so that dropdowns align vertically.
   * Overrides the built-in stratification-variable label width when provided. */
  labelWidth?: CSSProperties['width'];
  /**
   * When true, automatically selects an input when exactly one variable
   * satisfies the constraints (i.e. only one valid choice exists).
   * Auto-selected inputs are rendered as readonly — no dropdown is shown.
   */
  autoSelectWhenPossible?: boolean;
}

export function InputVariables(props: Props) {
  const {
    inputs,
    entities,
    selectedVariables,
    variablesForConstraints,
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
    flexDirection,
    labelWidth,
    autoSelectWhenPossible,
  } = props;
  const classes = useInputStyles(flexDirection);
  const handleChange = (
    inputName: string,
    selectedVariable?: VariableDescriptor
  ) => {
    onChange({ ...selectedVariables, [inputName]: selectedVariable });
  };

  const invalidInputs = inputs.filter((inputSpec) => {
    const variableDescriptor = selectedVariables[inputSpec.name];
    if (variableDescriptor == null) return false;
    const entityAndVariable = findEntityAndVariable(
      entities,
      variableDescriptor
    );
    return (
      entityAndVariable == null ||
      entityAndVariable.variable.type === 'category'
    );
  });

  // Find entities that are excluded for each variable, and union their variables
  // with the disabled variables.
  const disabledVariablesByInputName: Record<string, VariableDescriptor[]> =
    useMemo(
      () =>
        inputs.reduce((map, input) => {
          // ignore invalid inputs
          if (invalidInputs.includes(input)) return map;
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
            variablesForConstraints ?? selectedVariables
          );

          return map;
        }, {} as Record<string, VariableDescriptor[]>),
      [
        inputs,
        invalidInputs,
        constraints,
        selectedVariables,
        entities,
        dataElementDependencyOrder,
        variablesForConstraints,
      ]
    );

  // When autoSelectWhenPossible is enabled, find inputs that have exactly one
  // enabled (non-disabled) variable — these can be auto-selected for the user.
  const singleEnabledVariableByInput = useMemo<
    Record<string, VariableDescriptor | undefined>
  >(() => {
    if (!autoSelectWhenPossible || !entities.length) return {};

    // entities is already a flat array (via entityTreeToArray)
    const allVariables: VariableDescriptor[] = entities.flatMap((entity) =>
      entity.variables
        .filter((v) => v.type !== 'category')
        .map((v) => ({ entityId: entity.id, variableId: v.id }))
    );

    const result: Record<string, VariableDescriptor | undefined> = {};
    for (const input of inputs) {
      if (input.readonlyValue) continue;
      const disabled = disabledVariablesByInputName[input.name];
      if (!disabled) continue;
      const enabled = allVariables.filter(
        (v) =>
          !disabled.some(
            (d) => d.entityId === v.entityId && d.variableId === v.variableId
          )
      );
      result[input.name] = enabled.length === 1 ? enabled[0] : undefined;
    }
    return result;
  }, [autoSelectWhenPossible, entities, inputs, disabledVariablesByInputName]);

  // Auto-clear selected variables that violate constraints.
  // This handles externally-triggered changes (e.g. shared cell changing entity)
  // as well as any other scenario where selections become invalid.
  useEffect(() => {
    const inputsToClear: string[] = [];

    for (const input of inputs) {
      // Skip readonly inputs — managed externally
      if (input.readonlyValue) continue;

      const selected = selectedVariables[input.name];
      if (selected == null) continue;

      const disabled = disabledVariablesByInputName[input.name];
      if (!disabled?.length) continue;

      if (disabled.some((d) => isEqual(d, selected))) {
        inputsToClear.push(input.name);
      }
    }

    if (inputsToClear.length === 0) return;

    const updated = { ...selectedVariables };
    for (const name of inputsToClear) {
      updated[name] = undefined;
    }
    onChange(updated);

    const labels = inputsToClear.map(
      (name) => inputs.find((i) => i.name === name)?.label ?? name
    );
    enqueueSnackbar(
      `Cleared ${labels.join(
        ', '
      )} — no longer compatible with current selections.`,
      { variant: 'info' }
    );
  }, [disabledVariablesByInputName, selectedVariables, inputs, onChange]);

  // Auto-select inputs that have exactly one valid variable when autoSelectWhenPossible is on.
  useEffect(() => {
    if (!autoSelectWhenPossible) return;

    const autoSelections: VariablesByInputName = {};
    for (const input of inputs) {
      if (selectedVariables[input.name] != null) continue; // already chosen
      const sole = singleEnabledVariableByInput[input.name];
      if (sole) autoSelections[input.name] = sole;
    }

    if (Object.keys(autoSelections).length === 0) return;
    onChange({ ...selectedVariables, ...autoSelections });
  }, [
    autoSelectWhenPossible,
    singleEnabledVariableByInput,
    selectedVariables,
    inputs,
    onChange,
  ]);

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
              {!inputs.find(
                (input) => input.role === inputRole && input.noTitle
              ) && (
                <div className={classes.fullRow}>
                  <h4>
                    {inputs.find(
                      (input) => input.role === inputRole && input.titleOverride
                    )?.titleOverride ??
                      sectionInfo[inputRole ?? 'default'].title}
                  </h4>
                </div>
              )}
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
                        !input.isNonNullable &&
                        constraints &&
                        constraints.length &&
                        constraints[0][input.name]?.isRequired
                          ? 'Required parameter'
                          : ''
                      }
                    >
                      <div
                        className={classes.label}
                        style={{
                          ...(labelWidth != null
                            ? { width: labelWidth, flexShrink: 0 }
                            : input.role === 'stratification' &&
                              hasMultipleStratificationValues &&
                              !(
                                input.readonlyValue &&
                                !input.providedOptionalVariable
                              )
                            ? multipleStratificationVariableLabelStyle
                            : undefined),
                          ...(!input.readonlyValue &&
                          !input.isNonNullable &&
                          constraints?.length &&
                          constraints[0][input.name]?.isRequired &&
                          (!selectedVariables[input.name] ||
                            invalidInputs.includes(input))
                            ? requiredInputLabelStyle
                            : undefined),
                        }}
                      >
                        {input.label +
                          (input.readonlyValue &&
                          !input.providedOptionalVariable
                            ? ' (fixed)'
                            : '')}
                        {!input.readonlyValue &&
                        !input.isNonNullable &&
                        constraints &&
                        constraints.length &&
                        constraints[0][input.name]?.isRequired ? (
                          <sup>*</sup>
                        ) : (
                          ''
                        )}
                      </div>
                    </Tooltip>
                    {autoSelectWhenPossible &&
                    singleEnabledVariableByInput[input.name] != null &&
                    selectedVariables[input.name] != null ? (
                      <span style={{ height: '32px', lineHeight: '32px' }}>
                        {findEntityAndVariable(
                          entities,
                          selectedVariables[input.name]
                        )?.variable.displayName ?? ''}
                      </span>
                    ) : input.providedOptionalVariable ? (
                      // render a radio button to choose between provided and nothing
                      // check if provided var is in disabledVariablesByInputName[input.name]
                      // and disable radio input if needed
                      <RadioButtonGroup
                        disabledList={
                          disabledVariablesByInputName[input.name].find(
                            (variable) =>
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
                      />
                    ) : input.readonlyValue ? (
                      <span style={{ height: '32px', lineHeight: '32px' }}>
                        {input.readonlyValue}
                      </span>
                    ) : (
                      <VariableTreeDropdown
                        showClearSelectionButton={
                          input.isNonNullable
                            ? false
                            : input.showClearSelectionButton ?? true
                        }
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
                        entityId={
                          invalidInputs.includes(input)
                            ? undefined
                            : selectedVariables[input.name]?.entityId
                        }
                        variableId={
                          invalidInputs.includes(input)
                            ? undefined
                            : selectedVariables[input.name]?.variableId
                        }
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
      {invalidInputs.length > 0 && (
        <Banner
          banner={{
            type: 'error',
            message: (
              <div>
                The following inputs reference a variable that no longer exists.
                Use the dropdown to choose a new variable.
                {
                  <ul>
                    {invalidInputs.map((inputSpec) => {
                      return (
                        <li>
                          <strong>{inputSpec.label}</strong>
                        </li>
                      );
                    })}
                  </ul>
                }
              </div>
            ),
          }}
        />
      )}
    </div>
  );
}
