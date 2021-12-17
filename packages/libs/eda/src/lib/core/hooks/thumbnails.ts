import {
  DependencyList,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { FacetedPlotRef, PlotRef } from '@veupathdb/components/lib/types/plots';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { ThumbnailDimensions, makePlotThumbnailUrl } from '../utils/thumbnails';

export function useUpdateThumbnailEffect(
  updateThumbnail: (src: string) => void,
  thumbnailDimensions: ThumbnailDimensions,
  deps?: DependencyList
) {
  const plotRef = useRef<FacetedPlotRef | PlotRef>();

  // Maintain a reference to the latest values of "updateThumbnail"
  // and "thumbnailDimensions"
  const thumbnailArgsRef = useRef({
    updateThumbnail,
    thumbnailDimensions,
  });
  useEffect(() => {
    thumbnailArgsRef.current = {
      updateThumbnail,
      thumbnailDimensions,
    };
  }, [updateThumbnail, thumbnailDimensions]);

  // Whenever one of the "deps" change, capture a thumbnail image
  // and save it to the analysis config
  useLayoutEffect(() => {
    const plotInstance = plotRef.current;

    if (plotInstance == null) {
      return;
    }

    const { updateThumbnail, thumbnailDimensions } = thumbnailArgsRef.current;

    return Task.fromPromise(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 0);
        })
    )
      .chain(() =>
        Task.fromPromise(() =>
          makePlotThumbnailUrl(plotInstance, thumbnailDimensions)
        )
      )
      .run(updateThumbnail);

    // Disabling react-hooks/exhaustive-deps because it objects to the use
    // of "deps" which are not array literals
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
