import { useState } from 'react';
import { ZoomIn } from '@material-ui/icons';
import { Filter, StudyEntity } from '../../../core';
import { GeoConfig } from '../../../core/types/geoConfig';
import { useEntityCounts } from '../../../core/hooks/entityCounts';
import { makeEntityDisplayName } from '../../../core/utils/study-metadata';
import {
  Coordinates,
  IconButton,
  PanelHeader,
  PanelSection,
  TextButton,
  mapUi,
  usePrimaryColor,
} from '../layout/ui';
import { MarkerSummary } from '../mapTypes/types';
import { isPointLike } from '../utils/coordinates';
import { RecordsTable } from './RecordsTable';
import { Bounds } from '@veupathdb/components/lib/map/Types';

const { format } = new Intl.NumberFormat();
const MAX_LISTED_LOCATIONS = 30;

interface Props {
  studyId: string;
  studyEntities: StudyEntity[];
  geoConfig: GeoConfig;
  /** entities related to the location entity, root first */
  lineageEntities: StudyEntity[];
  hasSelection: boolean;
  /** selected markers that are currently drawn */
  selectedMarkers: MarkerSummary[];
  /** filters describing the records listed (selection or visible area) */
  recordFilters: Filter[];
  recordsEntityId: string | undefined;
  onRecordsEntityChange: (entityId: string) => void;
  onClearSelection: () => void;
  onFilterToSelection: () => void;
  onZoomTo: (bounds: Bounds) => void;
  onClose: () => void;
}

/**
 * What is selected on the map, and the records behind it.
 *
 * With nothing selected it lists what is in the current view, so the panel
 * is useful from the first click and the user learns what it is for.
 */
export function SelectionPanel({
  studyId,
  studyEntities,
  geoConfig,
  lineageEntities,
  hasSelection,
  selectedMarkers,
  recordFilters,
  recordsEntityId,
  onRecordsEntityChange,
  onClearSelection,
  onFilterToSelection,
  onZoomTo,
  onClose,
}: Props) {
  const primary = usePrimaryColor();
  const recordCounts = useEntityCounts(recordFilters).value;
  const [showAllLocations, setShowAllLocations] = useState(false);
  const recordsEntity =
    lineageEntities.find(({ id }) => id === recordsEntityId) ??
    geoConfig.entity;
  const listedLocations = showAllLocations
    ? selectedMarkers
    : selectedMarkers.slice(0, MAX_LISTED_LOCATIONS);

  return (
    <aside
      aria-label="Selection"
      css={{
        width: mapUi.selectionPanelWidth,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: mapUi.panelBackground,
        borderLeft: mapUi.border,
        zIndex: 3,
        minHeight: 0,
      }}
    >
      <PanelHeader
        title={hasSelection ? 'Selection' : 'Records in view'}
        onClose={onClose}
        closeTitle="Hide the records panel"
      />
      <div css={{ flex: 1, overflowY: 'auto' }}>
        <PanelSection>
          <div css={{ fontSize: 13, marginBottom: 8 }}>
            {hasSelection ? (
              <>
                {selectedMarkers.length > 0
                  ? `${selectedMarkers.length} selected ${
                      selectedMarkers.length === 1 ? 'marker' : 'markers'
                    } in view. `
                  : 'The selection is not in the current view. '}
                It contains:
              </>
            ) : (
              <span css={{ color: mapUi.muted }}>
                Nothing is selected, so this lists everything in the current map
                view. Click a marker, {'⌘'}/Ctrl-drag a box or use the lasso to
                select.
              </span>
            )}
          </div>
          <ul
            css={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 16px',
              fontSize: 13,
            }}
          >
            {lineageEntities.map((entity) => {
              const count = recordCounts?.[entity.id];
              return (
                <li key={entity.id}>
                  <strong>{count != null ? format(count) : '…'}</strong>{' '}
                  {makeEntityDisplayName(entity, count !== 1)}
                </li>
              );
            })}
          </ul>
          {hasSelection && (
            <div css={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <TextButton
                primary
                onClick={onFilterToSelection}
                title="Add a geographic filter that keeps only the selected locations (editable here and in the Dataset Explorer)"
              >
                Filter to selection
              </TextButton>
              <TextButton onClick={onClearSelection}>
                Clear selection
              </TextButton>
            </div>
          )}
        </PanelSection>

        {selectedMarkers.length > 0 && (
          <PanelSection title="Selected locations">
            <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {listedLocations.map((marker) => (
                <li
                  key={marker.id}
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 0',
                  }}
                >
                  <span css={{ flex: 1 }}>
                    <Coordinates
                      position={marker.position}
                      approximate={!isPointLike(marker.bounds)}
                    />
                  </span>
                  <IconButton
                    title="Zoom to this marker"
                    onClick={() => onZoomTo(marker.bounds)}
                    style={{ padding: 3 }}
                  >
                    <ZoomIn style={{ fontSize: 16 }} />
                  </IconButton>
                </li>
              ))}
            </ul>
            {selectedMarkers.length > listedLocations.length && (
              <button
                type="button"
                onClick={() => setShowAllLocations(true)}
                css={{
                  border: 'none',
                  background: 'none',
                  color: primary,
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                Show all {selectedMarkers.length}
              </button>
            )}
          </PanelSection>
        )}

        <PanelSection title="Records">
          <div
            role="tablist"
            aria-label="Record type"
            css={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}
          >
            {lineageEntities.map((entity) => {
              const active = entity.id === recordsEntity.id;
              return (
                <button
                  key={entity.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onRecordsEntityChange(entity.id)}
                  css={{
                    border: `1px solid ${active ? primary : '#d0d0d0'}`,
                    background: active ? primary : 'white',
                    color: active ? 'white' : 'inherit',
                    borderRadius: 14,
                    padding: '2px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {makeEntityDisplayName(entity, true)}
                </button>
              );
            })}
          </div>
          <RecordsTable
            studyId={studyId}
            entity={recordsEntity}
            studyEntities={studyEntities}
            filters={recordFilters}
            recordCount={recordCounts?.[recordsEntity.id]}
            geoConfig={geoConfig}
          />
        </PanelSection>
      </div>
    </aside>
  );
}
