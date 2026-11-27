import { mapCountTooltip } from './mapCountTooltip';

describe('mapCountTooltip', () => {
  it('lists only the subset filters by default', () => {
    expect(mapCountTooltip({ entityName: 'Regions' })).toBe(
      'Regions that:\n• satisfy all your filters\n' +
        '• are anywhere, not just in the current view\n' +
        'out of all Regions in the study'
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
        '• are anywhere, not just in the current view\n' +
        'out of all Regions in the study'
    );
  });

  it('says how many of them have no coordinates, when some have none', () => {
    expect(mapCountTooltip({ entityName: 'Regions', unmappedCount: 3 })).toBe(
      'Regions that:\n• satisfy all your filters\n' +
        '• are anywhere, not just in the current view\n' +
        'out of all Regions in the study\n\n' +
        "3 of these have no coordinates, so aren't on the map: switch to the Dataset Explorer to see them more easily."
    );
    expect(
      mapCountTooltip({ entityName: 'Regions', unmappedCount: 1 })
    ).toMatch(/\n\n1 of these has no coordinates, so isn't on the map: switch/);
    expect(
      mapCountTooltip({ entityName: 'Regions', unmappedCount: 0 })
    ).not.toMatch(/coordinates/);
  });
});
