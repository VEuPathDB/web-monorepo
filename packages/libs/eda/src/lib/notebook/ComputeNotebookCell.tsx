import { Loading } from '@veupathdb/wdk-client/lib/Components';
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
import { useCallback, useEffect, useState } from 'react';
import Dialog from '@veupathdb/wdk-client/lib/Components/Overlays/Dialog';
import { Link } from 'react-router-dom';
import { NotebookCellPreHeader } from './NotebookCellPreHeader';

export function ComputeNotebookCell(
  props: NotebookCellProps<ComputeCellDescriptor>
) {
  const {
    analysisState,
    cell,
    isDisabled,
    wdkState,
    projectId,
    stepNumber,
    stepNumbers,
  } = props;
  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');

  const {
    computationName,
    computationId,
    cells,
    getAdditionalCollectionPredicate,
    hidden = false,
    sharedInputNames,
    sharedInputsCellId,
  } = cell;
  const computation = analysis.descriptor.computations.find(
    (comp) => comp.computationId === computationId
  );
  if (computation == null) throw new Error('Cannot find computation.');

  const hasUnsetSharedInputs =
    sharedInputNames != null &&
    sharedInputNames.some(
      (name) =>
        !(computation.descriptor.configuration as Record<string, unknown>)?.[
          name
        ]
    );

  const sharedInputsStepNumber = sharedInputsCellId
    ? stepNumbers?.get(sharedInputsCellId)
    : undefined;

  const systemState: 'open' | 'closed' = hasUnsetSharedInputs
    ? 'closed'
    : 'open';

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [panelState, setPanelState] = useState<'open' | 'closed'>(systemState);
  const [childrenPanelState, setChildrenPanelState] = useState<
    'open' | 'closed'
  >(systemState);

  useEffect(() => {
    const s: 'open' | 'closed' = hasUnsetSharedInputs ? 'closed' : 'open';
    setPanelState(s);
    setChildrenPanelState(s);
  }, [hasUnsetSharedInputs]);

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

  // Update a computation's configuration property. All logic runs inside the
  // functional update so it always operates on the latest state, avoiding stale
  // closure issues during the WDK param round-trip.
  const { setComputations } = analysisState;
  const changeConfigHandler = useCallback(
    (propertyName: string, value?: any) => {
      setComputations((computations) => {
        const comp = computations.find(
          (c) => c.computationId === computationId
        );
        if (!comp) return computations;

        const currentConfig =
          comp.descriptor.configuration &&
          typeof comp.descriptor.configuration === 'object'
            ? comp.descriptor.configuration
            : {};

        const updatedConfig = { ...currentConfig, [propertyName]: value };

        if (isEqual(currentConfig, updatedConfig)) return computations;

        return computations.map((c) =>
          c.computationId === computationId
            ? {
                ...c,
                descriptor: { ...c.descriptor, configuration: updatedConfig },
              }
            : c
        );
      });
    },
    [setComputations, computationId]
  );

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

  // Run the compute if we're all set to go. Useful when there is a default configuration.
  useEffect(() => {
    if (
      isComputationConfigurationValid &&
      jobStatus === 'no-such-job' &&
      hidden
    ) {
      createJob();
    }
  }, [isComputationConfigurationValid, jobStatus, createJob, hidden]);

  // Show error dialog when hidden compute fails
  useEffect(() => {
    if (hidden && jobStatus === 'failed') {
      setShowErrorDialog(true);
    }
  }, [hidden, jobStatus]);

  return computation && appOverview ? (
    <>
      {/* Error Dialog */}
      <Dialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        aria-labelledby="compute-error-dialog-title"
        title="Computation failed"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '600px',
            padding: '1em',
            alignItems: 'center',
            fontSize: '1.2em',
            height: '130px',
            textAlign: 'center',
            margin: '0.5em 0',
          }}
        >
          <p>
            The background {cell.title + ' ' || ''}computation for has failed.{' '}
            <strong>
              Please <Link to="/contact-us">contact us</Link> for assistance.
            </strong>
          </p>
          <p>After closing this dialog, you may continue with your search.</p>
        </div>
      </Dialog>
      {(() => {
        const sharedPluginProps = {
          analysisState,
          computation,
          totalCounts: totalCountsResult,
          filteredCounts: filteredCountsResult,
          visualizationId: 'not_used', // irrelevant because we have our own changeConfigHandler
          addNewComputation: () => {}, // also irrelevant for us because we add the computation elsewhere
          computationAppOverview: appOverview,
          geoConfigs: [],
          changeConfigHandlerOverride: changeConfigHandler,
          showStepNumber: false,
          showExpandableHelp: false, // no expandable sections within an expandable element.
          additionalCollectionPredicate,
          readonlyInputNames: sharedInputNames,
        };

        if (hidden) {
          return (
            <plugin.configurationComponent
              {...sharedPluginProps}
              hideConfigurationComponent={true}
            />
          );
        }

        return (
          <>
            <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
            {hasUnsetSharedInputs && sharedInputsStepNumber != null && (
              <p className="SharedInputsHint">
                Complete step {sharedInputsStepNumber} to enable this analysis.
              </p>
            )}
            <ExpandablePanel
              title={cell.title}
              subTitle={''}
              state={panelState}
              themeRole="primary"
            >
              <div
                className={
                  'NotebookCellContent' + (isDisabled ? ' disabled' : '')
                }
              >
                <plugin.configurationComponent
                  {...sharedPluginProps}
                  hideConfigurationComponent={false}
                />
                <RunComputeButton
                  computationAppOverview={appOverview}
                  status={jobStatus}
                  isConfigured={isComputationConfigurationValid}
                  createJob={createJob}
                />
              </div>
            </ExpandablePanel>
          </>
        );
      })()}
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
              computeJobStatus={jobStatus}
              stepNumber={stepNumbers?.get(subCell.id)}
              stepNumbers={stepNumbers}
              expandedPanelState={childrenPanelState}
            />
          );
        })}
    </>
  ) : (
    <Loading />
  );
}
