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
  subsetFilterLength: number | undefined;
  includesTimeSliderFilter: boolean;
  /** All filters applied to the map, including:
   * - subset
   * - marker config
   * - timeline filters
   * - viewport
   */
  filterForVisibleData: Filter[];
  /** Entity space of map markers, overlay, etc */
  outputEntityId: string;
  totalEntityCount?: number;
  totalEntityInSubsetCount?: number;
  visibleEntityCount?: number;
  /**
   * If omitted, do not show studies link
   */
  onShowStudies?: (showStudies: boolean) => void;
}

const { format } = new Intl.NumberFormat('en-us');

export function MapTypeHeaderStudyDetails(props: Props) {
  const {
    subsetFilterLength,
    filterForVisibleData,
    includesTimeSliderFilter,
    outputEntityId,
    visibleEntityCount,
    onShowStudies,
  } = props;
  const { rootEntity } = useStudyMetadata();
  const rootEntityCount = useEntityCount(
    rootEntity.id, // Study entity
    filterForVisibleData // Should be subset, map type, timeline, and viewport filters
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
  const totalRootEntityFormatted = format(rootEntityCount.data.count);

  const tooltipContent = (
    <div>
      <p>
        {totalCountFormatted} {outputEntity.displayNamePlural} are currently
        visualized on the map using markers. These are the{' '}
        {outputEntity.displayNamePlural} that
        <ul css={{ padding: '1em 0' }}>
          <li>satisfy all your filters</li>
          {includesTimeSliderFilter && (
            <li>satisfy the time range you have selected</li>
          )}
          <li>
            have data for the variable that is currently displayed on the
            visible or slected markers
          </li>
          <li>
            have appropriate values, if the marker has been custom-configured
          </li>
        </ul>
      </p>
      {onShowStudies && (
        <p>
          The visualized data comes from {totalRootEntityFormatted}{' '}
          {rootEntity.displayNamePlural}{' '}
          <button type="button" onClick={() => onShowStudies(true)}>
            Show list
          </button>
        </p>
      )}
    </div>
  );

  return (
    <>
      <div
        css={{
          padding: '1em',
          fontSize: '1.2em',
          display: 'flex',
          gap: '1ex',
          alignItems: 'center',
        }}
      >
        {format(visibleEntityCount)} {outputEntity.displayNamePlural}
        {onShowStudies && (
          <>
            {' '}
            from {format(rootEntityCount.data.count)}{' '}
            {rootEntity.displayNamePlural}
          </>
        )}
        <Tooltip title={tooltipContent} interactive style={{ width: 'auto' }}>
          <Info style={{ color: '#069', height: '.8em', width: '.8em' }} />
        </Tooltip>
      </div>
    </>
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
