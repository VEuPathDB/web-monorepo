import { Info } from '@material-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import {
  Filter,
  useStudyEntities,
  useStudyMetadata,
  useSubsettingClient,
} from '../../../core';

interface Props {
  /** All filters applied to the map, including:
   * - subset
   * - marker config
   * - timeline filters
   * - viewport
   */
  filters?: Filter[];

  filtersIncludingViewport: Filter[];

  /** Entity space of map markers, overlay, etc */
  outputEntityId: string;
  totalEntityCount?: number;
  totalEntityInSubsetCount?: number;
  visibleEntityCount?: number;
}

const { format } = new Intl.NumberFormat('en-us');

export function MapTypeHeaderStudyDetails(props: Props) {
  const {
    filters,
    filtersIncludingViewport,
    outputEntityId,
    visibleEntityCount,
  } = props;
  const { rootEntity } = useStudyMetadata();
  const rootEntityCount = useEntityCount(
    rootEntity.id, // Study entity
    filtersIncludingViewport // Should be subset, map type, timeline, and viewport filters
  );

  const outputEntity = useStudyEntities().find(
    (entity) => entity.id === outputEntityId
  );

  if (
    rootEntityCount.data == null ||
    visibleEntityCount == null ||
    outputEntity == null
  )
    return null;

  const totalCountFormatted = format(visibleEntityCount);
  const totalRootEntityFromatted = format(rootEntityCount.data.count);

  const tooltipContent = (
    <div>
      <p>
        {totalCountFormatted} {outputEntity.displayNamePlural} are currently
        visualized on the map using markers. These are the{' '}
        {outputEntity.displayNamePlural} that
        <ul>
          <li>
            satisfy all your filters (you currently have{' '}
            {filters?.length ?? 'no'} filters active)
          </li>
          <li>to do: also time slider filter</li>
          <li>
            have data for the variable that is currently displayed on the
            markers
          </li>
          <li>
            have appropriate values for if the marker has been custom-configured
          </li>
        </ul>
      </p>
      <p>
        The visualized data comes from {totalRootEntityFromatted}{' '}
        {rootEntity.displayNamePlural} <button>Show list</button>
      </p>
    </div>
  );

  return (
    <div
      css={{
        padding: '1em',
        fontSize: '1.2em',
        display: 'flex',
        gap: '1ex',
        alignItems: 'center',
      }}
    >
      {format(visibleEntityCount)} {outputEntity.displayNamePlural} from{' '}
      {format(rootEntityCount.data.count)} {rootEntity.displayNamePlural}
      <Tooltip title={tooltipContent} interactive style={{ width: 'auto' }}>
        <Info style={{ color: '#069', height: '.8em', width: '.8em' }} />
      </Tooltip>
    </div>
  );
}

function useEntityCount(entityId: string, filters?: Filter[]) {
  const studyMetadata = useStudyMetadata();
  const subsettingClient = useSubsettingClient();
  return useQuery({
    queryKey: ['entityCount', entityId, filters],
    queryFn: async function () {
      return subsettingClient.getEntityCount(
        studyMetadata.id,
        entityId,
        filters ?? []
      );
    },
  });
}
