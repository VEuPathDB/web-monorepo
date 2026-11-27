import { Decoder } from 'io-ts';
import DataClient from '../api/DataClient';
import { DerivedVariableSpec } from '../types/analysis';
import { findReferencedSpecs } from './references';

/**
 * Wraps a DataClient so every visualization request carries the derived
 * variable specs that its params reference. All typed methods go through
 * getVisualizationData, so overriding it covers them. Any derivedVariables
 * already in params are overwritten.
 */
export function withDerivedVariableSpecs(
  client: DataClient,
  specs: DerivedVariableSpec[]
): DataClient {
  const wrapped: DataClient = Object.create(client);
  wrapped.getVisualizationData = function <T>(
    computationName: string,
    visualizationName: string,
    params: unknown,
    decoder: Decoder<unknown, T>
  ): Promise<T> {
    const base = typeof params === 'object' && params !== null ? params : {};
    return client.getVisualizationData.call(
      this,
      computationName,
      visualizationName,
      { ...base, derivedVariables: findReferencedSpecs(params, specs) },
      decoder
    ) as unknown as Promise<T>;
  };
  return wrapped;
}
