import { timelineLayout, visibleChipCount } from './filterBarLayout';

describe('timelineLayout', () => {
  it('scales with the bar between 200 and 380px', () => {
    expect(timelineLayout(1440)).toEqual({ placement: 'inline', width: 380 });
    expect(timelineLayout(1000)).toEqual({ placement: 'inline', width: 320 });
    expect(timelineLayout(700)).toEqual({ placement: 'inline', width: 224 });
  });

  it('moves below the chips on phone widths', () => {
    expect(timelineLayout(699)).toEqual({ placement: 'below', width: 667 });
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
