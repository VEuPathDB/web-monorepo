import { timelineLayout, visibleChipCount } from './filterBarLayout';

describe('timelineLayout', () => {
  it('scales with the bar between 200 and 520px', () => {
    expect(timelineLayout(1440)).toEqual({ placement: 'inline', width: 520 });
    expect(timelineLayout(1300)).toEqual({ placement: 'inline', width: 520 });
  });

  it('leaves room for the rest of the row on narrower bars', () => {
    // Filters, some chips, the tag, the count, (?), dividers and gaps
    expect(timelineLayout(1000)).toEqual({ placement: 'inline', width: 368 });
    expect(timelineLayout(832)).toEqual({ placement: 'inline', width: 200 });
  });

  it('moves below the chips once that leaves it under 200px', () => {
    expect(timelineLayout(831)).toEqual({ placement: 'below', width: 799 });
    expect(timelineLayout(768)).toEqual({ placement: 'below', width: 736 });
    expect(timelineLayout(360)).toEqual({ placement: 'below', width: 328 });
  });
});

describe('visibleChipCount', () => {
  it('shows every chip when they all fit, without a more button', () => {
    expect(visibleChipCount([100, 100, 100], 400, 70, 8)).toBe(3);
  });

  it('leaves room for the more button when some do not fit', () => {
    expect(visibleChipCount([100, 100, 100, 100], 400, 70, 8)).toBe(3);
    expect(visibleChipCount([150, 150, 150], 300, 70, 8)).toBe(1);
    expect(visibleChipCount([400], 300, 70, 8)).toBe(0);
  });

  it('handles no chips and chips that render nothing', () => {
    expect(visibleChipCount([], 300, 70, 8)).toBe(0);
    expect(visibleChipCount([100, 0, 100], 208, 70, 8)).toBe(3);
  });
});
