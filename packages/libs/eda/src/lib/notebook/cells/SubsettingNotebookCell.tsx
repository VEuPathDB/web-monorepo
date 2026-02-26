import { useMemo, useState } from 'react';
import { useEntityCounts } from '../../core/hooks/entityCounts';
import {
  useGetDefaultVariableDescriptor,
  useStudyEntities,
} from '../../core/hooks/workspace';
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
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );

  const subTitle = useMemo(() => {
    if (filteredCountsResult.pending || totalCountsResult.pending)
      return 'Please wait...';
    const rootEntity = entities[0];
    if (
      !rootEntity ||
      filteredCountsResult.value == null ||
      totalCountsResult.value == null
    )
      return undefined;
    const filteredCount = filteredCountsResult.value[rootEntity.id];
    const totalCount = totalCountsResult.value[rootEntity.id];
    if (filteredCount == null || totalCount == null) return undefined;
    const entityLabel = makeEntityDisplayName(rootEntity, totalCount !== 1);
    if (filteredCount === totalCount)
      return `${totalCount.toLocaleString()} ${entityLabel}`;
    return `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} ${entityLabel}`;
  }, [
    entities,
    filteredCountsResult.pending,
    filteredCountsResult.value,
    totalCountsResult.pending,
    totalCountsResult.value,
  ]);

  return (
    <>
      <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
      <ExpandablePanel
        title={cell.title}
        subTitle={subTitle ?? ''}
        state={cell.initialPanelState ?? 'open'}
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          <div>
            <FilterChipList
              filters={analysisState.analysis?.descriptor.subset.descriptor}
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
        </div>
      </ExpandablePanel>
    </>
  );
}
