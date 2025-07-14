import { useEntityCounts } from '../core/hooks/entityCounts';
import { useDataClient } from '../core/hooks/workspace';
import { isEqual } from 'lodash';
import { RunComputeButton } from '../core/components/computations/RunComputeButton';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';
import { NotebookCell, NotebookCellProps } from './NotebookCell';
import { plugins } from '../core/components/computations/plugins';
import { ComputeCellDescriptor } from './NotebookPresets';
import { useCachedPromise } from '../core/hooks/cachedPromise';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';

export function ComputeNotebookCell(
  props: NotebookCellProps<ComputeCellDescriptor>
) {
  const { analysisState, cell, isDisabled, wdkState, projectId } = props;
  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');

  const {
    computationName,
    computationId,
    cells,
    getAdditionalCollectionPredicate,
  } = cell;
  const computation = analysis.descriptor.computations.find(
    (comp) => comp.computationId === computationId
  );
  if (computation == null) throw new Error('Cannot find computation.');

  // fetch 'apps'
  const dataClient = useDataClient();
  const fetchApps = async () => {
    let { apps } = await dataClient.getApps();
    return { apps };
  };
  const apps = useCachedPromise(fetchApps, ['fetchApps']);
  const appOverview =
    apps && apps.value?.apps.find((app) => app.name === computationName);

  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );
  const plugin = plugins[computation.descriptor.type];
  if (plugin == null) throw new Error('Computation plugin not found.');

  // TO DO: this looks like it needs to be able to handle multiple computations.
  // Ideally it should also use the functional update form of setComputations.
  //
  // We'll use a special, simple changeConfigHandler for the computation configuration
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
    appOverview?.computeName ?? ''
  );

  const isComputationConfigurationValid = !!plugin?.isConfigurationComplete(
    computation.descriptor.configuration
  );

  // Prep any additional restrictions on collections, if defined
  const additionalCollectionPredicate =
    getAdditionalCollectionPredicate &&
    getAdditionalCollectionPredicate(projectId);

  return computation && appOverview ? (
    <>
      {cell.helperText && (
        <div className="NotebookCellHelpText">
          <span>{cell.helperText}</span>
        </div>
      )}
      <ExpandablePanel
        title={cell.title}
        subTitle={''}
        state="open"
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          <plugin.configurationComponent
            analysisState={analysisState}
            computation={computation}
            totalCounts={totalCountsResult}
            filteredCounts={filteredCountsResult}
            visualizationId="not_used" // irrelevant because we have our own changeConfigHandler
            addNewComputation={() => {}} // also irrelevant for us because we add the computation elsewhere
            computationAppOverview={appOverview}
            geoConfigs={[]}
            changeConfigHandlerOverride={changeConfigHandler}
            showStepNumber={false}
            showExpandableHelp={false} // no expandable sections within an expandable element.
            additionalCollectionPredicate={additionalCollectionPredicate}
          />
          <RunComputeButton
            computationAppOverview={appOverview}
            status={jobStatus}
            isConfigured={isComputationConfigurationValid}
            createJob={createJob}
          />
        </div>
      </ExpandablePanel>
      {cells &&
        cells.map((subCell, index) => {
          const isSubCellDisabled =
            jobStatus !== 'complete' && subCell.type !== 'text';

          return (
            <NotebookCell
              key={index}
              analysisState={analysisState}
              cell={subCell}
              isDisabled={isSubCellDisabled}
              wdkState={wdkState}
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
