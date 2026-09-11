import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// FilterParamNew's real render throws on the minimal fake `parameter`/`uiState`
// fixtures below (it expects fully-populated ontology data beyond the
// `type: 'filter'` discriminant that `isFilterParamNew` checks), so it's
// stubbed out here. `jest.requireActual` on this module pulls in the entire
// `@veupathdb/wdk-client/lib/Components` barrel (dozens of unrelated, heavy
// components) and trips an unrelated module-resolution error in that chain,
// so the mock factory below stands alone rather than spreading the actual
// module — `StrainMsaForm.tsx` only imports `FilterParamNew` from here today.
jest.mock('@veupathdb/wdk-client/lib/Components', () => ({
  FilterParamNew: () => <div data-testid="filter-param-new-stub" />,
}));

import { StrainMsaForm, deriveRegion } from './StrainMsaForm';

type TestRecord = {
  recordClassName: string;
  attributes: Record<string, string | null>;
};

const GENE_RECORD: TestRecord = {
  recordClassName: 'GeneRecordClasses.GeneRecordClass',
  attributes: { start_min: '100', end_max: '5000' },
};

const VARIANT_RECORD: TestRecord = {
  recordClassName: 'VariantRecordClasses.VariantRecordClass',
  attributes: { location: '2500' },
};

type TestState = { question: { questions: Record<string, unknown> } };

function renderWithQuestionState(
  questionState: unknown,
  record: TestRecord = GENE_RECORD
) {
  const store = createStore(
    (state: TestState = { question: { questions: {} } }) => ({
      ...state,
      question: { questions: { StrainSegmentsByMeta: questionState } },
    })
  );
  return render(
    <Provider store={store}>
      <StrainMsaForm record={record} />
    </Provider>
  );
}

describe('deriveRegion', () => {
  it('returns a range for a Gene record, from start_min/end_max', () => {
    expect(deriveRegion(GENE_RECORD)).toEqual({
      kind: 'range',
      start: '100',
      end: '5000',
    });
  });

  it('returns a point + default 1000 offset for a Variant record, from location', () => {
    expect(deriveRegion(VARIANT_RECORD)).toEqual({
      kind: 'point',
      location: '2500',
      offset: 1000,
    });
  });
});

describe('StrainMsaForm', () => {
  it('renders nothing while the question is not yet loaded', () => {
    const { container } = renderWithQuestionState(undefined);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while the question status is not complete', () => {
    const { container } = renderWithQuestionState({
      questionStatus: 'loading',
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders start/end/strand inputs and the metadata filter for a Gene record', () => {
    const fakeParameter = {
      name: 'variation_sample_meta',
      type: 'filter',
    };
    renderWithQuestionState(
      {
        questionStatus: 'complete',
        question: {
          urlSegment: 'StrainSegmentsByMeta',
          parametersByName: { variation_sample_meta: fakeParameter },
        },
        paramValues: {
          start_point: '100',
          end_point_segment: '5000',
          variation_sample_meta: JSON.stringify({ filters: [] }),
        },
        paramUIState: { variation_sample_meta: {} },
      },
      GENE_RECORD
    );

    expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/offset/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/forward/i)).toBeChecked();
  });

  it('renders a single offset input (not start/end) for a Variant record', () => {
    const fakeParameter = {
      name: 'variation_sample_meta',
      type: 'filter',
    };
    renderWithQuestionState(
      {
        questionStatus: 'complete',
        question: {
          urlSegment: 'StrainSegmentsByMeta',
          parametersByName: { variation_sample_meta: fakeParameter },
        },
        paramValues: {
          start_point: '1500',
          end_point_segment: '3500',
          variation_sample_meta: JSON.stringify({ filters: [] }),
        },
        paramUIState: { variation_sample_meta: {} },
      },
      VARIANT_RECORD
    );

    expect(screen.getByLabelText(/offset/i)).toHaveValue(1000);
    expect(screen.queryByLabelText(/^start$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^end$/i)).not.toBeInTheDocument();
  });
});
