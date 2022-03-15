/**
 * Some quick and poor code quality API calls for use in Storybook examples.
 * If other people start to use these, I'll come and clean them up...
 */
import { HistogramData, HistogramDataSeries } from '../../types/plots';

import { Bin } from '../../types/general';

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
  binWidth?: number,
  selectedUnit: string = 'default',
  throwSampleErrors = false,
  includeExtraDirectives = false
): Promise<HistogramData> => {
  const statisticsByState = await getDailyCovidStats();

  const calculatedBinWidth = binWidth
    ? binWidth
    : selectedUnit === 'Count per 100000 Residents'
    ? 1
    : 1000;

  // Simulate Errors
  if (throwSampleErrors && calculatedBinWidth === 9000) {
    throw new Error(
      'Pretend error of not being able retrieve data from the backend.'
    );
  } else if (throwSampleErrors && calculatedBinWidth === 4000) {
    throw new Error(
      'Pretend error of some random error with a moderately long message associated to it.'
    );
  }

  const newCasesStats = statisticsByState.map((state) =>
    selectedUnit === 'Count per 100000 Residents'
      ? state.actuals.newCases / (state.population / 100000)
      : state.actuals.newCases
  );

  const lowNewCases = Math.min(...newCasesStats, 0);
  const highNewCases = Math.max(...newCasesStats);
  const newCasesBins: Bin[] = [];

  for (
    let index = lowNewCases;
    index < highNewCases;
    index = index + calculatedBinWidth
  ) {
    const binEnd = index + calculatedBinWidth;
    newCasesBins.push({
      binStart: index,
      binEnd: binEnd,
      binLabel: `${index} - ${binEnd}`,
      value: 0,
    });
  }

  const hospitalizedStats = statisticsByState.map((state) =>
    selectedUnit === 'Count per 100000 Residents'
      ? state.actuals.hospitalBeds.currentUsageCovid /
        (state.population / 100000)
      : state.actuals.hospitalBeds.currentUsageCovid
  );
  const lowHospitalized = Math.min(...hospitalizedStats);
  const highHospitalized = Math.max(...hospitalizedStats);
  const hospitalizationBins: Bin[] = [];

  for (
    let index = lowHospitalized;
    index < highHospitalized;
    index = index + calculatedBinWidth
  ) {
    const binEnd = index + calculatedBinWidth;
    hospitalizationBins.push({
      binStart: index,
      binEnd: binEnd,
      binLabel: `${index} - ${binEnd}`,
      value: 0,
    });
  }

  const reducer = (
    accumulator: Array<HistogramDataSeries>,
    currentValue: covidStateData
  ) => {
    const stateNewCasesData =
      selectedUnit === 'Count per 100000 Residents'
        ? currentValue.actuals.newCases / (currentValue.population / 100000)
        : currentValue.actuals.newCases;

    const matchingCasesBinIndex = newCasesBins.findIndex((bin) => {
      return bin.binStart >= stateNewCasesData;
    });

    if (matchingCasesBinIndex !== -1) {
      newCasesBins[matchingCasesBinIndex].value =
        newCasesBins[matchingCasesBinIndex].value + 1;
    } else {
      newCasesBins[newCasesBins.length - 1].value =
        newCasesBins[newCasesBins.length - 1].value + 1;
    }

    const stateHospitalUsageData =
      selectedUnit === 'Count per 100000 Residents'
        ? currentValue.actuals.hospitalBeds.currentUsageCovid /
          (currentValue.population / 100000)
        : currentValue.actuals.hospitalBeds.currentUsageCovid;
    const matchingBinIndex = hospitalizationBins.findIndex((bin) => {
      return bin.binStart >= stateHospitalUsageData;
    });

    if (matchingBinIndex !== -1) {
      hospitalizationBins[matchingBinIndex].value =
        hospitalizationBins[matchingBinIndex].value + 1;
    } else {
      hospitalizationBins[hospitalizationBins.length - 1].value =
        hospitalizationBins[hospitalizationBins.length - 1].value + 1;
    }

    return accumulator;
  };

  const binnedData = statisticsByState.reduce(reducer, [
    { name: 'Current Hospitalizations', bins: hospitalizationBins },
    { name: 'New Cases', bins: newCasesBins },
  ]);

  const objectToReturn = {
    valueType: 'number',
    series: binnedData,
    ...(includeExtraDirectives
      ? {
          availableUnits: ['Count', 'Count per 100000 Residents'],
          selectedUnit: 'Count',
          binWidth: selectedUnit === 'Count per 100000 Residents' ? 1 : 1000,
          binWidthRange:
            selectedUnit === 'Count per 100000 Residents'
              ? { min: 1, max: 15 }
              : { min: 1000, max: 15000 },
          binWidthStep: selectedUnit === 'Count per 100000 Residents' ? 1 : 500,
        }
      : {}),
  };

  // console.log(objectToReturn);

  // @ts-ignore
  return objectToReturn;
};
