import box from './implementations/selectorIcons/box.svg';
import rxc from './implementations/selectorIcons/RxC.svg';
import heatmap from './implementations/selectorIcons/heatmap.svg';
import density from './implementations/selectorIcons/density.svg';
import map from './implementations/selectorIcons/map.svg';

const style = { height: '100%', width: '100%', opacity: 0.2 };

const images: Record<string, JSX.Element> = {
  boxplot: <img alt="Box plot" src={box} style={style} />,
  conttable: <img alt="Contingecy table" src={rxc} style={style} />,
  heatmap: <img alt="Heatmap" src={heatmap} style={style} />,
  densityplot: <img alt="Density plot" src={density} style={style} />,
  'map-markers': <img alt="Map marker" src={map} style={style} />,
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
