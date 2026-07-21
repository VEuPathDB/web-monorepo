import { useCallback, useMemo, useState } from 'react';
import { Variable, StudyEntity } from '../types/study';
import { Filter } from '../types/filter';
import { useCachedPromise } from './cachedPromise';
import { useSubsettingClient } from './workspace';
import { AnnotationRow } from '../components/visualizations/implementations/ScatterPlotAnnotationTooltip';

/**
 * Decode a tabular data cell value for display.
 * Multi-valued EDA variables come back as JSON-encoded arrays, e.g.
 * '["val1","val2"]'. Single values are plain strings or numbers.
 */
function formatCellValue(raw: string): string {
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
    } catch {
      // not valid JSON — fall through to return raw
    }
  }
  return raw;
}

interface UseAnnotationTooltipProps {
  enabled: boolean;
  studyId: string;
  outputEntity: StudyEntity | undefined;
  filters: Filter[] | undefined;
}

/**
 * Hook that encapsulates annotation tooltip behaviour for a Plotly scatterplot:
 * fetching tabular annotation data for the output entity, managing hover and
 * pinned-point state, and providing Plotly event handlers.
 *
 * The active point (whose annotations are displayed) is the pinned point if
 * one exists, otherwise the hovered point.
 */
export function useAnnotationTooltip({
  enabled,
  studyId,
  outputEntity,
  filters,
}: UseAnnotationTooltipProps) {
  const subsettingClient = useSubsettingClient();

  // Variables to display in the tooltip
  const annotationVariables = useMemo(() => {
    if (!enabled || !outputEntity) return [];
    return outputEntity.variables.filter(
      (v): v is Variable =>
        Variable.is(v) &&
        !v.hideFrom?.includes('variableTree') &&
        !v.hideFrom?.includes('everywhere') &&
        !v.isMergeKey
    );
  }, [enabled, outputEntity]);

  const annotationVariableIds = useMemo(
    () => annotationVariables.map((v) => v.id),
    [annotationVariables]
  );

  // Fetch tabular data for all output entity variables
  const annotationData = useCachedPromise(
    async () => {
      const response = await subsettingClient.getTabularData(
        studyId,
        outputEntity!.id,
        {
          filters: filters ?? [],
          outputVariableIds: annotationVariableIds,
          reportConfig: {
            headerFormat: 'standard',
            trimTimeFromDateVars: true,
          },
        }
      );
      // Build a lookup map: entityPK -> { header: value }
      // Response is string[][] where first row is headers
      if (response.length < 2) {
        return new Map<string, Record<string, string>>();
      }
      const headers = response[0];
      const pkColIndex = 0;
      const lookup = new Map<string, Record<string, string>>();
      for (let rowIdx = 1; rowIdx < response.length; rowIdx++) {
        const row = response[rowIdx];
        const entityPkValue = row[pkColIndex];
        const record: Record<string, string> = {};
        for (let colIdx = 0; colIdx < headers.length; colIdx++) {
          record[headers[colIdx]] = row[colIdx];
        }
        lookup.set(entityPkValue, record);
      }
      return lookup;
    },
    [
      enabled ? 'annotationData' : null,
      studyId,
      outputEntity?.id,
      filters,
      annotationVariableIds,
    ],
    5 * 60 * 1000 // 5 minute cache
  );

  // Hover and pinned state
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [pinnedPointId, setPinnedPointId] = useState<string | null>(null);

  const activePointId = pinnedPointId ?? hoveredPointId;

  // Plotly event handlers
  const handlePlotlyHover = useCallback(
    (event: any) => {
      if (!enabled) return;
      const pointId = event.points?.[0]?.customdata as string | undefined;
      if (pointId) setHoveredPointId(pointId);
    },
    [enabled]
  );

  const handlePlotlyUnhover = useCallback(() => {
    setHoveredPointId(null);
  }, []);

  const handlePlotlyClick = useCallback(
    (event: any) => {
      if (!enabled) return;
      const pointId = event.points?.[0]?.customdata as string | undefined;
      if (!pointId) {
        setPinnedPointId(null);
        return;
      }
      // Toggle: clicking the already-pinned point unpins it
      setPinnedPointId((prev) => (prev === pointId ? null : pointId));
    },
    [enabled]
  );

  const clearPin = useCallback(() => setPinnedPointId(null), []);

  // Build annotation rows for the active point
  const annotationRows: AnnotationRow[] = useMemo(() => {
    if (!activePointId || !annotationData.value || !outputEntity) return [];
    const record = annotationData.value.get(activePointId);
    if (!record) return [];
    return annotationVariables
      .map((v) => {
        const raw = record[v.id];
        return raw != null
          ? { displayName: v.displayName, value: formatCellValue(raw) }
          : undefined;
      })
      .filter((r): r is AnnotationRow => r != null);
  }, [activePointId, annotationData.value, annotationVariables, outputEntity]);

  return {
    annotationRows,
    loading: annotationData.pending,
    isPinned: pinnedPointId != null,
    activePointId,
    handlePlotlyHover,
    handlePlotlyUnhover,
    handlePlotlyClick,
    clearPin,
  };
}
