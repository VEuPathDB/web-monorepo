import { DependencyList, useCallback, useEffect, useRef } from 'react';

import { FacetedPlotRef, PlotRef } from '@veupathdb/components/lib/types/plots';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { ThumbnailDimensions, makePlotThumbnailUrl } from '../utils/thumbnails';

export function useUpdateThumbnailEffect(
  updateThumbnail: (src: string) => void,
  thumbnailDimensions: ThumbnailDimensions,
  deps?: DependencyList
) {
  const plotRef = useRef<FacetedPlotRef | PlotRef>();

  // Maintain a reference to the latest value of "updateThumbnail"
  const updateThumbnailRef = useRef(updateThumbnail);
  useEffect(() => {
    updateThumbnailRef.current = updateThumbnail;
  }, [updateThumbnail]);

  // Whenever one of the "deps" change, capture a thumbnail image
  // and save it to the analysis config
  useEffect(() => {
    const plotInstance = plotRef.current;

    if (plotInstance == null) {
      return;
    }

    return Task.fromPromise(() =>
      makePlotThumbnailUrl(plotInstance, thumbnailDimensions)
    ).run(updateThumbnailRef.current);
  }, deps);

  // Return a ref callback which can be passed to plot components
  return useCallback((instance: FacetedPlotRef | PlotRef | null) => {
    if (instance == null) {
      plotRef.current = undefined;
    } else {
      plotRef.current = instance;
    }
  }, []);
}
