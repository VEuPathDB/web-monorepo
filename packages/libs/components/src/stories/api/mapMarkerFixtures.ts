

export const getSpeciesMarkerElements = async ({bounds, zoomLevel} : BoundsViewport, duration : number, scrambleKeys: boolean = false, setLegendData: (legendData: Array<{label: string, value: number, color: string}>) => void) => {
  const geohash_level = zoomLevelToGeohashLevel[zoomLevel];

/* DKDK two approaches may be possible
  a) set type for imported geoclust-species-testing-all-levels.json
     > type speciesDataProps = typeof import('./test-data/geoclust-species-testing-all-levels.json')
     then, speciesData[geohash_level as keyof speciesDataProps].facets ...
  b) although a) works fine for current species data, it seems not to work for large json file
     thus used this approach instead for consistency
*/
  //DKDK applying b) approach, setting key as string & any
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
	return [k, all_colors_hex[index]];
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
    const key = scrambleKeys ? md5(bucket.val).substring(0, zoomLevel) : bucket.val;

    return (
      <DonutMarker
        id={key}   //DKDK anim
        key={key}   //DKDK anim
        position={{lat, lng}}
        bounds={bounds}
        data={data}
        isAtomic={atomicValue}
        onClick={handleClick}
        duration={duration}
      />
      )
  });
}




  
type covidStateData = {
  date: number;
  state: string;
  death: number;
  hospitalizedCurrently: number;
  positiveIncrease: number;
};

export const getDailyCovidStats = async (): Promise<Array<covidStateData>> => {
  const response = await fetch(
    'https://api.covidtracking.com/v1/states/current.json'
  );
  const json = await response.json();
  return json;
};

/**
 * Figure out the range of values and then create the bins?
 *
 * @param binWidth
 */
export const binDailyCovidStats = async (binWidth: number) => {
  const dailyStatsByState = await getDailyCovidStats();

  // Simulate Errors
  if (binWidth === 9000) {
    throw new Error(
      'Pretend error of not being able retrieve data from the backend.'
    );
  } else if (binWidth === 4000) {
    throw new Error(
      'Pretend error of some random error with a moderately long message associated to it.'
    );
  }

  const newCasesStats = dailyStatsByState.map(
    (dailyStat) => dailyStat.positiveIncrease
  );
  const lowNewCases = Math.min(...newCasesStats);
  const highNewCases = Math.max(...newCasesStats);
  const newCasesBins: HistogramBin[] = [];

  for (
    let index = lowNewCases;
    index < highNewCases;
    index = index + binWidth
  ) {
    newCasesBins.push({
      binStart: index,
      binLabel: `${index} - ${index + binWidth}`,
      count: 0,
    });
  }

  const hospitalizedStats = dailyStatsByState.map(
    (dailyStat) => dailyStat.hospitalizedCurrently
  );
  const lowHospitalized = Math.min(...hospitalizedStats);
  const highHospitalized = Math.max(...hospitalizedStats);
  const hospitalizationBins: HistogramBin[] = [];

  for (
    let index = lowHospitalized;
    index < highHospitalized;
    index = index + binWidth
  ) {
    hospitalizationBins.push({
      binStart: index,
      binLabel: `${index} - ${index + binWidth}`,
      count: 0,
    });
  }

  const reducer = (
    accumulator: HistogramData,
    currentValue: covidStateData
  ) => {
    const matchingCasesBinIndex = newCasesBins.findIndex(
      (bin) => bin.binStart >= currentValue.positiveIncrease
    );

    if (matchingCasesBinIndex !== -1) {
      newCasesBins[matchingCasesBinIndex].count =
        newCasesBins[matchingCasesBinIndex].count + 1;
    } else {
      newCasesBins[newCasesBins.length - 1].count =
        newCasesBins[newCasesBins.length - 1].count + 1;
    }

    const matchingBinIndex = hospitalizationBins.findIndex(
      (bin) => bin.binStart >= currentValue.hospitalizedCurrently
    );

    if (matchingBinIndex !== -1) {
      hospitalizationBins[matchingBinIndex].count =
        hospitalizationBins[matchingBinIndex].count + 1;
    } else {
      hospitalizationBins[hospitalizationBins.length - 1].count =
        hospitalizationBins[hospitalizationBins.length - 1].count + 1;
    }

    return accumulator;
  };

  const binnedData = dailyStatsByState.reduce(reducer, [
    { name: 'Current Hospitalizations', bins: hospitalizationBins },
    { name: 'New Cases', bins: newCasesBins },
  ]);
  return binnedData;
};
