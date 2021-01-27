import React from 'react';
import { BoundsViewport, Bounds } from '../../map/Types';
import { zoomLevelToGeohashLevel, allColorsHex } from '../../map/config/map.json';
import DonutMarker, { DonutMarkerProps } from '../../map/DonutMarker';
import { LeafletMouseEvent } from "leaflet";

export const getSpeciesDonuts = async ({bounds, zoomLevel} : BoundsViewport,
				       duration: number,
				       setLegendData: (legendData: Array<{label: string, value: number, color: string}>) => void,
				       handleMarkerClick: (e: LeafletMouseEvent) => void) => {
  const geohash_level = zoomLevelToGeohashLevel[zoomLevel];

  const response = await fetch('/data/geoclust-species-testing-all-levels.json');
  const speciesData = await response.json();
  
  const buckets = (speciesData as { [key: string]: any })[`geohash_${geohash_level}`].facets.geo.buckets.filter((bucket : any) => {
    const lat : number = bucket.ltAvg;
    const long : number = bucket.lnAvg;

    const south = bounds.southWest.lat;
    const north = bounds.northEast.lat;
    const west = bounds.southWest.lng;
    const east = bounds.northEast.lng;
    const lambda = 1e-08; // accommodate tiny rounding errors

    return (lat > south &&
	    lat < north &&
	    (west < east - lambda ? (long > west && long < east) :
		    west > east + lambda ? !(long > east && long < west) : true) );
  });

  // make a first pass and calculate the legend totals
  // and rank the species for color assignment
  let speciesToCount = new Map();
  buckets.forEach((bucket : any) => {
    bucket.term.buckets.forEach((bucket : any) => {
      const species = bucket.val;
      let prevCount = speciesToCount.get(species);
      if (prevCount === undefined) prevCount = 0;
      speciesToCount.set(species, prevCount + bucket.count);
    });
  });

  // sort by the count (Map returns keys in insertion order)
  speciesToCount = new Map(
    Array.from(speciesToCount).sort( ([_1,v1], [_2,v2]) => v1 > v2 ? -1 : v2 > v1 ? 1 : 0 )
  );

  // make the species to color lookup
  const speciesToColor = new Map(
    Array.from(speciesToCount).map( ([k, _], index) => {
      if (index<10) {
	return [k, allColorsHex[index]];
      } else {
	return [k, 'silver']
      }
    })
  );

  // reformat as legendData
  const legendData = Array.from(speciesToCount.keys()).map((key) => (
    {
      label: key,
      value: speciesToCount.get(key) || -1,
      color: speciesToColor.get(key) || 'silver'
    }
  ));
  setLegendData(legendData);

  return buckets.map((bucket : any) => {
    const lat : number = bucket.ltAvg;
    const lng : number = bucket.lnAvg;
    const bounds : Bounds = { southWest: { lat: bucket.ltMin, lng: bucket.lnMin }, northEast: { lat: bucket.ltMax, lng: bucket.lnMax }};
    let data: DonutMarkerProps['data'] = [];

    bucket.term.buckets.forEach((bucket : any) => {
      const species = bucket.val;
      data.push({
        label: species,
        value: bucket.count,
        color: speciesToColor.get(species) || 'silver',
      })
    });

    //DKDK check isAtomic
    let atomicValue = (bucket.atomicCount && bucket.atomicCount === 1) ? true : false

    //DKDK anim key
    const key = bucket.val;

    return (
      <DonutMarker
        id={key}   //DKDK anim
        key={key}   //DKDK anim
        position={{lat, lng}}
        bounds={bounds}
        data={data}
        isAtomic={atomicValue}
        onClick={handleMarkerClick}
        duration={duration}
      />
      )
  });
}

