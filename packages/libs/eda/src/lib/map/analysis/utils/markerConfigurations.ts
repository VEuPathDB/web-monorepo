import { isEqual } from 'lodash';
import { MarkerConfiguration, MarkerType } from '../appState';
import { VariableDescriptor } from '../../../core/types/variable';

/**
 * The marker styles (donuts, bar plots, bubbles) share one marker variable,
 * so switching style only changes the style. Each style keeps its own
 * presentation settings (binning, counts option, plot mode, log scale,
 * aggregator). Donuts and bar plots also share their chosen values, which
 * mean the same thing in both. The bubbles' numerator/denominator values
 * stay with the bubbles.
 *
 * The configurations are still stored per style (`markerConfigurations`);
 * these helpers keep them in agreement.
 */

/** `configuration` showing `variable`, minus settings tied to the old variable */
export function withVariable(
  configuration: MarkerConfiguration,
  variable: VariableDescriptor
): MarkerConfiguration {
  return configuration.type === 'bubble'
    ? {
        ...configuration,
        selectedVariable: variable,
        numeratorValues: undefined,
        denominatorValues: undefined,
      }
    : {
        ...configuration,
        selectedVariable: variable,
        selectedValues: undefined,
      };
}

/**
 * Replaces `source`'s style's configuration with `source`, and brings the
 * other styles into line with it.
 */
export function shareMarkerSettings(
  configurations: MarkerConfiguration[],
  source: MarkerConfiguration
): MarkerConfiguration[] {
  return configurations.map((configuration) => {
    if (configuration.type === source.type) return source;
    const shared = isEqual(
      configuration.selectedVariable,
      source.selectedVariable
    )
      ? configuration
      : withVariable(configuration, source.selectedVariable);
    return source.type !== 'bubble' && shared.type !== 'bubble'
      ? { ...shared, selectedValues: source.selectedValues }
      : shared;
  });
}

/**
 * The configurations to use after switching from style `from` to `to`: the
 * new style takes on the current variable (and chosen values). They normally
 * agree already; older analyses kept a separate variable per style. Returns
 * `configurations` itself when nothing changes.
 */
export function configurationsForStyle(
  configurations: MarkerConfiguration[],
  from: MarkerType,
  to: MarkerType
): MarkerConfiguration[] {
  const current = configurations.find(({ type }) => type === from);
  if (current == null || from === to) return configurations;
  const next = shareMarkerSettings(configurations, current);
  return isEqual(next, configurations) ? configurations : next;
}
