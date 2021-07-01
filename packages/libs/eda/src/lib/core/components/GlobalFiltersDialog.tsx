import { StudyEntity } from '..';
import { Filter } from '../types/filter';
import FilterChipList from './FilterChipList';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { Alert } from '@material-ui/lab';
import _ from 'lodash';
import 'react-resizable/css/styles.css';
import './GlobalFiltersDialog.scss';

interface Props {
  // A function to set whether the dialog is open
  setOpen: (open: boolean) => void;
  // The list of entities over which filters are being applied
  entities: StudyEntity[];
  // The list of filters to display
  filters: Filter[];
  // A function to set the filters
  setFilters: (filters: Filter[]) => void;
  // A function to remove a given filter
  removeFilter: (filter: Filter) => void;
}

/**
 * A dialog that displays filters sorted into bins by entity.
 */
export default function GlobalFiltersDialog(props: Props) {
  let content: JSX.Element;

  if (props.filters.length > 0) {
    // Construct a filter chip list for each entity that has filters applied
    let remainingFilters = props.filters; // The remaining unbinned filters
    let matchingFilters: Filter[] = [];
    let filterChipLists: JSX.Element[] = [];

    for (const entity of props.entities) {
      // Find the filters that belong to this entity
      [matchingFilters, remainingFilters] = _.partition(
        remainingFilters,
        (f) => f.entityId === entity.id
      );

      if (matchingFilters.length > 0)
        filterChipLists.push(
          <div key={`filter-chip-list-${entity.id}`}>
            <h4>{entity.displayName}</h4>
            <FilterChipList
              filters={matchingFilters}
              entities={props.entities}
              removeFilter={props.removeFilter}
            />
          </div>
        );
    }

    content = (
      <div>
        {
          // Any filters left in `remainingFilters` are for an entity not provided.
          // Shouldn't ever happen; would signal a problem.
          remainingFilters.length > 0 && (
            <Alert severity="warning">
              Some applied filters do not have matching entities in this study.
            </Alert>
          )
        }
        {filterChipLists}
      </div>
    );
  } else {
    content = <div>There are no filters applied to the dataset.</div>;
  }

  const initialWidth = 400;
  const initialHeight = 300;

  return (
    <div className="GlobalFiltersDialog_CenterAnchor">
      <div
        className="GlobalFiltersDialog_TopLeftAnchor"
        style={{
          transform: `translate(-${initialWidth / 2}px, -${
            initialHeight / 2
          }px)`,
        }}
      >
        <Draggable handle={'.GlobalFiltersDialog_Header'}>
          <ResizableBox width={initialWidth} height={initialHeight}>
            <div className="GlobalFiltersDialog">
              <div className="GlobalFiltersDialog_Header">
                <div className="GlobalFiltersDialog_Header_Left" />
                <div className="GlobalFiltersDialog_Header_Center">
                  All filters
                </div>
                <div className="GlobalFiltersDialog_Header_Right">
                  <button
                    className="GlobalFiltersDialog_CloseButton"
                    onClick={() => props.setOpen(false)}
                  >
                    <i className="fa fa-close"></i>
                  </button>
                </div>
              </div>
              <div className="GlobalFiltersDialog_Content">{content}</div>
              <div className="GlobalFiltersDialog_Footer">
                {props.filters.length > 0 && (
                  <button
                    className="GlobalFiltersDialog_RemoveAllButton"
                    onClick={() => props.setFilters([])}
                  >
                    Remove all filters
                  </button>
                )}
              </div>
            </div>
          </ResizableBox>
        </Draggable>
      </div>
    </div>
  );
}
