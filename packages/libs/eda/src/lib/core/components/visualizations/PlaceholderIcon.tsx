import box from './implementations/selectorIcons/box.svg';
import mosaic from './implementations/selectorIcons/mosaic.svg';
import heatmap from './implementations/selectorIcons/heatmap.svg';
import density from './implementations/selectorIcons/density.svg';
import map from './implementations/selectorIcons/map.svg';

const style = { height: '100%', width: '100%', opacity: 0.2 };

const images: Record<string, JSX.Element> = {
  boxplot: <img src={box} style={style} />,
  conttable: <img src={mosaic} style={style} />,
  heatmap: <img src={heatmap} style={style} />,
  densityplot: <img src={density} style={style} />,
  ['map-markers']: <img src={map} style={style} />,
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
