import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import PlotlyPlot from '../../plots/PlotlyPlot';
import { PlotRef } from '../../types/plots';

export default {
  title: 'Plots/PlotlyPlot',
  component: PlotlyPlot,
};

export function ToImage() {
  const ref = useRef<PlotRef>(null);
  const [img, setImg] = useState('');
  useEffect(() => {
    ref.current
      ?.toImage({ format: 'jpeg', height: 400, width: 400 })
      .then((src) => setImg(src));
  }, []);
  return (
    <>
      <PlotlyPlot ref={ref} data={[]} layout={{}} />
      <img src={img} />
    </>
  );
}
