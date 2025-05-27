import { CSSProperties, useCallback, useEffect, useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { isVisualizationCell, NotebookCellComponentProps } from './Types';
import { isEqual } from 'lodash';
import {
  RunComputeButton,
  StatusIcon,
} from '../core/components/computations/RunComputeButton';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';
import { NotebookCell } from './NotebookCell';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { plugins } from '../core/components/computations/plugins';
import { ComputationPlugin } from '../core/components/computations/Types';

// For disabled subCells
const disabledStyles: CSSProperties = {
  opacity: '0.5',
  pointerEvents: 'none',
};

export function ComputeNotebookCell(
  props: NotebookCellComponentProps<'compute'>
) {
  const { analysisState, cell, updateCell, isSubCell, isDisabled } = props;
  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');
  // Eventually this cell should get the plugin list and use the name
  // from the analysis state computation id to get the plugin and the computationAppOverview
  const { computeId, computationAppOverview, subCells } = cell;
  const computation = analysis.descriptor.computations.find(
    (comp) => comp.computationId === computeId
  );
  if (computation == null) throw new Error('Cannot find computation.');

  const entities = useStudyEntities();
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );
  console.log(computation.descriptor.type);
  const plugin = plugins[computation.descriptor.type];
  if (plugin == null) throw new Error('Computation plugin not found.');

  const changeConfigHandler = (propertyName: string, value?: any) => {
    if (!computation) return;
    if (!analysis.descriptor.computations[0]) return;

    // update the analysis state
    const updatedConfiguration = {
      // @ts-ignore
      ...computation.descriptor.configuration,
      [propertyName]: value,
    };

    const existingComputation =
      analysisState.analysis?.descriptor.computations.find(
        (comp) => isEqual(comp.descriptor.configuration, updatedConfiguration) //&&
        // c.descriptor.type === computation.descriptor.type
      );

    if (existingComputation) return;

    const updatedComputation = {
      ...computation,
      descriptor: {
        ...computation.descriptor,
        configuration: updatedConfiguration,
      },
    };

    analysisState.setComputations([updatedComputation]);
  };

  const { jobStatus, createJob } = useComputeJobStatus(
    analysis,
    computation,
    computationAppOverview?.computeName ?? ''
  );

  const isComputationConfigurationValid = !!plugin?.isConfigurationComplete(
    computation.descriptor.configuration
  );

  return computation ? (
    <>
      <details className={isSubCell ? 'subCell' : ''} open>
        <summary>{cell.title}</summary>
        <div className={isDisabled ? 'disabled' : ''}>
          <plugin.configurationComponent
            analysisState={analysisState}
            computation={computation}
            totalCounts={totalCountsResult}
            filteredCounts={filteredCountsResult}
            visualizationId="1" // irrelevant because we have our own changeConfigHandler
            addNewComputation={(name, configuration) => {}}
            computationAppOverview={computationAppOverview}
            geoConfigs={[]}
            changeConfigHandlerOverride={changeConfigHandler}
          />
          <RunComputeButton
            computationAppOverview={computationAppOverview}
            status={jobStatus}
            isConfigured={isComputationConfigurationValid}
            createJob={createJob}
          />
        </div>
      </details>
      {subCells &&
        subCells.map((subCell) => {
          // Add extra flair for subCell titles
          const subTitle = (
            <div
              style={{
                display: 'inline-flex',
                gap: '0.5em',
                fontWeight: 'bold',
              }}
            >
              <span>{subCell.title}</span>
              <span
                style={{ color: gray[600], fontWeight: 400, marginLeft: '1em' }}
              >
                {cell.title}
              </span>
              {jobStatus && <StatusIcon status={jobStatus} showLabel={false} />}
            </div>
          );
          const subCellWithTitle = {
            ...subCell,
            title: subTitle,
          };
          if (isVisualizationCell(subCell)) {
            // It must be a visualization cell. Not sure why ts doesn't like this.
            //@ts-ignore
            subCellWithTitle.computeJobStatus = jobStatus;
          }
          const isSubCellDisabled =
            jobStatus !== 'complete' && subCell.type !== 'text';
          return (
            <NotebookCell
              analysisState={analysisState}
              cell={subCellWithTitle}
              updateCell={(update) => updateCell(update)}
              isSubCell={true}
              isDisabled={isSubCellDisabled}
            />
          );
        })}
    </>
  ) : (
    <div>
      <p>"Loading"</p>
    </div>
  );
}
