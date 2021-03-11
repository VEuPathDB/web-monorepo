/**
 * Grab 100 items with dates from github API
 * https://api.github.com/users/VEuPathDB/events?per_page=100
 */
import { HistogramBin, HistogramData } from '../../types/plots';
import { TimeDelta } from '../../types/general';
import * as DateMath from 'date-arithmetic';

type EventData = {
  id: string;
  date: Date;
};

export const getEventData = async (): Promise<Array<EventData>> => {
  const response = await fetch(
    'https://api.github.com/users/VEuPathDB/events?per_page=100'
  );
  const json = await response.json();
  return json.map((event: any) => ({
    id: event.id,
    date: new Date(event.created_at),
  }));
};

/**
 * binWidth takes priority over numBins if both are given
 * (yes it ought to be done more formally than this)
 */
export const binGithubEventDates = async (args: {
  binWidth?: TimeDelta;
  numBins?: number;
}): Promise<HistogramData> => {
  const eventData = await getEventData();

  const dates = eventData.map((event) => event.date);

  // the dates come in reverse order from github, so exploit that to save time
  const firstDate = dates[dates.length - 1];
  const lastDate = dates[0];
  const bins: HistogramBin[] = [];

  // bin width in whole hours (for now)
  // TO DO: Math.max(1, ...) protection added due to the Math.floor() could return zero days
  // ideally the units should adapt automatically (e.g. to hours if needed)
  const calculatedBinWidth = args.binWidth
    ? args.binWidth
    : args.numBins
    ? ([
        Math.max(
          1,
          Math.floor(
            DateMath.diff(firstDate, lastDate, 'hours', true) / args.numBins
          )
        ),
        'hours',
      ] as TimeDelta)
    : ([1, 'hours'] as TimeDelta);

  for (
    let date = firstDate;
    date < lastDate;
    date = DateMath.add(date, ...calculatedBinWidth)
  ) {
    bins.push({
      binStart: date,
      binLabel: `${date} - ${DateMath.add(date, ...calculatedBinWidth)}}`,
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
  };

  console.log(objectToReturn);

  // @ts-ignore
  return objectToReturn;
};
