import { stepButtons } from './timelineStep';

const dataRange = { start: '2015-01-01', end: '2021-01-01' };

describe('stepButtons', () => {
  it('is disabled until a window is drawn', () => {
    const { back, forward } = stepButtons({ dataRange, active: true });
    expect(back).toEqual({
      enabled: false,
      tooltip: 'Draw a window on the timeline first',
    });
    expect(forward).toEqual({
      enabled: false,
      tooltip: 'Draw a window on the timeline first',
    });
  });
  it('is disabled while the timeline is switched off', () => {
    const selectedRange = { start: '2018-01-01', end: '2019-01-01' };
    expect(
      stepButtons({ selectedRange, dataRange, active: false }).back
    ).toEqual({
      enabled: false,
      tooltip: 'The timeline is switched off',
    });
  });
  it('says the timeline is off, not to draw a window, when it is off and empty', () => {
    expect(stepButtons({ dataRange, active: false }).forward).toEqual({
      enabled: false,
      tooltip: 'The timeline is switched off',
    });
  });
  it('names where each step lands', () => {
    const selectedRange = { start: '2018-01-01', end: '2019-01-01' };
    const { back, forward } = stepButtons({
      selectedRange,
      dataRange,
      active: true,
    });
    expect(back).toEqual({
      enabled: true,
      tooltip: 'Step back: Jan 2017–Jan 2018',
      range: { start: '2017-01-01', end: '2018-01-01' },
    });
    expect(forward).toEqual({
      enabled: true,
      tooltip: 'Step forward: Jan 2019–Jan 2020',
      range: { start: '2019-01-01', end: '2020-01-01' },
    });
  });
  it('stops at the end of the data', () => {
    const selectedRange = { start: '2019-01-01', end: '2021-01-01' };
    const { back, forward } = stepButtons({
      selectedRange,
      dataRange,
      active: true,
    });
    expect(back.enabled).toBe(true);
    expect(forward).toEqual({
      enabled: false,
      tooltip: 'No more data in this direction',
    });
  });
});
