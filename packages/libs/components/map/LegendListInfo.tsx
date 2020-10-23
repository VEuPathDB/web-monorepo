//DKDK sample legend
import React from 'react';

interface LegendListInfoProps {
  legendType: string,
}


export default function LegendListInfo(props: LegendListInfoProps) {
  //DKDK add tutorial image (for now)
  let legendListInfoImage: string = ''
  if (props.legendType == 'categorical') {
    legendListInfoImage = './img/donut-marker-description.png'
  } else {
    legendListInfoImage = './img/hisgoram-maker-description.png'
  }
  return (
    <>
      <div className="legend-marker-description">
        <img width="95%" height="95%" src={legendListInfoImage} />
      </div>
    </>
  )

}

