import { useQuery } from '@tanstack/react-query';
import { Filter, useSubsettingClient } from '../../core';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import { PanelConfig } from './appState';
import { useDebouncedCallback } from '../../core/hooks/debouncing';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

interface Props {
  studyId: string;
  /** ID for Studies entity */
  entityId: string;
  /** ID for StudyID variable */
  variableId: string;
  filters?: Filter[];
  panelConfig: PanelConfig;
  updatePanelConfig: (config: PanelConfig) => void;
  hasSelectedMarkers: boolean;
}

export function SubStudies(props: Props) {
  // get tabular data for studies
  const {
    entityId,
    studyId,
    variableId,
    filters = [],
    panelConfig,
    updatePanelConfig,
    hasSelectedMarkers,
  } = props;
  const subsettingClient = useSubsettingClient();
  const permissions = usePermissions();
  const result = useQuery({
    queryKey: ['map', 'studies', entityId, filters],
    queryFn: async () => {
      return await subsettingClient.getTabularData(studyId, entityId, {
        filters,
        outputVariableIds: [variableId],
        reportConfig: {
          headerFormat: 'standard',
        },
      });
    },
  });

  const datasetIdByStudyId = useMemo(() => {
    if (permissions.loading) return {};
    return Object.fromEntries(
      Object.entries(permissions.permissions.perDataset)
        .map(([datasetId, value]) => [value?.studyId, datasetId])
        .filter((entry): entry is [string, string] => entry[0] != null)
    );
  }, [permissions]);

  const updatePosition = useDebouncedCallback(
    (position: PanelConfig['position']) => {
      updatePanelConfig({ ...panelConfig, position });
    },
    250
  );

  const updateDimensions = useDebouncedCallback(
    (dimensions: PanelConfig['dimensions']) => {
      updatePanelConfig({ ...panelConfig, dimensions });
    },
    250
  );

  return (
    <DraggablePanel
      isOpen
      confineToParentContainer
      showPanelTitle
      panelTitle="Studies"
      defaultPosition={panelConfig.position}
      onDragComplete={updatePosition}
      onPanelResize={updateDimensions}
      styleOverrides={{
        zIndex: 4,
        height: panelConfig.dimensions.height,
        width: panelConfig.dimensions.width,
        resize: 'both',
        overflow: 'auto',
      }}
      onPanelDismiss={() =>
        updatePanelConfig({ ...panelConfig, isVisble: false })
      }
    >
      <div
        css={{
          padding: '1em',
        }}
      >
        {result.error ? (
          <Banner
            banner={{
              type: 'error',
              message: String(result.error),
            }}
          />
        ) : result.data == null || result.isFetching ? (
          <Spinner />
        ) : (
          <div>
            <p>
              There {studyCountPhrase(result.data.length - 1)} for the{' '}
              {hasSelectedMarkers ? 'selected' : 'visible'} markers on the map.
            </p>
            <ul>
              {result.data.slice(1).map(([id, display]) => (
                <li>
                  <Link
                    target="_blank"
                    to={{
                      pathname: `/record/dataset/${datasetIdByStudyId[id]}`,
                    }}
                  >
                    {display}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DraggablePanel>
  );
}

function studyCountPhrase(numStudies: number) {
  switch (numStudies) {
    case 0:
      return 'are no studies';
    case 1:
      return 'is 1 study';
    default:
      return `are ${numStudies} studies`;
  }
}
