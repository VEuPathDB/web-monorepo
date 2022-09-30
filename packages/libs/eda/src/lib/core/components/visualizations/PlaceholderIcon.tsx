import { useMemo } from 'react';
import SvgHeatmap from './implementations/selectorIcons/heatmap';
import SvgDensity from './implementations/selectorIcons/density';
import line from './implementations/selectorIcons/line.svg';
import map from './implementations/selectorIcons/map.svg';
import scatter from './implementations/selectorIcons/scatter.svg';
import { useVizIconColors } from './VisualizationsContainer';

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
          <SvgHeatmap {...colors} />
        </div>
      ),
      densityplot: (
        <div style={style}>
          <SvgDensity {...colors} />
        </div>
      ),
      'map-markers': <img alt="Map marker" src={map} style={style} />,
      lineplot: <img alt="Time Series" src={line} style={style} />,
      scatterplot: <img alt="Scatter plot" src={scatter} style={style} />,
    }),
    [colors]
  );

  return name ? (
    images[name] ?? <div>NO IMAGE</div>
  ) : (
    <div>NOT IMPLEMENTED</div>
  );
}
