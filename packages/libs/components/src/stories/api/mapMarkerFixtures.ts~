import { HistogramBin, HistogramData } from '../../types/plots';

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
