import heatmap from './implementations/selectorIcons/heatmap.svg';
import density from './implementations/selectorIcons/density.svg';
import line from './implementations/selectorIcons/line.svg';

const style = { height: '100%', width: '100%', opacity: 0.2 };

const images: Record<string, JSX.Element> = {
  heatmap: <img alt="Heatmap" src={heatmap} style={style} />,
  densityplot: <img alt="Density plot" src={density} style={style} />,
  lineplot: <img alt="Time Series" src={line} style={style} />,
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
