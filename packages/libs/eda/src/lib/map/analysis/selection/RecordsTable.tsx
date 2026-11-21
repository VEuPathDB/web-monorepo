import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { Filter, StudyEntity, useSubsettingClient } from '../../../core';
import { GeoConfig } from '../../../core/types/geoConfig';
import { makeEntityDisplayName } from '../../../core/utils/study-metadata';
import { Coordinates, IconButton, mapUi } from '../layout/ui';
import { recordColumns } from '../utils/geoEntities';
import { parseRecords } from './recordsTableData';

const PAGE_SIZE = 25;
const { format } = new Intl.NumberFormat();

interface Props {
  studyId: string;
  entity: StudyEntity;
  /** all entities, for naming the ID columns */
  studyEntities: StudyEntity[];
  /** subset + time slider + selection (or visible area) */
  filters: Filter[];
  /** number of records matching `filters`, for paging */
  recordCount: number | undefined;
  geoConfig: GeoConfig;
}

/**
 * One page of the records behind the selection, showing the entity's
 * featured variables. Records with their own coordinates get a copy
 * lat/long / Google Maps control.
 */
export function RecordsTable({
  studyId,
  entity,
  studyEntities,
  filters,
  recordCount,
  geoConfig,
}: Props) {
  const subsettingClient = useSubsettingClient();
  const [page, setPage] = useState(0);
  // back to the first page whenever what is listed changes
  useEffect(() => setPage(0), [entity.id, filters]);

  const { variables, usingFeatured } = useMemo(
    () => recordColumns(entity),
    [entity]
  );
  const isLocationEntity = entity.id === geoConfig.entity.id;
  const latLongVariableIds = useMemo(
    () =>
      isLocationEntity
        ? {
            latitude: geoConfig.latitudeVariableId,
            longitude: geoConfig.longitudeVariableId,
          }
        : undefined,
    [isLocationEntity, geoConfig]
  );
  const outputVariableIds = [
    ...variables.map(({ id }) => id),
    ...(latLongVariableIds
      ? [latLongVariableIds.latitude, latLongVariableIds.longitude]
      : []),
  ];

  const result = useQuery({
    queryKey: [
      'map',
      'records',
      studyId,
      entity.id,
      outputVariableIds,
      filters,
      page,
    ],
    keepPreviousData: true,
    queryFn: () =>
      subsettingClient.getTabularData(studyId, entity.id, {
        filters,
        outputVariableIds,
        reportConfig: {
          headerFormat: 'standard',
          trimTimeFromDateVars: true,
          paging: { numRows: PAGE_SIZE, offset: page * PAGE_SIZE },
        },
      }),
  });

  const { columns, rows } = useMemo(
    () =>
      parseRecords(
        result.data ?? [],
        studyEntities,
        variables,
        latLongVariableIds
      ),
    [result.data, studyEntities, variables, latLongVariableIds]
  );

  const entityName = makeEntityDisplayName(entity, recordCount !== 1);
  const pageCount =
    recordCount != null ? Math.max(1, Math.ceil(recordCount / PAGE_SIZE)) : 1;

  if (result.error)
    return (
      <div css={{ color: '#b00020', padding: 8 }}>
        Could not load records: {String(result.error)}
      </div>
    );

  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: mapUi.muted,
        }}
      >
        <span css={{ flex: 1 }}>
          {recordCount == null
            ? '…'
            : recordCount === 0
            ? `No ${entityName}`
            : `${format(page * PAGE_SIZE + 1)}–${format(
                Math.min((page + 1) * PAGE_SIZE, recordCount)
              )} of ${format(recordCount)} ${entityName}`}
        </span>
        <IconButton
          title="Previous page"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          title="Next page"
          disabled={page + 1 >= pageCount}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight />
        </IconButton>
      </div>
      {!usingFeatured && (
        <div css={{ fontSize: 12, color: mapUi.muted }}>
          This entity has no featured variables; showing its first{' '}
          {variables.length}. Use <em>Download</em> for all variables.
        </div>
      )}
      <div
        css={{
          position: 'relative',
          overflow: 'auto',
          border: mapUi.border,
          borderRadius: mapUi.radius,
          minHeight: 80,
        }}
      >
        {result.isFetching && <Spinner size={30} />}
        <table
          css={{
            borderCollapse: 'collapse',
            fontSize: 12,
            width: '100%',
            'th, td': {
              padding: '4px 8px',
              borderBottom: '1px solid #eee',
              textAlign: 'left',
              verticalAlign: 'top',
              whiteSpace: 'nowrap',
              maxWidth: 240,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            th: {
              position: 'sticky',
              top: 0,
              background: '#f7f7f7',
              fontWeight: 600,
              zIndex: 1,
            },
            'tbody tr:hover': { background: '#fafafa' },
          }}
        >
          <thead>
            <tr>
              {isLocationEntity && <th>Location</th>}
              {columns.map((column) => (
                <th key={column.key} title={column.header}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                {isLocationEntity && (
                  <td>
                    {row.position ? (
                      <Coordinates position={row.position} />
                    ) : (
                      <span css={{ color: mapUi.muted }}>—</span>
                    )}
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} title={row.values[column.key]}>
                    {row.values[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
