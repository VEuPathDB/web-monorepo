import { useCallback, useMemo } from 'react';
import { useStudyMetadata } from '../core';
import { entityTreeToArray } from '../core/utils/study-metadata';
import { InputVariables } from '../core/components/visualizations/InputVariables';
import { useToggleStarredVariable } from '../core/hooks/starredVariables';
import { NotebookCellProps } from './NotebookCell';
import { SharedComputeInputsCellDescriptor } from './Types';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellPreHeader } from './NotebookCellPreHeader';
import { H6 } from '@veupathdb/coreui';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { isEqual } from 'lodash';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

export function SharedComputeInputsNotebookCell(
  props: NotebookCellProps<SharedComputeInputsCellDescriptor>
) {
  const { analysisState, cell, isDisabled, stepNumber } = props;
  const { analysis, setComputations } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');

  const {
    computationIds,
    inputNames,
    inputs,
    constraints,
    dataElementDependencyOrder,
  } = cell;

  const studyMetadata = useStudyMetadata();
  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const entities = useMemo(
    () =>
      studyMetadata?.rootEntity
        ? entityTreeToArray(studyMetadata.rootEntity)
        : [],
    [studyMetadata]
  );

  // Read current values from the first computation's config
  const firstComputation = analysis.descriptor.computations.find(
    (c) => c.computationId === computationIds[0]
  );
  const config =
    firstComputation?.descriptor.configuration &&
    typeof firstComputation.descriptor.configuration === 'object'
      ? (firstComputation.descriptor.configuration as Record<string, any>)
      : {};

  const selectedVariables = useMemo(() => {
    const vars: Record<string, any> = {};
    for (const name of inputNames) {
      vars[name] = config[name];
    }
    return vars;
  }, [inputNames, config]);

  // Write changes to all listed computations
  const onChange = useCallback(
    (vars: Record<string, any>) => {
      setComputations((computations) => {
        // Determine which input names actually changed
        const changedNames = inputNames.filter((name) => {
          const comp = computations.find(
            (c) => c.computationId === computationIds[0]
          );
          const currentConfig =
            comp?.descriptor.configuration &&
            typeof comp.descriptor.configuration === 'object'
              ? (comp.descriptor.configuration as Record<string, any>)
              : {};
          return !isEqual(vars[name], currentConfig[name]);
        });

        if (changedNames.length === 0) return computations;

        return computations.map((c) => {
          if (!computationIds.includes(c.computationId)) return c;

          const currentConfig =
            c.descriptor.configuration &&
            typeof c.descriptor.configuration === 'object'
              ? (c.descriptor.configuration as Record<string, any>)
              : {};

          const updatedConfig = { ...currentConfig };
          for (const name of changedNames) {
            updatedConfig[name] = vars[name];
          }

          return {
            ...c,
            descriptor: { ...c.descriptor, configuration: updatedConfig },
          };
        });
      });
    },
    [setComputations, computationIds, inputNames]
  );

  return (
    <>
      <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
      <ExpandablePanel
        title={cell.title}
        subTitle={''}
        state={cell.initialPanelState ?? 'open'}
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          <div className={cx()}>
            <div className={cx('-DiffExpressionOuterConfigContainer')}>
              <H6>Input Data</H6>
              <InputVariables
                inputs={inputs}
                entities={entities}
                selectedVariables={selectedVariables}
                onChange={onChange}
                constraints={constraints}
                dataElementDependencyOrder={dataElementDependencyOrder}
                starredVariables={analysis.descriptor.starredVariables ?? []}
                toggleStarredVariable={toggleStarredVariable}
                labelWidth="9em"
              />
            </div>
          </div>
        </div>
      </ExpandablePanel>
    </>
  );
}
