import { CSSProperties } from 'react';
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

export function ComputeNotebookCell(
  props: NotebookCellComponentProps<'compute'>
) {
  const { analysisState, cell, updateCell, isSubCell, isDisabled } = props;
  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');

  const { computeId, computationAppOverview, subCells } = cell;
  const computation = analysis.descriptor.computations.find(
    (comp) => comp.computationId === computeId
  );
  if (computation == null) throw new Error('Cannot find computation.');

  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );
  const plugin = plugins[computation.descriptor.type];
  if (plugin == null) throw new Error('Computation plugin not found.');

  // We'll use a special changeConfigHandler for the computation configuration
  const changeConfigHandler = (propertyName: string, value?: any) => {
    if (!computation || !analysis.descriptor.computations[0]) return;

    const updatedConfiguration = {
      ...(computation.descriptor.configuration &&
      typeof computation.descriptor.configuration === 'object' // needed to use the spread operator
        ? computation.descriptor.configuration
        : {}),
      [propertyName]: value,
    };

    const existingComputation =
      analysisState.analysis?.descriptor.computations.find(
        (comp) => isEqual(comp.descriptor.configuration, updatedConfiguration) //&&
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
            addNewComputation={(name, configuration) => {}} // also irrelevant for us because we add the computation elsewhere
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
            <div className="subCellTitle">
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
          if (isVisualizationCell(subCellWithTitle)) {
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
