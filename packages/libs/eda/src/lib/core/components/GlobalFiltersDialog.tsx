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
  setOpen: (open: boolean) => void;
  entities: StudyEntity[];
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  removeFilter: (filter: Filter) => void;
}

export default function GlobalFiltersDialog(props: Props) {
  let content: JSX.Element;

  if (props.filters.length > 0) {
    let filters = props.filters;
    let matchingFilters: Filter[] = [];
    let filterChipLists: JSX.Element[] = [];

    for (const entity of props.entities) {
      [matchingFilters, filters] = _.partition(
        filters,
        (f) => f.entityId === entity.id
      );

      if (matchingFilters.length > 0)
        filterChipLists.push(
          <div>
            <h4>{entity.displayName}</h4>
            <FilterChipList
              filters={matchingFilters}
              entities={props.entities}
              removeFilter={props.removeFilter}
              showValues={true}
            />
          </div>
        );
    }

    if (filters.length > 0) {
      filterChipLists.unshift(
        <Alert severity="warning">
          Some applied filters do not have matching entities in this study.
        </Alert>
      );
    }

    content = (
      <div className="GlobalFiltersDialog_Content">{filterChipLists}</div>
    );
  } else {
    content = <div>There are no filters applied to the dataset.</div>;
  }

  return (
    <div className="GlobalFiltersDialog_Anchor">
      {/* <div> */}
      <Draggable handle={'.GlobalFiltersDialog_Header'}>
        <ResizableBox width={400} height={300}>
          <div className="GlobalFiltersDialog">
            <div className="GlobalFiltersDialog_Header">
              <div className="GlobalFiltersDialog_Header_Left" />
              <div className="GlobalFiltersDialog_Header_Center">
                Active filters
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
            {content}
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
      {/* </div> */}
    </div>
  );
}
