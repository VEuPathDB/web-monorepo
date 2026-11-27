import { timelineState } from './timelineState';

const config = {
  variable: { entityId: 'shop', variableId: 'opened' },
  active: true,
  selectedRange: { start: '2016-01-01', end: '2018-01-01' },
};

describe('timelineState', () => {
  it('shows the timeline and applies an active window', () => {
    expect(
      timelineState({ canDrawMarkers: true, config, variableIsDate: true })
    ).toEqual({
      showTimeline: true,
      windowApplies: true,
      timeWindow: config.selectedRange,
    });
  });

  it('shows but does not apply a window that is switched off', () => {
    expect(
      timelineState({
        canDrawMarkers: true,
        config: { ...config, active: false },
        variableIsDate: true,
      })
    ).toEqual({ showTimeline: true, windowApplies: false });
  });

  it('hides everything when the saved variable no longer resolves to a date', () => {
    expect(
      timelineState({ canDrawMarkers: true, config, variableIsDate: false })
    ).toEqual({ showTimeline: false, windowApplies: false });
  });

  it('hides everything while markers cannot be drawn', () => {
    expect(
      timelineState({ canDrawMarkers: false, config, variableIsDate: true })
    ).toEqual({ showTimeline: false, windowApplies: false });
  });
});
