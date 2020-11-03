//DKDK sample legend
import React from 'react';

interface LegendListInfoProps {
  legendType: string,
  //DKDK used for legend info texts, e.g., Collection Date, Collections
  dropdownTitle: string,
  legendInfoNumberText?: string,
}


export default function LegendListInfo(props: LegendListInfoProps) {
  //DKDK add tutorial image (for now)
  let legendListInfoImage: string = ''
  if (props.legendType == 'categorical') {
    //DKDK for now, use image for categorical one
    legendListInfoImage = './img/legend-info-donut-capture.png'
    return (
      <>
        <br />
        <div className="legend-donut-marker-description">
          <div><b>Marker key</b></div>
          <img width="95%" height="95%" src={legendListInfoImage} />
        </div>
      </>
    )
  } else {
    //DKDK using image comprised of chart marker and arrows. Relavent texts come from props
    legendListInfoImage = './img/legend-chart-arrow-new.png'
    return (
      <>
        <div className="legend-chart-marker-description">
          <div><b>Marker key</b></div>
            <div className="legend-info-contents">
              <div className="legend-info-image"><img width="80%" height="80%" src={legendListInfoImage} /></div>
              <div className="legend-info-text">marker is fully disaggregated<br />color by {props.dropdownTitle}<br />number of {props.legendInfoNumberText}</div>
            </div>
        </div>
      </>
    )
  }
}

