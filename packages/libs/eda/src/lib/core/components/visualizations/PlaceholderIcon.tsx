import { useMemo } from 'react';
import { useVizIconColors } from './implementations/selectorIcons/types';
import HeatmapSVG from './implementations/selectorIcons/HeatmapSVG';
import DensitySVG from './implementations/selectorIcons/DensitySVG';
import MapSVG from './implementations/selectorIcons/MapSVG';
import LineSVG from './implementations/selectorIcons/LineSVG';
import ScatterSVG from './implementations/selectorIcons/ScatterSVG';

const style = { height: '100%', width: '100%', opacity: 0.2 };

interface Props {
  name?: string;
}

export default function PlaceholderIcon(props: Props) {
  const { name } = props;
  const colors = useVizIconColors();

  const images: Record<string, JSX.Element> = useMemo(
    () => ({
      heatmap: (
        <div style={style}>
          <HeatmapSVG {...colors} />
        </div>
      ),
      densityplot: (
        <div style={style}>
          <DensitySVG {...colors} />
        </div>
      ),
      'map-markers': (
        <div style={style}>
          <MapSVG {...colors} />
        </div>
      ),
      lineplot: (
        <div style={style}>
          <LineSVG {...colors} />
        </div>
      ),
      scatterplot: (
        <div style={style}>
          <ScatterSVG {...colors} />
        </div>
      ),
    }),
    [colors]
  );

  return name ? (
    images[name] ?? <div>NO IMAGE</div>
  ) : (
    <div>NOT IMPLEMENTED</div>
  );
}
