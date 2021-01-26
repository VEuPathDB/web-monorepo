/**
 * Some quick and poor code quality API calls for use in Storybook examples.
 * If other people start to use these, I'll come and clean them up...
 */
import { HistogramBin, HistogramData } from '../../types/plots';

type covidStateData = {
  fips: string;
  country: string;
  state: string;
  county: string;
  level: 'country' | 'state' | 'county' | 'cbsa' | 'place';
  population: number;
  actuals: {
    cases: number;
    deaths: number;
    positiveTests: number;
    negativeTests: number;
    contactTracers: number;
    hospitalBeds: {
      capacity: number;
      currentUsageTotal: number;
      currentUsageCovid: number;
      typicalUsageRate: number;
    };
    icuBeds: {
      capacity: number;
      currentUsageTotal: number;
      currentUsageCovid: number;
      typicalUsageRate: number;
    };
    newCases: number;
    vaccinesDistributed: number;
    vaccinationsInitiated: number;
    vaccinationsCompleted: number;
  };
  metrics: {
    testPositivityRatio: number;
    testPositivityRatioDetails: {
      source: string;
    };
    caseDensity: number;
    contactTracerCapacityRatio: number;
    infectionRate: number;
    infectionRateCI90: number;
    icuHeadroomRatio: number;
    icuHeadroomDetails: {
      currentIcuCovid: number;
      currentIcuCovidMethod: string;
      currentIcuNonCovid: number;
      currentIcuNonCovidMethod: string;
    };
    icuCapacityRatio: number;
    vaccinationsInitiatedRatio: number;
    vaccinationsCompletedRatio: number;
  };
};

export const getDailyCovidStats = async (): Promise<Array<covidStateData>> => {
  const response = await fetch(
    'https://api.covidactnow.org/v2/states.json?apiKey=c85ebdd1b2ad497cb8349e777867933d'
  );
  const json = await response.json();
  return json;
};

/**
 * Figure out the range of values and then create the bins?
 */
export const binDailyCovidStats = async (
  binWidth: number,
  selectedUnit: string
) => {
  const statisticsByState = await getDailyCovidStats();

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

  const newCasesStats = statisticsByState.map((state) =>
    selectedUnit === 'Per 1000 Residents'
      ? state.actuals.newCases / state.population
      : state.actuals.newCases
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

  const hospitalizedStats = statisticsByState.map((state) =>
    selectedUnit === 'Per 1000 Residents'
      ? state.actuals.hospitalBeds.currentUsageCovid / state.population
      : state.actuals.hospitalBeds.currentUsageCovid
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
      (bin) => bin.binStart >= currentValue.actuals.newCases
    );

    if (matchingCasesBinIndex !== -1) {
      newCasesBins[matchingCasesBinIndex].count =
        newCasesBins[matchingCasesBinIndex].count + 1;
    } else {
      newCasesBins[newCasesBins.length - 1].count =
        newCasesBins[newCasesBins.length - 1].count + 1;
    }

    const matchingBinIndex = hospitalizationBins.findIndex(
      (bin) =>
        bin.binStart >= currentValue.actuals.hospitalBeds.currentUsageCovid
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

  const binnedData = statisticsByState.reduce(reducer, [
    { name: 'Current Hospitalizations', bins: hospitalizationBins },
    { name: 'New Cases', bins: newCasesBins },
  ]);

  return binnedData;
};
