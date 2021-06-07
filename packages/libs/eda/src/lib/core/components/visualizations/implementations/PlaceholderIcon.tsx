import box from './selectorIcons/box.svg';
import mosaic from './selectorIcons/mosaic.svg';
import heatmap from './selectorIcons/heatmap.svg';
import density from './selectorIcons/density.svg';
import map from './selectorIcons/map.svg';

const images: Record<string, JSX.Element> = {
  boxplot: (
    <img src={box} style={{ height: '100%', width: '100%', opacity: 0.2 }} />
  ),
  conttable: (
    <img src={mosaic} style={{ height: '100%', width: '100%', opacity: 0.2 }} />
  ),
  heatmap: (
    <img
      src={heatmap}
      style={{ height: '100%', width: '100%', opacity: 0.2 }}
    />
  ),
  densityplot: (
    <img
      src={density}
      style={{ height: '100%', width: '100%', opacity: 0.2 }}
    />
  ),
  ['map-markers']: (
    <img src={map} style={{ height: '100%', width: '100%', opacity: 0.2 }} />
  ),
};

interface Props {
  name?: string;
}

export default function PlaceholderIcon(props: Props) {
  const { name } = props;
  return name ? (
    images[name] ?? <div>NO IMAGE</div>
  ) : (
    <div>NOT IMPLEMENTED</div>
  );
}
