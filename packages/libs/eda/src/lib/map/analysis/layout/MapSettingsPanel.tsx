import { ReactNode } from 'react';
import { GeoConfig } from '../../../core/types/geoConfig';
import { StudyEntity } from '../../../core/types/study';
import { makeEntityDisplayName } from '../../../core/utils/study-metadata';
import { MarkerType } from '../appState';
import { MapTypePlugin } from '../mapTypes/types';
import { PanelHeader, PanelSection, mapUi, usePrimaryColor } from './ui';

interface Props {
  plugins: MapTypePlugin[];
  activeType: MarkerType;
  onTypeChange: (type: MarkerType) => void;
  geoConfigs: GeoConfig[];
  geoConfig: GeoConfig;
  onGeoEntityChange: (entityId: string) => void;
  /** entities whose data can be shown with the current location entity */
  lineageEntities: StudyEntity[];
  /** the active map type's own settings */
  children: ReactNode;
  onClose: () => void;
}

/**
 * Everything that changes how the markers look, top to bottom in the order
 * people decide it: where markers go, what kind of marker, what they show.
 * It is docked beside the map (not over it) so the effect of each change
 * is visible immediately.
 */
export function MapSettingsPanel({
  plugins,
  activeType,
  onTypeChange,
  geoConfigs,
  geoConfig,
  onGeoEntityChange,
  lineageEntities,
  children,
  onClose,
}: Props) {
  const primary = usePrimaryColor();
  return (
    <aside
      aria-label="Map settings"
      css={{
        width: mapUi.settingsPanelWidth,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: mapUi.panelBackground,
        borderRight: mapUi.border,
        zIndex: 3,
        minHeight: 0,
      }}
    >
      <PanelHeader
        title="Map settings"
        onClose={onClose}
        closeTitle="Hide map settings"
      />
      <div css={{ flex: 1, overflowY: 'auto' }}>
        {geoConfigs.length > 1 && (
          <PanelSection
            title="Place markers by"
            help={
              <>
                This study has locations for more than one kind of record.
                Markers can show data for{' '}
                {lineageEntities
                  .map((entity) => makeEntityDisplayName(entity, true))
                  .join(', ')}
                .
              </>
            }
          >
            <select
              value={geoConfig.entity.id}
              onChange={(event) => onGeoEntityChange(event.target.value)}
              aria-label="Location entity"
              css={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: mapUi.radius,
                border: '1px solid #c4c7c5',
                fontSize: 14,
              }}
            >
              {geoConfigs.map(({ entity }) => (
                <option key={entity.id} value={entity.id}>
                  {makeEntityDisplayName(entity, false)} locations
                </option>
              ))}
            </select>
          </PanelSection>
        )}
        <PanelSection title="Marker style">
          <div
            role="radiogroup"
            aria-label="Marker style"
            css={{ display: 'flex', gap: 8 }}
          >
            {plugins.map(({ type, displayName, Icon }) => {
              const active = type === activeType;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onTypeChange(type)}
                  css={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 4px',
                    borderRadius: mapUi.radius,
                    border: `2px solid ${active ? primary : '#e0e0e0'}`,
                    background: active ? '#f5f9fd' : 'white',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    '&:hover': { borderColor: primary },
                  }}
                >
                  <Icon style={{ height: 28, width: 28 }} />
                  {displayName}
                </button>
              );
            })}
          </div>
        </PanelSection>
        <div
          css={{
            padding: '4px 16px 16px',
            // the marker configuration menus were designed for a wider
            // drawer; keep their controls inside the panel
            '& > div': { maxWidth: '100%' },
          }}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}
