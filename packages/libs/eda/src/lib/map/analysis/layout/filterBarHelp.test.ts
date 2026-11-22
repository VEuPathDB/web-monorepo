import { countHelpText, filterBarHelpSections } from './filterBarHelp';

describe('filterBarHelpSections', () => {
  it('numbers filters, timeline and count', () => {
    expect(
      filterBarHelpSections({
        entityName: 'Regions',
        showTimeline: true,
        windowApplies: false,
      })
    ).toEqual([
      { key: 'filters', number: 1 },
      { key: 'timeline', number: 2 },
      { key: 'count', number: 3 },
    ]);
  });
  it('drops the timeline section, and renumbers, without a timeline', () => {
    expect(
      filterBarHelpSections({
        entityName: 'Regions',
        showTimeline: false,
        windowApplies: false,
      })
    ).toEqual([
      { key: 'filters', number: 1 },
      { key: 'count', number: 2 },
    ]);
  });
});

describe('countHelpText', () => {
  it('names what the count includes', () => {
    expect(
      countHelpText({
        entityName: 'Regions',
        windowApplies: true,
        markerVariableName: 'Area covered',
      })
    ).toBe(
      "Regions matching your filters, inside the timeline window, with data for the marker variable (Area covered), out of all Regions in the dataset. It counts the whole dataset, not just what's in view. Hover it for the details."
    );
    expect(
      countHelpText({
        entityName: 'Regions',
        windowApplies: false,
        markerVariableName: 'Area covered',
      })
    ).toBe(
      "Regions matching your filters, with data for the marker variable (Area covered), out of all Regions in the dataset. It counts the whole dataset, not just what's in view. Hover it for the details."
    );
    expect(countHelpText({ entityName: 'Regions', windowApplies: false })).toBe(
      "Regions matching your filters, out of all Regions in the dataset. It counts the whole dataset, not just what's in view. Hover it for the details."
    );
  });
});
