import FilterChip from './FilterChip';
import { StudyEntity } from '..';
import { makeStyles } from '@material-ui/core/styles';
import { Filter } from '../types/filter';
import { findEntityAndVariable } from '../utils/study-metadata';
import { formatFilterValue } from '../utils/filter-display';
import { ReactNode } from 'react';
import { VariableLink, VariableLinkConfig } from './VariableLink';
import { colors, Warning } from '@veupathdb/coreui';
import { isLatitudeVariable, isLongitudeVariable } from './filter/guards';

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
            // A stringPrefixSet filter on a geoaggregator variable is the
            // GeoCoordFilter's lasso selection: show it as a single
            // "Geographic area" chip linking to the latitude variable
            // (which is where the map filter lives in the variable tree).
            if (
              filter.type === 'stringPrefixSet' &&
              variable.displayType === 'geoaggregator'
            ) {
              const latitudeVariable =
                entity.variables.find(isLatitudeVariable);
              const longitudeVariable =
                entity.variables.find(isLongitudeVariable);
              const tooltipText = (
                <>
                  <div
                    style={{
                      fontSize: '1.05em',
                      fontWeight: 700,
                      marginBottom: '.75em',
                    }}
                  >
                    {entity.displayName}: Geographic area
                  </div>
                  <div>
                    Lasso selection covering {filter.prefixSet.length} geohash{' '}
                    {filter.prefixSet.length === 1 ? 'prefix' : 'prefixes'}
                  </div>
                </>
              );
              return (
                <FilterChip
                  tooltipText={tooltipText}
                  isActive={
                    entity.id === selectedEntityId &&
                    (variable.id === selectedVariableId ||
                      latitudeVariable?.id === selectedVariableId ||
                      longitudeVariable?.id === selectedVariableId)
                  }
                  onDelete={() => removeFilter(filter)}
                  key={`filter-chip-geo-${entity.id}`}
                >
                  <VariableLink
                    entityId={entity.id}
                    variableId={latitudeVariable?.id ?? variable.id}
                    replace={true}
                    linkConfig={variableLinkConfig}
                  >
                    Geographic area
                  </VariableLink>
                </FilterChip>
              );
            }

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
