import { FilterList } from '@material-ui/icons';
import { Filter, StudyEntity } from '../../../core';
import FilterChipList from '../../../core/components/FilterChipList';
import { VariableLinkConfig } from '../../../core/components/VariableLink';
import { EntityCounts } from '../../../core/hooks/entityCounts';
import { makeEntityDisplayName } from '../../../core/utils/study-metadata';
import { mapUi, TextButton } from './ui';

const { format } = new Intl.NumberFormat();

interface Props {
  filters: Filter[];
  studyEntities: StudyEntity[];
  /** the location entity: its counts summarise the subset */
  geoEntity: StudyEntity;
  totalCounts?: EntityCounts;
  filteredCounts?: EntityCounts;
  /** the filtered count is being (re)fetched */
  countPending: boolean;
  /** what the filtered count includes (see mapCountTooltip) */
  countTooltip: string;
  onRemoveFilter: (filter: Filter) => void;
  /** open the filter sheet, optionally on a particular variable */
  onOpenFilters: (variable?: { entityId: string; variableId: string }) => void;
  selectedVariable?: { entityId?: string; variableId?: string };
}

/**
 * The subset, always visible: how much data is on the map, the filters
 * that produced it (click a chip to edit it, ✕ to remove it) and a button
 * to add more.
 */
export function MapFilterBar({
  filters,
  studyEntities,
  geoEntity,
  totalCounts,
  filteredCounts,
  countPending,
  countTooltip,
  onRemoveFilter,
  onOpenFilters,
  selectedVariable,
}: Props) {
  const total = totalCounts?.[geoEntity.id];
  const filtered = filteredCounts?.[geoEntity.id];
  const entityName = makeEntityDisplayName(geoEntity, (total ?? 0) !== 1);

  const variableLinkConfig: VariableLinkConfig = {
    type: 'button',
    onClick(value) {
      if (value?.entityId && value.variableId)
        onOpenFilters({
          entityId: value.entityId,
          variableId: value.variableId,
        });
      else onOpenFilters();
    },
  };

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '4px 16px',
        minHeight: 40,
        background: '#fafafa',
        borderBottom: mapUi.border,
        flexShrink: 0,
      }}
    >
      <TextButton onClick={() => onOpenFilters()} title="Add or edit filters">
        <span css={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <FilterList style={{ fontSize: 16 }} /> Filters
          {filters.length > 0 ? ` (${filters.length})` : ''}
        </span>
      </TextButton>
      <div css={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
        {filters.length > 0 ? (
          <FilterChipList
            filters={filters}
            removeFilter={onRemoveFilter}
            variableLinkConfig={variableLinkConfig}
            entities={studyEntities}
            selectedEntityId={selectedVariable?.entityId}
            selectedVariableId={selectedVariable?.variableId}
          />
        ) : (
          <span css={{ color: mapUi.muted, fontSize: 13 }}>
            No filters: showing all data
          </span>
        )}
      </div>
      <div
        css={{ fontSize: 13, color: mapUi.muted, whiteSpace: 'nowrap' }}
        title={countTooltip}
      >
        {!countPending && filtered != null && total != null ? (
          <>
            <strong css={{ color: '#222' }}>{format(filtered)}</strong> of{' '}
            {format(total)} {entityName}
          </>
        ) : (
          '…'
        )}
      </div>
    </div>
  );
}
