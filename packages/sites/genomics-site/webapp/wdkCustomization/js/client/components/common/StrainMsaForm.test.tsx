import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import userEvent from '@testing-library/user-event';
import * as msaJobSubmission from '@veupathdb/web-common/lib/util/msaJobSubmission';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

jest.mock(
  '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi',
  () => ({
    SequenceRetrievalApi: { getClient: jest.fn().mockReturnValue({}) },
  })
);

// FilterParamNew's real render throws on the minimal fake `parameter`/`uiState`
// fixtures below (it expects fully-populated ontology data beyond the
// `type: 'filter'` discriminant that `isFilterParamNew` checks), so it's
// stubbed out here. `jest.requireActual` on this module pulls in the entire
// `@veupathdb/wdk-client/lib/Components` barrel (dozens of unrelated, heavy
// components) and trips an unrelated module-resolution error in that chain,
// so the mock factory below stands alone rather than spreading the actual
// module — `StrainMsaForm.tsx` only imports `FilterParamNew` from here today.
// `Dialog` is also stubbed here (not imported directly by StrainMsaForm, but
// transitively required by `ClustalAlignmentForm`, which reads it from this
// same barrel) — mirroring its one rendering-relevant behavior (`open` gates
// whether `children` renders at all) is enough for the submission tests below
// to find the "Continue Alignment" button once the dialog opens.
jest.mock('@veupathdb/wdk-client/lib/Components', () => ({
  FilterParamNew: () => <div data-testid="filter-param-new-stub" />,
  Dialog: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="dialog-stub">
        {title && <div>{title}</div>}
        {children}
      </div>
    ) : null,
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
  // A complete question state reaches StrainMsaForm's submit-handling hooks
  // (added in Task 6), which read wdkService from WdkDependenciesContext via
  // useNonNullableContext — so even these rendering-only tests from Task 5
  // need a (possibly empty) context value, or the hook throws.
  return render(
    <Provider store={store}>
      <WdkDependenciesContext.Provider value={{ wdkService: {} } as any}>
        <StrainMsaForm record={record} />
      </WdkDependenciesContext.Provider>
    </Provider>
  );
}

function renderWithWdkService(
  questionState: unknown,
  wdkServiceOverrides = {},
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
      <WdkDependenciesContext.Provider
        value={{ wdkService: wdkServiceOverrides } as any}
      >
        <StrainMsaForm record={record} />
      </WdkDependenciesContext.Provider>
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

function makeCompleteQuestionState(overrides = {}) {
  return {
    questionStatus: 'complete',
    question: {
      urlSegment: 'StrainSegmentsByMeta',
      parametersByName: {
        variation_sample_meta: {
          name: 'variation_sample_meta',
          type: 'filter',
        },
      },
    },
    paramValues: {
      organismSinglePick: 'Plasmodium falciparum 3D7',
      sequenceId: 'Pf3D7_11_v3',
      sequence_strand: '+',
      start_point: '1',
      end_point_segment: '5000',
      variation_sample_meta: JSON.stringify({ filters: [] }),
    },
    paramUIState: { variation_sample_meta: {} },
    ...overrides,
  };
}

describe('StrainMsaForm submission', () => {
  const originalOpen = window.open;
  const originalFetch = global.fetch;

  afterEach(() => {
    window.open = originalOpen;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('FASTA radio: fetches a fasta report and writes it into a pre-opened tab', async () => {
    const fakeTab = { location: { replace: jest.fn() }, close: jest.fn() };
    window.open = jest.fn().mockReturnValue(fakeTab);
    const getTemporaryResultPath = jest
      .fn()
      .mockResolvedValue('/temporary-results/xyz');
    global.fetch = jest
      .fn()
      .mockResolvedValue({ text: () => Promise.resolve('>seq1\nACGT\n') });

    renderWithWdkService(makeCompleteQuestionState(), {
      getTemporaryResultPath,
    });

    await userEvent.click(screen.getByLabelText(/fasta/i));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(getTemporaryResultPath).toHaveBeenCalledWith(
        expect.objectContaining({
          searchName: 'StrainSegmentsByMeta',
          searchConfig: expect.objectContaining({
            parameters: expect.objectContaining({
              organismSinglePick: 'Plasmodium falciparum 3D7',
              sequenceId: 'Pf3D7_11_v3',
              sequence_strand: '+',
              start_point: '1',
              end_point_segment: '5000',
            }),
          }),
        }),
        'fasta',
        expect.anything()
      )
    );
    expect(
      getTemporaryResultPath.mock.calls[0][0].searchConfig.parameters
    ).not.toHaveProperty('eda_sample_table_suffix');
    expect(fakeTab.location.replace).not.toHaveBeenCalled(); // FASTA writes text directly, doesn't navigate
  });

  it('MSA radio: fetches a bed report, parses it, and submits a dnaseq/clustal job', async () => {
    const submitSpy = jest
      .spyOn(msaJobSubmission, 'submitClustalMsaJob')
      .mockResolvedValue(undefined);
    const getTemporaryResultPath = jest
      .fn()
      .mockResolvedValue('/temporary-results/xyz');
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('Pf3D7_11_v3\t100\t500\tstrain_1\t0\t+\n'),
    });

    renderWithWdkService(makeCompleteQuestionState(), {
      getTemporaryResultPath,
    });

    // MSA is the default radio selection; ClustalAlignmentForm's own confirm
    // dialog sits between the submit click and the actual job submission —
    // click submit, then confirm.
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await userEvent.click(
      screen.getByRole('button', { name: /continue alignment/i })
    );

    // The confirm click kicks off a multi-hop async chain (getTemporaryResultPath
    // -> fetch -> parseBedToFeatures -> submitClustalMsaJob); user-event v12's
    // click() doesn't wait for it to fully settle, so assert via waitFor rather
    // than immediately after the click.
    await waitFor(() =>
      expect(getTemporaryResultPath).toHaveBeenCalledWith(
        expect.anything(),
        'bed',
        expect.anything()
      )
    );
    await waitFor(() =>
      expect(submitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sequenceType: 'dnaseq',
          features: [
            {
              contig: 'Pf3D7_11_v3',
              start: 100,
              end: 500,
              query: 'strain_1',
              strand: 'POSITIVE',
            },
          ],
          msaFormat: 'clustal',
        })
      )
    );
  });
});
