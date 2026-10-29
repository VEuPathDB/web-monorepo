import { useMemo, useState } from 'react';
import { Filter } from '../../core/types/filter';
import { StudyEntity } from '../../core/types/study';
import {
  useEntityCounts,
  useRootEntityCount,
} from '../../core/hooks/entityCounts';
import {
  useGetDefaultVariableDescriptor,
  useStudyEntities,
} from '../../core/hooks/workspace';
import { AnalysisState } from '../../core';
import { VariableLinkConfig } from '../../core/components/VariableLink';
import FilterChipList from '../../core/components/FilterChipList';
import Subsetting from '../../workspace/Subsetting';
import { NotebookCellProps } from '../NotebookCell';
import { SubsetCellDescriptor } from '../Types';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellPreHeader } from '../NotebookCellPreHeader';
import { makeEntityDisplayName } from '../../core/utils/study-metadata';

export function SubsettingNotebookCell(
  props: NotebookCellProps<SubsetCellDescriptor>
) {
  const { analysisState, cell, isDisabled, stepNumber } = props;

  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const varAndEnt = getDefaultVariableDescriptor();

  const [entityId, setEntityId] = useState<string | undefined>(
    varAndEnt.entityId
  );
  const [variableId, setVariableId] = useState<string | undefined>(
    varAndEnt.variableId
  );
  const variableLinkConfig = useMemo((): VariableLinkConfig => {
    return {
      type: 'button',
      onClick(value) {
        if (value) {
          setEntityId(value.entityId);
          setVariableId(value.variableId);
        }
      },
    };
  }, []);

  const entities = useStudyEntities();
  const filters = analysisState.analysis?.descriptor.subset.descriptor;

  // Cheap: only the root entity's count, so the subtitle doesn't have to wait
  // on (or pay for) a count of every entity in the study.
  const totalRootCount = useRootEntityCount();
  const filteredRootCount = useRootEntityCount(filters);

  const [panelState, setPanelState] = useState<'open' | 'closed'>(
    cell.initialPanelState ?? 'open'
  );

  const subTitle = useMemo(() => {
    if (filteredRootCount.pending || totalRootCount.pending)
      return 'Please wait...';
    const rootEntity = entities[0];
    if (
      !rootEntity ||
      filteredRootCount.value == null ||
      totalRootCount.value == null
    )
      return undefined;
    const entityLabel = makeEntityDisplayName(
      rootEntity,
      totalRootCount.value !== 1
    );
    if (filteredRootCount.value === totalRootCount.value)
      return `${totalRootCount.value.toLocaleString()} ${entityLabel}`;
    return `${filteredRootCount.value.toLocaleString()} of ${totalRootCount.value.toLocaleString()} ${entityLabel}`;
  }, [
    entities,
    filteredRootCount.pending,
    filteredRootCount.value,
    totalRootCount.pending,
    totalRootCount.value,
  ]);

  return (
    <>
      <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
      <ExpandablePanel
        title={cell.title}
        subTitle={subTitle ?? ''}
        state={panelState}
        onStateChange={setPanelState}
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          {panelState === 'open' && (
            <SubsettingPanelBody
              analysisState={analysisState}
              entities={entities}
              filters={filters}
              entityId={entityId}
              variableId={variableId}
              variableLinkConfig={variableLinkConfig}
            />
          )}
        </div>
      </ExpandablePanel>
    </>
  );
}

// Only mounted while the panel is expanded. Unlike the subtitle above, the
// subsetting UI lets the user browse to any entity in the tree, so it needs
// the full multi-entity count map - which is the expensive fetch we're
// deferring until it's actually needed.
function SubsettingPanelBody({
  analysisState,
  entities,
  filters,
  entityId,
  variableId,
  variableLinkConfig,
}: {
  analysisState: AnalysisState;
  entities: StudyEntity[];
  filters: Filter[] | undefined;
  entityId: string | undefined;
  variableId: string | undefined;
  variableLinkConfig: VariableLinkConfig;
}) {
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(filters);

  return (
    <>
      <div>
        <FilterChipList
          filters={filters}
          entities={entities}
          selectedEntityId={entityId}
          selectedVariableId={variableId}
          removeFilter={(filter) => {
            analysisState.setFilters((filters) =>
              filters.filter(
                (f) =>
                  f.entityId !== filter.entityId ||
                  f.variableId !== filter.variableId
              )
            );
          }}
          variableLinkConfig={variableLinkConfig}
        />
      </div>
      <Subsetting
        analysisState={analysisState}
        entityId={entityId ?? ''}
        variableId={variableId ?? ''}
        totalCounts={totalCountsResult.value}
        filteredCounts={filteredCountsResult.value}
        variableLinkConfig={variableLinkConfig}
      />
    </>
  );
}
