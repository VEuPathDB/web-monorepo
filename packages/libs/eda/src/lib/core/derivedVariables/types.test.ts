import { isLeft, isRight } from 'fp-ts/Either';
import { AnalysisDescriptor } from '../types/analysis';
import {
  DerivedVariableSpec,
  FILTER_DEFINED_GROUPS,
  isFilterDefinedGroupsSpec,
} from './types';

const validSpec: DerivedVariableSpec = {
  entityId: 'e',
  variableId: 'dv1',
  functionName: FILTER_DEFINED_GROUPS,
  displayName: 'My groups',
  config: {
    groups: [
      {
        label: 'A',
        filters: [
          {
            type: 'stringSet',
            entityId: 'e',
            variableId: 'v',
            stringSet: ['x'],
          },
        ],
      },
    ],
  },
};

function descriptorWith(derivedVariables: unknown[]) {
  return {
    studyId: 's',
    dataTableConfig: {},
    subset: { descriptor: [], uiSettings: {} },
    computations: [],
    starredVariables: [],
    derivedVariables,
  };
}

test('an analysis whose descriptor has an unsupported spec still decodes', () => {
  const d = descriptorWith([{ ...validSpec, functionName: 'somethingNew' }]);
  expect(isRight(AnalysisDescriptor.decode(d))).toBe(true);
});

test('a malformed outer spec shape is rejected', () => {
  const d = descriptorWith([{ entityId: 'e' }]);
  expect(isLeft(AnalysisDescriptor.decode(d))).toBe(true);
});
