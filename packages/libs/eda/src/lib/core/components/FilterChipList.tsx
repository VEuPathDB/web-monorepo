import FilterChip from './FilterChip';
import { StudyEntity } from '..';
import { makeStyles } from '@material-ui/core/styles';
import { Filter } from '../types/filter';
import { findEntityAndVariable } from '../utils/study-metadata';
import { formatFilterValue } from '../utils/filter-display';
import { ReactNode } from 'react';
import { VariableLink, VariableLinkConfig } from './VariableLink';
import { colors, Warning } from '@veupathdb/coreui';

// Material UI CSS declarations
const useStyles = makeStyles((theme) => ({
  chips: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    '& > *:not(:last-of-type)': {
      // Spacing between chips
      marginRight: theme.spacing(),
    },
  },
}));

interface Props {
  filters?: Filter[];
  entities: Array<StudyEntity>;
  selectedEntityId?: string;
  selectedVariableId?: string;
  removeFilter: (filter: Filter) => void;
  variableLinkConfig: VariableLinkConfig;
}

/**
 * A list (displayed horizontally) of chips representing filters applied to
 * variables in the current analysis
 */
export default function FilterChipList(props: Props) {
  const classes = useStyles();
  const {
    filters,
    removeFilter,
    selectedEntityId,
    selectedVariableId,
    variableLinkConfig,
  } = props;

  if (filters) {
    return (
      <div className={classes.chips}>
        {filters.map((filter) => {
          const { entity, variable } =
            findEntityAndVariable(props.entities, filter) ?? {};

          if (entity && variable) {
            const filterValueDisplay: ReactNode = formatFilterValue(
              filter,
              props.entities
            );

            const tooltipText = (
              <>
                <div
                  style={{
                    fontSize: '1.05em',
                    fontWeight: 700,
                    marginBottom: '.75em',
                  }}
                >
                  {entity.displayName}: {variable.displayName}
                </div>
                <div>{filterValueDisplay}</div>
              </>
            );

            return (
              <FilterChip
                tooltipText={tooltipText}
                isActive={
                  entity.id === selectedEntityId &&
                  variable.id === selectedVariableId
                }
                // Remove this filter on click of X button
                onDelete={() => removeFilter(filter)}
                key={`filter-chip-${entity.id}-${variable.id}`}
              >
                <VariableLink
                  entityId={entity.id}
                  variableId={variable.id}
                  replace={true}
                  linkConfig={variableLinkConfig}
                >
                  {variable.displayName}
                </VariableLink>
              </FilterChip>
            );
          } else {
            return (
              <FilterChip
                tooltipText="Remove this filter to continue working with your analysis. This filter contains a reference to a variable that does not exist for this study."
                isActive={false}
                onDelete={() => removeFilter(filter)}
                key={`${filter.entityId}/${filter.variableId}`}
              >
                <>
                  <Warning fill={colors.warning[600]} /> Invalid filter
                </>
              </FilterChip>
            );
          }
        })}
      </div>
    );
  } else {
    return <></>;
  }
}
