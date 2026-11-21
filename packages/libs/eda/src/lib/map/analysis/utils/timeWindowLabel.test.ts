import { formatTimeWindowLabel as f } from './timeWindowLabel';

describe('formatTimeWindowLabel', () => {
  it('uses years for windows of two years or more', () => {
    expect(f({ start: '2016-01-01', end: '2018-01-01' })).toBe('2016–2018');
    expect(f({ start: '2016-03-01', end: '2018-08-31' })).toBe('2016–2018');
  });

  it('uses months for windows of two months to two years', () => {
    expect(f({ start: '2016-06-15', end: '2018-03-01' })).toBe(
      'Jun 2016–Mar 2018'
    );
    expect(f({ start: '2016-01-01', end: '2017-12-31' })).toBe(
      'Jan 2016–Dec 2017'
    );
    expect(f({ start: '2016-03-01', end: '2016-08-15' })).toBe('Mar–Aug 2016');
  });

  it('uses days for shorter windows, without repeating shared parts', () => {
    expect(f({ start: '2016-03-03', end: '2016-03-14' })).toBe('3–14 Mar 2016');
    expect(f({ start: '2016-02-28', end: '2016-03-03' })).toBe(
      '28 Feb–3 Mar 2016'
    );
    expect(f({ start: '2015-12-20', end: '2016-01-05' })).toBe(
      '20 Dec 2015–5 Jan 2016'
    );
  });

  it('shows a single value when both ends are the same', () => {
    expect(f({ start: '2016-03-03', end: '2016-03-03' })).toBe('3 Mar 2016');
  });
});
