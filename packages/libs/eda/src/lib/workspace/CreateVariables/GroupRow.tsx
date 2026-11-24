import { Fragment, ReactNode } from 'react';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { FilterDefinedGroup } from '../../core/derivedVariables/types';
import { Filter } from '../../core/types/filter';
import { StudyEntity } from '../../core/types/study';
import { findEntityAndVariable } from '../../core/utils/study-metadata';
import { formatFilterValue } from '../../core/utils/filter-display';

const cx = makeClassNameHelper('CreateVariables');

interface Props {
  group: FilterDefinedGroup;
  index: number;
  groupCount: number;
  entities: StudyEntity[];
  /** The group's final count; undefined while unknown. */
  count: ReactNode;
  onLabelChange: (label: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  /** Opens the group's filter editor. The edit button is disabled without it. */
  onEdit?: () => void;
}

export function GroupRow({
  group,
  index,
  groupCount,
  entities,
  count,
  onLabelChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEdit,
}: Props) {
  const position = index + 1;
  return (
    <li className={cx('-GroupRow')}>
      <span className={cx('-GroupPosition')}>{position}</span>
      <span className={cx('-GroupMove')}>
        <button
          type="button"
          aria-label={`Move group ${position} up`}
          title="Move up"
          disabled={index === 0}
          onClick={onMoveUp}
        >
          ▲
        </button>
        <button
          type="button"
          aria-label={`Move group ${position} down`}
          title="Move down"
          disabled={index === groupCount - 1}
          onClick={onMoveDown}
        >
          ▼
        </button>
      </span>
      <input
        className={cx('-GroupLabel')}
        type="text"
        aria-label={`Group ${position} label`}
        value={group.label}
        onChange={(e) => onLabelChange(e.target.value)}
      />
      <span className={cx('-GroupFilters')}>
        <FilterSummary filters={group.filters} entities={entities} />
      </span>
      <button
        type="button"
        className={cx('-GroupEdit')}
        aria-label={`Edit the filters of group ${position}`}
        title="Edit filters"
        disabled={onEdit == null}
        onClick={onEdit}
      >
        ✎
      </button>
      <span className={cx('-Count')}>{count}</span>
      <button
        type="button"
        className={cx('-GroupRemove')}
        aria-label={`Remove group ${position}`}
        title="Remove group"
        onClick={onRemove}
      >
        ×
      </button>
    </li>
  );
}

/** One line per group, using the same wording as the filter chips. */
function FilterSummary({
  filters,
  entities,
}: {
  filters: Filter[];
  entities: StudyEntity[];
}) {
  if (filters.length === 0)
    return <span className={cx('-Muted')}>No filters yet</span>;
  return (
    <>
      {filters.map((filter, i) => (
        <Fragment key={`${filter.entityId}/${filter.variableId}`}>
          {i > 0 && '; '}
          {describeFilter(filter, entities)}
        </Fragment>
      ))}
    </>
  );
}

function describeFilter(filter: Filter, entities: StudyEntity[]): ReactNode {
  const found = findEntityAndVariable(entities, filter);
  if (found == null) return 'Invalid filter';
  const { variable } = found;
  if (
    filter.type === 'stringPrefixSet' &&
    variable.displayType === 'geoaggregator'
  )
    return 'Geographic area';
  return (
    <>
      {variable.displayName}: {formatFilterValue(filter, entities)}
    </>
  );
}
