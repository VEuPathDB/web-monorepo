import FilterChip from './FilterChip';
import { StudyEntity } from '..';
import { makeStyles } from '@material-ui/core/styles';
import {
  Filter,
  LongitudeRangeFilter,
  NumberRangeFilter,
} from '../types/filter';
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
  /**
   * Remove several filters in one action. When provided, paired
   * latitude+longitude filters (as created by the GeoCoordFilter) are
   * shown as a single chip that removes both filters with one click.
   */
  removeFilters?: (filters: Filter[]) => void;
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
    removeFilters,
    selectedEntityId,
    selectedVariableId,
    variableLinkConfig,
  } = props;

  if (filters) {
    // Pair up latitude and longitude filters on the same entity, so they
    // can be displayed as one combined, one-click-dismissable chip.
    // Only do so when a multi-filter removal callback is available;
    // otherwise fall back to one chip per filter.
    const geoPairs =
      removeFilters != null ? findGeoFilterPairs(filters, props.entities) : [];

    return (
      <div className={classes.chips}>
        {filters.map((filter) => {
          const { entity, variable } =
            findEntityAndVariable(props.entities, filter) ?? {};

          if (entity && variable) {
            const pair = geoPairs.find(
              (p) => p.latFilter === filter || p.lngFilter === filter
            );

            if (pair != null) {
              // render the combined chip in place of the latitude filter's
              // chip and skip the longitude filter's chip
              if (pair.lngFilter === filter) return null;

              const { latFilter, lngFilter, latVariable } = pair;
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
                    Latitude from {formatCoord(latFilter.min)} to{' '}
                    {formatCoord(latFilter.max)}, inclusive
                    <br />
                    Longitude from {formatCoord(lngFilter.left)} to{' '}
                    {formatCoord(lngFilter.right)}, inclusive
                    {lngFilter.right < lngFilter.left
                      ? ' (crossing the antimeridian)'
                      : ''}
                  </div>
                </>
              );

              return (
                <FilterChip
                  tooltipText={tooltipText}
                  isActive={
                    entity.id === selectedEntityId &&
                    (latFilter.variableId === selectedVariableId ||
                      lngFilter.variableId === selectedVariableId)
                  }
                  // Remove both geo filters on click of X button
                  onDelete={() => removeFilters?.([latFilter, lngFilter])}
                  key={`filter-chip-geo-${entity.id}`}
                >
                  <VariableLink
                    entityId={entity.id}
                    variableId={latVariable.id}
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

interface GeoFilterPair {
  latFilter: NumberRangeFilter;
  lngFilter: LongitudeRangeFilter;
  latVariable: { id: string };
}

/**
 * Format a latitude/longitude value for display. The filter stores the full
 * precision selected on the map; here we round to 4 decimal places (~11 m,
 * matching the map filter's own display) so the chip tooltip doesn't show a
 * distractingly long string of digits.
 */
function formatCoord(value: number): string {
  return String(Number(value.toFixed(4)));
}

/**
 * Find pairs of filters that together describe a geographic area:
 * a numberRange filter on a latitude variable and a longitudeRange filter
 * on a longitude variable of the same entity.
 */
function findGeoFilterPairs(
  filters: Filter[],
  entities: StudyEntity[]
): GeoFilterPair[] {
  const latFilters = filters.filter((filter): filter is NumberRangeFilter => {
    if (filter.type !== 'numberRange') return false;
    const variable = findEntityAndVariable(entities, filter)?.variable;
    return variable != null && isLatitudeVariable(variable);
  });
  const lngFilters = filters.filter(
    (filter): filter is LongitudeRangeFilter => {
      if (filter.type !== 'longitudeRange') return false;
      const variable = findEntityAndVariable(entities, filter)?.variable;
      return variable != null && isLongitudeVariable(variable);
    }
  );

  return latFilters.flatMap((latFilter) => {
    const lngFilter = lngFilters.find(
      (lngFilter) => lngFilter.entityId === latFilter.entityId
    );
    return lngFilter != null
      ? [{ latFilter, lngFilter, latVariable: { id: latFilter.variableId } }]
      : [];
  });
}
