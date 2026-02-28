import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
 * Hook that encapsulates all annotation tooltip behaviour for a Plotly
 * scatterplot: fetching the tabular annotation data for the output entity,
 * managing pinned-tooltip state, and handling Plotly click / click-away events.
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
      if (response.length < 2) return new Map<string, Record<string, string>>();
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

  // Pinned tooltip state
  const [pinnedAnnotation, setPinnedAnnotation] = useState<{
    pointId: string;
    x: number;
    y: number;
  } | null>(null);
  const pinnedTooltipRef = useRef<HTMLDivElement>(null);
  const plotWrapperRef = useRef<HTMLDivElement>(null);

  // Dismiss on click-away
  useEffect(() => {
    if (!pinnedAnnotation) return;
    function handleClickAway(e: MouseEvent) {
      const target = e.target as Node;
      if (pinnedTooltipRef.current?.contains(target)) return;
      if (plotWrapperRef.current?.contains(target)) return;
      setPinnedAnnotation(null);
    }
    const timeout = setTimeout(
      () => document.addEventListener('pointerdown', handleClickAway),
      0
    );
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('pointerdown', handleClickAway);
    };
  }, [pinnedAnnotation]);

  // Plotly click handler
  const handlePlotlyClick = useCallback(
    (event: any) => {
      if (!enabled) return;
      const point = event.points?.[0];
      if (!point) return;
      const pointId = point.customdata as string | undefined;
      if (!pointId) {
        setPinnedAnnotation(null);
        return;
      }
      const plotWrapper = plotWrapperRef.current;
      if (!plotWrapper) return;
      const rect = plotWrapper.getBoundingClientRect();
      const mouseEvent = event.event as MouseEvent | undefined;
      if (!mouseEvent) {
        setPinnedAnnotation(null);
        return;
      }
      setPinnedAnnotation({
        pointId,
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top,
      });
    },
    [enabled]
  );

  // Build annotation rows for the pinned point
  const annotationRows: AnnotationRow[] = useMemo(() => {
    if (!pinnedAnnotation || !annotationData.value || !outputEntity) return [];
    const record = annotationData.value.get(pinnedAnnotation.pointId);
    if (!record) return [];
    return annotationVariables
      .map((v) => {
        const headerKey = `${outputEntity.id}.${v.id}`;
        const raw = record[headerKey];
        return raw != null
          ? { displayName: v.displayName, value: formatCellValue(raw) }
          : undefined;
      })
      .filter((r): r is AnnotationRow => r != null);
  }, [pinnedAnnotation, annotationData.value, annotationVariables, outputEntity]);

  const dismissTooltip = useCallback(() => setPinnedAnnotation(null), []);

  return {
    annotationRows,
    loading: annotationData.pending,
    pinnedAnnotation,
    handlePlotlyClick,
    dismissTooltip,
    pinnedTooltipRef,
    plotWrapperRef,
  };
}
