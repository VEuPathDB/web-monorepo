import { MarkerConfiguration } from '../appState';
import {
  configurationsForStyle,
  shareMarkerSettings,
  withVariable,
} from './markerConfigurations';

const v1 = { entityId: 'e1', variableId: 'v1' };
const v2 = { entityId: 'e2', variableId: 'v2' };

function configurations(
  variable = v1
): [
  Extract<MarkerConfiguration, { type: 'pie' }>,
  Extract<MarkerConfiguration, { type: 'barplot' }>,
  Extract<MarkerConfiguration, { type: 'bubble' }>
] {
  return [
    {
      type: 'pie',
      selectedVariable: variable,
      selectedValues: ['a', 'b'],
      binningMethod: 'quantile',
      selectedCountsOption: 'visible',
    },
    {
      type: 'barplot',
      selectedVariable: variable,
      selectedValues: ['a', 'b'],
      selectedPlotMode: 'proportion',
      binningMethod: undefined,
      dependentAxisLogScale: true,
      selectedCountsOption: 'filtered',
    },
    {
      type: 'bubble',
      selectedVariable: variable,
      aggregator: 'median',
      numeratorValues: ['a'],
      denominatorValues: ['a', 'b'],
    },
  ];
}

describe('withVariable', () => {
  it('clears the chosen values of donuts and bars', () => {
    const [pie, bar] = configurations();
    expect(withVariable(pie, v2)).toEqual({
      ...pie,
      selectedVariable: v2,
      selectedValues: undefined,
    });
    expect(withVariable(bar, v2)).toEqual({
      ...bar,
      selectedVariable: v2,
      selectedValues: undefined,
    });
  });

  it("clears the bubbles' proportion values but keeps the aggregator", () => {
    const [, , bubble] = configurations();
    expect(withVariable(bubble, v2)).toEqual({
      ...bubble,
      selectedVariable: v2,
      numeratorValues: undefined,
      denominatorValues: undefined,
    });
  });
});

describe('shareMarkerSettings', () => {
  it('gives every style the new variable, keeping style-only settings', () => {
    const [pie, bar, bubble] = configurations();
    const updatedPie = { ...pie, selectedVariable: v2, selectedValues: [] };
    expect(shareMarkerSettings([pie, bar, bubble], updatedPie)).toEqual([
      updatedPie,
      { ...bar, selectedVariable: v2, selectedValues: [] },
      {
        ...bubble,
        selectedVariable: v2,
        numeratorValues: undefined,
        denominatorValues: undefined,
      },
    ]);
  });

  it('shares chosen values between donuts and bars only', () => {
    const [pie, bar, bubble] = configurations();
    const updatedBar = { ...bar, selectedValues: ['c'] };
    expect(shareMarkerSettings([pie, bar, bubble], updatedBar)).toEqual([
      { ...pie, selectedValues: ['c'] },
      updatedBar,
      bubble,
    ]);
  });

  it("keeps the bubbles' proportion values with the bubbles", () => {
    const [pie, bar, bubble] = configurations();
    const updatedBubble = { ...bubble, numeratorValues: ['b'] };
    expect(shareMarkerSettings([pie, bar, bubble], updatedBubble)).toEqual([
      pie,
      bar,
      updatedBubble,
    ]);
  });
});

describe('configurationsForStyle', () => {
  it('returns the same array when the styles already agree', () => {
    const all = configurations();
    expect(configurationsForStyle(all, 'pie', 'bubble')).toBe(all);
  });

  it('carries the current variable to the new style (older analyses)', () => {
    const [pie, bar, bubble] = configurations();
    const oldBubble = { ...bubble, selectedVariable: v2 };
    expect(
      configurationsForStyle([pie, bar, oldBubble], 'pie', 'bubble')
    ).toEqual([
      pie,
      bar,
      {
        ...bubble,
        numeratorValues: undefined,
        denominatorValues: undefined,
      },
    ]);
  });

  it('copies chosen values when switching between donuts and bars', () => {
    const [pie, bar, bubble] = configurations();
    const oldBar = { ...bar, selectedValues: ['z'] };
    expect(
      configurationsForStyle([pie, oldBar, bubble], 'pie', 'barplot')
    ).toEqual([pie, bar, bubble]);
  });

  it('leaves the configurations alone if the current style has none', () => {
    const [pie, bar] = configurations();
    const two = [pie, bar];
    expect(configurationsForStyle(two, 'bubble', 'pie')).toBe(two);
  });
});
