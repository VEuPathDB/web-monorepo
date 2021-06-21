import { StudyEntity } from '..';
import { Filter } from '../types/filter';
import Draggable from 'react-draggable';
import FilterChipList from './FilterChipList';

interface Props {
  open: boolean;
  entities: StudyEntity[];
  filters?: Filter[];
  setFilters: (filters: Filter[]) => void;
  removeFilter: (filter: Filter) => void;
}

export default function GlobalFiltersDialog(props: Props) {
  if (!props.open) return <></>;

  let content: JSX.Element;

  if (props.filters && props.filters.length > 0) {
    const sortedFilters = props.filters.reduce(
      (newObj: { [index: string]: Filter[] }, filter) => {
        if (!newObj.hasOwnProperty(filter.entityId))
          newObj[filter.entityId] = [];
        newObj[filter.entityId].push(filter);
        return newObj;
      },
      {}
    );

    let filterChipLists: JSX.Element[] = [];

    for (const [entityId, filters] of Object.entries(sortedFilters)) {
      const entityDisplayText =
        props.entities.find((entity) => entity.id === entityId)?.displayName ||
        entityId;

      filterChipLists.push(
        <div>
          <h4>{entityDisplayText}</h4>
          <FilterChipList
            filters={filters}
            entities={props.entities}
            removeFilter={props.removeFilter}
          />
        </div>
      );
    }

    content = <div>{filterChipLists}</div>;
  } else {
    content = <div>There are no filters applied to the dataset.</div>;
  }

  return (
    <Draggable>
      <div
        style={{
          width: 400,
          height: 300,
          position: 'fixed',
          top: '50vh',
          left: '50vw',
          zIndex: 100,
          backgroundColor: 'white',
          boxShadow: '0 0 20px rgba(0,0,0,.4)',
          padding: '10px',
        }}
      >
        {content}
      </div>
    </Draggable>
  );
}
