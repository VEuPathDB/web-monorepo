import { OverlayConfig, StudyEntity } from '../../../core';
import { leastAncestralEntity } from '../../../core/utils/data-element-constraints';
import {
  findEntityAndVariable,
  makeEntityDisplayName,
} from '../../../core/utils/study-metadata';
import { GeoConfig } from '../../../core/types/geoConfig';
import { VariableDescriptor } from '../../../core/types/variable';

interface Props {
  studyEntities: StudyEntity[];
  selectedVariable: VariableDescriptor;
  /** the location entity's geo configuration */
  geoConfig: GeoConfig;
  overlayType: OverlayConfig['overlayType'] | undefined;
}

/**
 * Heading for the summary marker preview, saying which entity's records are
 * being counted. In multi-entity studies this isn't obvious: a categorical
 * preview counts records of the variable's entity, while a continuous preview
 * (like the map markers) counts the lower of the variable's and the location's
 * entities.
 */
export function SummaryMarkerHeading({
  studyEntities,
  selectedVariable,
  geoConfig,
  overlayType,
}: Props) {
  const countedEntity = findCountedEntity(
    studyEntities,
    selectedVariable,
    geoConfig,
    overlayType
  );
  return (
    <div style={{ marginBottom: '0.5em' }}>
      <div style={{ fontWeight: 'bold' }}>
        Summary marker (all filtered data)
      </div>
      {countedEntity && (
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          Counts of {makeEntityDisplayName(countedEntity, true).toLowerCase()}
        </div>
      )}
    </div>
  );
}

function findCountedEntity(
  studyEntities: StudyEntity[],
  selectedVariable: VariableDescriptor,
  geoConfig: GeoConfig,
  overlayType: OverlayConfig['overlayType'] | undefined
): StudyEntity | undefined {
  const overlayEntity = findEntityAndVariable(
    studyEntities,
    selectedVariable
  )?.entity;
  if (overlayEntity == null) return undefined;
  // see CategoricalMarkerPreview (counts come from useCategoricalValues)
  if (overlayType === 'categorical') return overlayEntity;
  // see ContinuousMarkerPreview (counts come from the map marker request)
  return leastAncestralEntity([overlayEntity, geoConfig.entity], studyEntities);
}
