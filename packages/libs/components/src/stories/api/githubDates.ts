/**
 * Grab 100 items with dates from github API
 * https://api.github.com/users/VEuPathDB/events?per_page=100
 */
import { HistogramBin, HistogramData } from '../../types/plots';
import { EmptyHistogramData } from '../../plots/Histogram';
import { TimeDelta } from '../../types/general';
import * as DateMath from 'date-arithmetic';

type EventData = {
  id: string;
  date: string;
};

export const getCreatedDateData = async (
  url: string
): Promise<Array<EventData>> => {
  return await fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(
          'Response not as expected. Probably exceeded API rate limit.'
        );
      }
    })
    .then((json) => {
      return json.map((item: any) => ({
        id: item.id,
        date: item.created_at,
      }));
    })
    .catch((error) => {
      console.log(error.message);
    });
};

/**
 * binWidth takes priority over numBins if both are given
 * (yes it ought to be done more formally than this)
 */
export const binGithubEventDates = async ({
  url,
  unit,
  binWidth,
  numBins,
}: {
  url: string;
  unit: DateMath.Unit;
  binWidth?: TimeDelta;
  numBins?: number;
}): Promise<HistogramData> => {
  const eventData = await getCreatedDateData(url);
  if (eventData == null) return EmptyHistogramData;

  const dates = eventData.map((event) => event.date).sort();
  const rawFirstDate = dates[0];
  // round it down to the nearest 'unit'
  // TO DO: phase 3 or 4 - handle epiweeks
  const firstDate =
    unit === 'week'
      ? DateMath.startOf(new Date(rawFirstDate), unit, 0).toISOString()
      : DateMath.startOf(new Date(rawFirstDate), unit).toISOString();
  const lastDate = dates[dates.length - 1];
  const bins: HistogramBin[] = [];

  // bin width in whole time-units
  // TO DO: Math.max(1, ...) protection added due to the Math.floor() could return zero days
  // ideally the units should adapt automatically (e.g. to hours if needed)
  const calculatedBinWidth = binWidth
    ? binWidth
    : numBins
    ? {
        value: Math.max(
          1,
          Math.floor(
            DateMath.diff(new Date(firstDate), new Date(lastDate), unit, true) /
              numBins
          )
        ),
        unit,
      }
    : { value: 1, unit };

  for (
    let date = firstDate;
    date < lastDate;
    date = DateMath.add(
      new Date(date),
      calculatedBinWidth.value,
      calculatedBinWidth.unit as DateMath.Unit
    ).toISOString()
  ) {
    const binEnd = DateMath.add(
      new Date(date),
      calculatedBinWidth.value,
      calculatedBinWidth.unit as DateMath.Unit
    );
    bins.push({
      binStart: date,
      binEnd: binEnd.toISOString(),
      binLabel: `${date} - ${binEnd}`,
      count: 0,
    });
  }

  dates.forEach((date) => {
    // find the bin *after* the one this belongs to
    const matchingBinIndex = bins.findIndex((bin) => {
      return date < bin.binStart;
    });
    // but if we don't find that bin, we must need the final bin
    if (matchingBinIndex < 0) {
      bins[bins.length - 1].count += 1;
    } else {
      bins[matchingBinIndex - 1].count += 1;
    }
  });

  const objectToReturn = {
    series: [
      {
        name: 'Count of events',
        bins,
      },
    ],
    valueType: 'date',
  };

  // console.log(objectToReturn);

  // @ts-ignore
  return objectToReturn;
};
