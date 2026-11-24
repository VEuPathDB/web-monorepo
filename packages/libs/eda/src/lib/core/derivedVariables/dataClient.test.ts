import DataClient from '../api/DataClient';
import { DerivedVariableSpec } from './types';
import { withDerivedVariableSpecs } from './dataClient';

const mk = (variableId: string): DerivedVariableSpec => ({
  entityId: 'e',
  variableId,
  functionName: 'filterDefinedGroups',
  displayName: variableId,
  config: {},
});
const A = mk('A');
const B = mk('B');

function fakeClient() {
  const calls: Array<{ params: unknown }> = [];
  const client = Object.create(DataClient.prototype) as DataClient;
  client.getVisualizationData = jest.fn(
    (_c: string, _v: string, params: unknown) => {
      calls.push({ params });
      return Promise.resolve({} as never);
    }
  ) as unknown as DataClient['getVisualizationData'];
  return { client, calls };
}

const lineplotParams = (overlay?: DerivedVariableSpec) =>
  ({
    studyId: 's',
    filters: [],
    derivedVariables: [],
    config: {
      outputEntityId: 'e',
      overlayVariable: overlay && {
        entityId: overlay.entityId,
        variableId: overlay.variableId,
      },
    },
  } as never);

describe('withDerivedVariableSpecs', () => {
  test('adds only referenced specs to visualization requests', async () => {
    const { client, calls } = fakeClient();
    const wrapped = withDerivedVariableSpecs(client, [A, B]);
    await wrapped.getLineplot('pass', 'lineplot', lineplotParams(A));
    expect(
      (calls[0].params as { derivedVariables: unknown }).derivedVariables
    ).toEqual([A]);
  });

  test('sends [] when nothing is referenced', async () => {
    const { client, calls } = fakeClient();
    const wrapped = withDerivedVariableSpecs(client, [A, B]);
    await wrapped.getLineplot('pass', 'lineplot', lineplotParams());
    expect(
      (calls[0].params as { derivedVariables: unknown }).derivedVariables
    ).toEqual([]);
  });
});
