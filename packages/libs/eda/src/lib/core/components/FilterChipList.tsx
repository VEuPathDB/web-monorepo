import FilterChip from './FilterChip';
import { SessionState, StudyEntity } from '..';
import { VariableLink } from './VariableLink';
import { makeStyles } from '@material-ui/core/styles';
import { Filter } from '../types/filter';

// Material UI CSS declarations
const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      // Spacing between chips
      margin: theme.spacing(0.5),
    },
  },
}));

interface Props {
  filters?: Filter[];
  entities: Array<StudyEntity>;
  selectedEntityId: string;
  selectedVariableId: string;
  setFilters: (filters: Filter[]) => void;
}

/**
 * A list (displayed horizontally) of chips representing filters applied to
 * variables in the current session
 */
export default function FilterChipList(props: Props) {
  const classes = useStyles();
  const { filters, setFilters, selectedEntityId } = props;

  if (filters) {
    return (
      <div className={classes.root}>
        {filters
          .filter((f) => f.entityId === selectedEntityId)
          .map((filter) => {
            // Get this filter's entity and variable
            const entity = props.entities.find(
              (entity) => entity.id === filter.entityId
            );
            const variable = entity?.variables.find(
              (variable) => variable.id === filter.variableId
            );

            if (entity && variable) {
              // The string to be displayed for the filter's value
              let filterValueDisplay: string;

              // Set filterValueDisplay based on the filter's type
              switch (filter.type) {
                case 'stringSet':
                  filterValueDisplay = filter.stringSet.join(', ');
                  break;
                case 'numberSet':
                  filterValueDisplay = filter.numberSet.join(', ');
                  break;
                case 'dateSet':
                  filterValueDisplay = filter.dateSet.join(', ');
                  break;
                case 'numberRange':
                case 'dateRange':
                  filterValueDisplay = `from ${filter.min} to ${filter.max}`;
                  break;
                default:
                  filterValueDisplay = '';
              }

              return (
                <FilterChip
                  tooltipText={filterValueDisplay}
                  isActive={
                    entity.id === props.selectedEntityId &&
                    variable.id === props.selectedVariableId
                  }
                  // Remove this filter on click of X button
                  onDelete={() =>
                    setFilters(filters.filter((f) => f !== filter))
                  }
                  key={`filter-chip-${entity.id}-${variable.id}`}
                >
                  <VariableLink
                    entityId={entity.id}
                    variableId={variable.id}
                    replace={true}
                  >
                    {variable.displayName}
                  </VariableLink>
                </FilterChip>
              );
            } else {
              return null;
            }
          })}
      </div>
    );
  } else {
    return <></>;
  }
}
