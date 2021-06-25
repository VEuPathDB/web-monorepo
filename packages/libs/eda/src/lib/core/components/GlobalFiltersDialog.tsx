import { StudyEntity } from '..';
import { Filter } from '../types/filter';
import Draggable from 'react-draggable';
import FilterChipList from './FilterChipList';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  entities: StudyEntity[];
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  removeFilter: (filter: Filter) => void;
}

export default function GlobalFiltersDialog(props: Props) {
  if (!props.open) return <></>;

  let content: JSX.Element;

  if (props.filters.length > 0) {
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
            showValues={true}
          />
        </div>
      );
    }

    content = (
      <div
        style={{
          padding: '10px',
          overflow: 'auto',
          // height: '238px',
          // flexGrow: 1,
          flex: '1 1 auto',
        }}
      >
        {filterChipLists}
      </div>
    );
  } else {
    content = <div>There are no filters applied to the dataset.</div>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        width: 0,
        height: 0,
        top: '50vh',
        left: '50vw',
        zIndex: 100,
        // display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center',
      }}
    >
      <Draggable handle={'.global_filter_box_title'}>
        <ResizableBox width={400} height={300}>
          {/* <div style={{backgroundColor: 'grey'}}>
            I'm resizable!
          </div> */}
          <div
            style={{
              // width: 400,
              // height: 300,
              position: 'absolute',
              // minWidth: '300px',
              // position: 'fixed',
              // top: '50vh',
              // left: '50vw',
              // zIndex: 100,
              backgroundColor: 'white',
              boxShadow: '0 0 20px rgba(0,0,0,.4)',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              className="global_filter_box_title"
              style={{
                backgroundColor: '#eee',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                fontSize: '1.2em',
                fontWeight: 700,
                padding: '.6em .8em',
                cursor: 'move',
                // height: '42px',
                flex: '0 1 42px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  flex: 1,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flex: 5,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  marginRight: 'auto',
                }}
              >
                Active filters
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  flex: 1,
                }}
              >
                <button
                  onClick={() => props.setOpen(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                  }}
                >
                  <i className="fa fa-close"></i>
                </button>
              </div>
            </div>
            {content}
            <div
              style={{
                // position: 'absolute',
                // bottom: 0,
                // height: '20px',
                width: '100%',
                backgroundColor: '#eee',
                textAlign: 'center',
                flex: '0 1 20px',
              }}
            >
              {props.filters.length > 0 && (
                <button
                  onClick={() => props.setFilters([])}
                  style={{ border: 'none', background: 'none' }}
                >
                  Remove all filters
                </button>
              )}
            </div>
          </div>
        </ResizableBox>
      </Draggable>
    </div>
  );
}
