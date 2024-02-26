import { Info } from '@material-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from '@veupathdb/coreui';
import {
  Filter,
  useStudyEntities,
  useStudyMetadata,
  useSubsettingClient,
} from '../../../core';
import { STUDIES_ENTITY_ID } from '../../constants';

interface Props {
  includesTimeSliderFilter: boolean;
  /** All filters applied to the map, including:
   * - subset
   * - marker config
   * - timeline filters
   * - viewport
   */
  filtersForVisibleData: Filter[];
  /** Entity space of map markers, overlay, etc */
  outputEntityId: string;
  /**
   * If omitted, do not show studies link
   */
  onShowStudies?: (showStudies: boolean) => void;
  /**
   * Indicates if any markers are selected
   */
  hasMarkerSelection: boolean;
}

const { format } = new Intl.NumberFormat('en-us');

export function MapTypeHeaderStudyDetails(props: Props) {
  const {
    filtersForVisibleData: filterForVisibleData,
    includesTimeSliderFilter,
    outputEntityId,
    onShowStudies,
    hasMarkerSelection,
  } = props;
  const entities = useStudyEntities();
  const studyEntity = entities.find(
    (entity) => entity.id === STUDIES_ENTITY_ID
  );
  const outputEntity = entities.find((entity) => entity.id === outputEntityId);

  const studyEntityCount = useEntityCount(
    studyEntity?.id, // Study entity
    filterForVisibleData // Should be subset, map type, timeline, and viewport filters
  );

  const outputEntityCount = useEntityCount(
    outputEntity?.id,
    filterForVisibleData
  );

  // Should not happen. Throw error?
  if (
    outputEntity == null ||
    outputEntityCount.error ||
    studyEntityCount.error
  ) {
    outputEntity == null &&
      console.error('Could not find an entity with the ID ' + outputEntityId);
    outputEntityCount.error && console.error(outputEntityCount.error);
    studyEntityCount.error && console.error(studyEntityCount.error);
    return (
      <div>
        <em>Could not load counts for map data</em>
      </div>
    );
  }

  if (
    studyEntityCount.data == null ||
    studyEntityCount.isFetching ||
    outputEntityCount.data == null ||
    outputEntityCount.isFetching
  )
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
        Loading counts&hellip;
      </div>
    );

  const totalCountFormatted = format(outputEntityCount.data.count);
  const totalStudiesFormatted = format(studyEntityCount.data.count);

  const tooltipContent = (
    <div>
      <p>
        {totalCountFormatted}{' '}
        {outputEntityCount.data.count === 1
          ? outputEntity.displayName + ' is'
          : outputEntity.displayNamePlural + ' are'}{' '}
        currently visualized on the map using markers. These are the{' '}
        {outputEntity.displayNamePlural} that
        <ul css={{ padding: '1em 0' }}>
          <li>satisfy all your filters</li>
          {includesTimeSliderFilter && (
            <li>satisfy the time range you have selected</li>
          )}
          <li>
            have data for the variable that is currently displayed on the
            visible or selected markers
          </li>
          <li>
            have appropriate values, if the marker has been custom-configured
          </li>
        </ul>
      </p>
      {onShowStudies && studyEntity && (
        <p>
          The visualized data comes from {totalStudiesFormatted}{' '}
          {studyEntityCount.data.count === 1
            ? studyEntity.displayName
            : studyEntity.displayNamePlural}{' '}
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
          alignItems: 'center',
        }}
      >
        {hasMarkerSelection ? 'Selected: ' : 'Showing: '}
        {totalCountFormatted}{' '}
        {outputEntityCount.data.count === 1
          ? outputEntity.displayName
          : outputEntity.displayNamePlural}
        {onShowStudies && studyEntity && (
          <>
            &nbsp;from&nbsp;
            <button
              className="link"
              type="button"
              onClick={() => onShowStudies(true)}
            >
              {format(studyEntityCount.data.count)}{' '}
              {studyEntityCount.data.count === 1
                ? studyEntity.displayName
                : studyEntity.displayNamePlural}
            </button>
          </>
        )}
        &nbsp;
        <Tooltip title={tooltipContent} interactive style={{ width: 'auto' }}>
          <Info style={{ color: '#069', height: '.8em', width: '.8em' }} />
        </Tooltip>
      </div>
    </>
  );
}

function useEntityCount(entityId?: string, filters?: Filter[]) {
  const studyMetadata = useStudyMetadata();
  const subsettingClient = useSubsettingClient();
  return useQuery({
    queryKey: ['entityCount', entityId, filters],
    queryFn: async function () {
      if (entityId == null)
        return {
          count: 0,
        };
      return subsettingClient.getEntityCount(
        studyMetadata.id,
        entityId,
        filters ?? []
      );
    },
  });
}
