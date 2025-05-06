import { useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { VariableLinkConfig } from '../core/components/VariableLink';
import FilterChipList from '../core/components/FilterChipList';
import Subsetting from '../workspace/Subsetting';

export function SubsettingNotebookCell(
  props: NotebookCellComponentProps<'subset'>
) {
  const { analysisState, cell, updateCell, isSubCell } = props;
  const { selectedVariable } = cell;
  const entities = useStudyEntities();
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );
  const variableLinkConfig = useMemo(
    (): VariableLinkConfig => ({
      type: 'button',
      onClick: (selectedVariable) => {
        console.log(selectedVariable);
        updateCell({ selectedVariable });
      },
    }),
    [updateCell]
  );
  return (
    <details className={isSubCell ? 'subCell' : ''} open>
      <summary>{cell.title}</summary>
      <div>
        <FilterChipList
          filters={analysisState.analysis?.descriptor.subset.descriptor}
          entities={entities}
          selectedEntityId={selectedVariable?.entityId}
          selectedVariableId={selectedVariable?.variableId}
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
        entityId={selectedVariable?.entityId ?? ''}
        variableId={selectedVariable?.variableId ?? ''}
        totalCounts={totalCountsResult.value}
        filteredCounts={filteredCountsResult.value}
        variableLinkConfig={variableLinkConfig}
      />
    </details>
  );
}
