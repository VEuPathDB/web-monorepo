import { mapCountTooltip } from './mapCountTooltip';

describe('mapCountTooltip', () => {
  it('lists only the subset filters by default', () => {
    expect(mapCountTooltip({ entityName: 'Regions' })).toBe(
      'Regions that:\n• satisfy all your filters\nout of all Regions in the study'
    );
  });

  it('adds the time window and marker variable when they apply', () => {
    expect(
      mapCountTooltip({
        entityName: 'Regions',
        timeWindow: {
          start: '2016-01-01',
          end: '2018-01-01',
          variableName: 'Month',
        },
        markerVariableName: 'Area covered',
      })
    ).toBe(
      'Regions that:\n• satisfy all your filters\n' +
        '• are within the timeline window (Month, 2016-01-01 to 2018-01-01)\n' +
        '• have data for Area covered (and the chosen values, if the markers are custom-configured)\n' +
        'out of all Regions in the study'
    );
  });
});
