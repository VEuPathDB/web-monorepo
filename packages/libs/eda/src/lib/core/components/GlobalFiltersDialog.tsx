import { StudyEntity } from '..';
import { Filter } from '../types/filter';
import FilterChipList from './FilterChipList';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import _ from 'lodash';
import 'react-resizable/css/styles.css';
import './GlobalFiltersDialog.scss';
import { VariableLinkConfig } from './VariableLink';

interface Props {
  // Whether the dialog is open
  open: boolean;
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
  // Determines if we render a link or a button.
  variableLinkConfig: VariableLinkConfig;
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
              variableLinkConfig={props.variableLinkConfig}
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

  return (
    <div
      className="GlobalFiltersDialog_Wrapper"
      style={{ display: props.open ? 'flex' : 'none' }}
    >
      <Draggable handle=".GlobalFiltersDialog_Header" bounds="html">
        {/** If changing width/height, also change .react-draggable.react-resizable top/left offsets
         *  in GlobalFiltersDialog.scss to preserve dialog centering */}
        <ResizableBox width={400} height={300} minConstraints={[200, 200]}>
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
                  <i className="fa fa-close" />
                </button>
              </div>
            </div>
            <div className="GlobalFiltersDialog_Content">{content}</div>
            <div className="GlobalFiltersDialog_Footer">
              {props.filters.length > 0 && (
                <Button
                  className="GlobalFiltersDialog_RemoveAllButton"
                  size="small"
                  onClick={() => props.setFilters([])}
                >
                  Remove all filters
                </Button>
              )}
            </div>
          </div>
        </ResizableBox>
      </Draggable>
    </div>
  );
}
