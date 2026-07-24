import React, { useMemo } from 'react';
import { AnalysisState } from '../../hooks/analysis';
import { useGeoConfig } from '../../hooks/geoConfig';
import { useStudyEntities } from '../../hooks/workspace';
import {
  StudyEntity,
  StudyMetadata,
  Variable,
  MultiFilterVariable,
} from '../../types/study';
import {
  isGeoCoordVariable,
  isHistogramVariable,
  isTableVariable,
} from './guards';
import { GeoCoordFilter } from './GeoCoordFilter';
import { HistogramFilter } from './HistogramFilter';
import { MultiFilter } from './MultiFilter';
import { TableFilter } from './TableFilter';
import UnknownFilter from './UnknownFilter';

interface Props {
  studyMetadata: StudyMetadata;
  variable: Variable | MultiFilterVariable;
  entity: StudyEntity;
  analysisState: AnalysisState;
  totalEntityCount: number;
  filteredEntityCount: number;
}

export function FilterContainer(props: Props) {
  const entities = useStudyEntities();
  const geoConfigs = useGeoConfig(entities);

  // If the selected variable is this entity's latitude or longitude variable
  // and the entity is fully geo-enabled (has both coordinate variables plus
  // geo-aggregation variables), show the map-based GeoCoordFilter.
  const geoConfig = useMemo(
    () =>
      isGeoCoordVariable(props.variable)
        ? geoConfigs.find(
            (config) =>
              config.entity.id === props.entity.id &&
              (config.latitudeVariableId === props.variable.id ||
                config.longitudeVariableId === props.variable.id)
          )
        : undefined,
    [geoConfigs, props.entity.id, props.variable]
  );

  return geoConfig != null && narrowProps(isGeoCoordVariable, props) ? (
    <GeoCoordFilter {...props} geoConfig={geoConfig} />
  ) : narrowProps(isHistogramVariable, props) ? (
    <HistogramFilter {...props} />
  ) : narrowProps(isTableVariable, props) ? (
    <TableFilter {...props} />
  ) : narrowProps(MultiFilterVariable.is, props) ? (
    <MultiFilter {...props} />
  ) : (
    <UnknownFilter />
  );
}

interface NarrowedProps<T extends Variable | MultiFilterVariable>
  extends Props {
  variable: T;
}

function narrowProps<T extends Variable | MultiFilterVariable>(
  guard: (variable: Variable | MultiFilterVariable) => variable is T,
  props: Props
): props is NarrowedProps<T> {
  return guard(props.variable);
}
