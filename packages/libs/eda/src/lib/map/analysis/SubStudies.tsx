import { useQuery } from '@tanstack/react-query';
import { Filter, useSubsettingClient } from '../../core';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import { PanelConfig } from './appState';
import { useDebouncedCallback } from '../../core/hooks/debouncing';

interface Props {
  studyId: string;
  entityId: string;
  filters?: Filter[];
  panelConfig: PanelConfig;
  updatePanelConfig: (config: PanelConfig) => void;
}

export function SubStudies(props: Props) {
  // get tabular data for studies
  const {
    entityId,
    filters = [],
    studyId,
    panelConfig,
    updatePanelConfig,
  } = props;
  const subsettingClient = useSubsettingClient();
  const permissions = usePermissions();
  const result = useQuery({
    queryKey: ['map', 'studies', entityId, filters],
    queryFn: async () => {
      return await subsettingClient.getTabularData(studyId, entityId, {
        filters,
        outputVariableIds: ['OBI_0001622'],
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

  if (result.data == null) {
    return <>Loading...</>;
  }
  return (
    <DraggablePanel
      isOpen
      confineToParentContainer
      showPanelTitle
      panelTitle="Visible studies"
      defaultPosition={panelConfig.position}
      onDragComplete={updatePosition}
      onPanelResize={updateDimensions}
      styleOverrides={{
        zIndex: 10,
        height: panelConfig.dimensions.height,
        width: panelConfig.dimensions.width,
        resize: 'both',
        overflow: 'hidden',
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
        <div>
          <p>There are {result.data.length - 1} studies visible on the map.</p>
          <ul>
            {result.data.slice(1).map(([id, display]) => (
              <li>
                <Link
                  target="_blank"
                  to={{ pathname: `/record/dataset/${datasetIdByStudyId[id]}` }}
                >
                  {display}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DraggablePanel>
  );
}
