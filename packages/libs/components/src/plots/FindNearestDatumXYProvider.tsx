/**
 * Provides XY-based (Euclidean distance) nearest-datum finding for visx XYChart tooltips.
 *
 * By default, visx's XYChart finds the nearest datum using only the X dimension,
 * which is fine for line/bar charts but not for scatter plots like volcano plots
 * where points are distributed in 2D space. This provider intercepts the
 * TooltipContext's showTooltip and recomputes the nearest datum using true
 * Euclidean distance in pixel space.
 *
 * Usage: Place as a child of <XYChart>, wrapping the chart content:
 *   <XYChart ...>
 *     <FindNearestDatumXYProvider>
 *       <GlyphSeries ... />
 *       <Tooltip ... />
 *     </FindNearestDatumXYProvider>
 *   </XYChart>
 */
import { ReactNode, useCallback, useContext, useRef } from 'react';
import { DataContext, TooltipContext } from '@visx/xychart';

interface FindNearestDatumXYProviderProps {
  children: ReactNode;
}

export function FindNearestDatumXYProvider({
  children,
}: FindNearestDatumXYProviderProps) {
  const tooltipContext = useContext(TooltipContext);
  const { xScale, yScale, dataRegistry } = useContext(DataContext);

  // Use refs so the stable callback always accesses the latest values
  const showTooltipRef = useRef(tooltipContext?.showTooltip);
  showTooltipRef.current = tooltipContext?.showTooltip;

  const xScaleRef = useRef(xScale);
  xScaleRef.current = xScale;

  const yScaleRef = useRef(yScale);
  yScaleRef.current = yScale;

  const dataRegistryRef = useRef(dataRegistry);
  dataRegistryRef.current = dataRegistry;

  const customShowTooltip = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: any) => {
      const currentXScale = xScaleRef.current;
      const currentYScale = yScaleRef.current;
      const currentDataRegistry = dataRegistryRef.current;
      const currentShowTooltip = showTooltipRef.current;

      if (
        !currentShowTooltip ||
        !params?.svgPoint ||
        !currentXScale ||
        !currentYScale ||
        !currentDataRegistry
      ) {
        currentShowTooltip?.(params);
        return;
      }

      const { svgPoint } = params;

      let nearestResult: {
        datum: unknown;
        index: number;
        distanceX: number;
        distanceY: number;
      } | null = null;
      let nearestDistanceSq = Infinity;
      let nearestKey: string | null = null;

      // Iterate over all registered data series
      for (const key of currentDataRegistry.keys()) {
        const entry = currentDataRegistry.get(key);
        if (!entry) continue;

        const { data, xAccessor, yAccessor } = entry;

        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          const scaledX = Number(currentXScale(xAccessor(d)));
          const scaledY = Number(currentYScale(yAccessor(d)));
          const dx = scaledX - svgPoint.x;
          const dy = scaledY - svgPoint.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < nearestDistanceSq) {
            nearestDistanceSq = distanceSq;
            nearestResult = {
              datum: d,
              index: i,
              distanceX: Math.abs(dx),
              distanceY: Math.abs(dy),
            };
            nearestKey = key;
          }
        }
      }

      if (nearestResult && nearestKey) {
        currentShowTooltip({
          ...params,
          key: nearestKey,
          ...nearestResult,
        });
      } else {
        currentShowTooltip(params);
      }
    },
    [] // Stable callback: uses refs for latest values
  );

  // If no tooltip context is available, render children without the provider
  if (!tooltipContext) {
    return <>{children}</>;
  }

  return (
    <TooltipContext.Provider
      value={{
        ...tooltipContext,
        showTooltip: customShowTooltip,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
