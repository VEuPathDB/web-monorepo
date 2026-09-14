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
        eda_sample_table_suffix: {
          name: 'eda_sample_table_suffix',
          type: 'single-pick-vocabulary',
          vocabulary: [['pf3d7_v68', 'pf3d7_v68', null]],
        },
      },
    },
    paramValues: {
      organismSinglePick: 'Plasmodium falciparum 3D7',
      sequenceId: 'Pf3D7_11_v3',
      sequence_strand: 'f',
      start_point: '1',
      end_point_segment: '5000',
      variation_sample_meta: JSON.stringify({ filters: [] }),
    },
    paramUIState: { variation_sample_meta: {} },
    ...overrides,
  };
}

describe('StrainMsaForm region seeding', () => {
  // A reducer that actually applies QuestionActions.updateParamValue to
  // paramValues, so the effect's dispatch is observable end-to-end (through
  // a re-render), rather than just asserting an action shape was dispatched.
  function makeLiveStore(initialQuestionState: any) {
    return createStore(
      (
        state: { question: { questions: Record<string, any> } } = {
          question: {
            questions: { StrainSegmentsByMeta: initialQuestionState },
          },
        },
        action: any
      ) => {
        if (action.type === 'question/update-param-value') {
          const current = state.question.questions.StrainSegmentsByMeta;
          return {
            ...state,
            question: {
              questions: {
                StrainSegmentsByMeta: {
                  ...current,
                  paramValues: {
                    ...current.paramValues,
                    [action.payload.parameter.name]: action.payload.paramValue,
                  },
                },
              },
            },
          };
        }
        return state;
      }
    );
  }

  function renderLive(questionState: unknown, record: TestRecord) {
    const store = makeLiveStore(questionState);
    render(
      <Provider store={store}>
        <WdkDependenciesContext.Provider value={{ wdkService: {} } as any}>
          <StrainMsaForm record={record} />
        </WdkDependenciesContext.Provider>
      </Provider>
    );
    return store;
  }

  it('seeds start_point/end_point_segment from location +/- 1000 for a Variant record, without user interaction', async () => {
    const questionState = makeCompleteQuestionState({
      question: {
        urlSegment: 'StrainSegmentsByMeta',
        parametersByName: {
          variation_sample_meta: {
            name: 'variation_sample_meta',
            type: 'filter',
          },
          start_point: { name: 'start_point' },
          end_point_segment: { name: 'end_point_segment' },
        },
      },
      paramValues: {
        organismSinglePick: 'Plasmodium falciparum 3D7',
        sequenceId: 'Pf3D7_11_v3',
        sequence_strand: 'f',
        // Deliberately NOT pre-seeded to location +/- 1000, to reproduce the
        // gap: nothing upstream (Task 4's epic) sets these two params.
        start_point: '',
        end_point_segment: '',
        variation_sample_meta: JSON.stringify({ filters: [] }),
      },
    });
    const store = renderLive(questionState, VARIANT_RECORD);

    await waitFor(() => {
      const current = store.getState().question.questions.StrainSegmentsByMeta;
      expect(current.paramValues.start_point).toBe('1500');
      expect(current.paramValues.end_point_segment).toBe('3500');
    });
  });

  it('seeds start_point/end_point_segment from start_min/end_max for a Gene record, without user interaction', async () => {
    const questionState = makeCompleteQuestionState({
      question: {
        urlSegment: 'StrainSegmentsByMeta',
        parametersByName: {
          variation_sample_meta: {
            name: 'variation_sample_meta',
            type: 'filter',
          },
          start_point: { name: 'start_point' },
          end_point_segment: { name: 'end_point_segment' },
        },
      },
      paramValues: {
        organismSinglePick: 'Plasmodium falciparum 3D7',
        sequenceId: 'Pf3D7_11_v3',
        sequence_strand: 'f',
        start_point: '',
        end_point_segment: '',
        variation_sample_meta: JSON.stringify({ filters: [] }),
      },
    });
    const store = renderLive(questionState, GENE_RECORD);

    await waitFor(() => {
      const current = store.getState().question.questions.StrainSegmentsByMeta;
      expect(current.paramValues.start_point).toBe('100');
      expect(current.paramValues.end_point_segment).toBe('5000');
    });
  });

  it('does not re-dispatch once start_point/end_point_segment already reflect the derived region', async () => {
    const questionState = makeCompleteQuestionState({
      paramValues: {
        organismSinglePick: 'Plasmodium falciparum 3D7',
        sequenceId: 'Pf3D7_11_v3',
        sequence_strand: 'f',
        start_point: '1500',
        end_point_segment: '3500',
        variation_sample_meta: JSON.stringify({ filters: [] }),
      },
    });
    const store = renderLive(questionState, VARIANT_RECORD);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    // Give any effect a chance to run; it should see the params already
    // match the derived region and skip dispatching.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});

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
              sequence_strand: 'f',
              start_point: '1',
              end_point_segment: '5000',
            }),
          }),
        }),
        'sequence',
        expect.objectContaining({
          sequenceFormat: 'fixed_width',
          attachmentType: 'plain',
        })
      )
    );
    expect(
      getTemporaryResultPath.mock.calls[0][0].searchConfig.parameters
    ).toHaveProperty('eda_sample_table_suffix', 'pf3d7_v68');
    expect(fakeTab.location.replace).not.toHaveBeenCalled(); // FASTA writes text directly, doesn't navigate
  });

  it('FASTA radio: renders a visible error message when getTemporaryResultPath rejects', async () => {
    const fakeTab = { location: { replace: jest.fn() }, close: jest.fn() };
    window.open = jest.fn().mockReturnValue(fakeTab);
    const getTemporaryResultPath = jest
      .fn()
      .mockRejectedValue(new Error('service unavailable'));

    renderWithWdkService(makeCompleteQuestionState(), {
      getTemporaryResultPath,
    });

    await userEvent.click(screen.getByLabelText(/fasta/i));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'service unavailable'
    );
    expect(fakeTab.close).toHaveBeenCalledTimes(1);
  });

  it('FASTA radio: renders a visible error message when fetch rejects', async () => {
    const fakeTab = { location: { replace: jest.fn() }, close: jest.fn() };
    window.open = jest.fn().mockReturnValue(fakeTab);
    const getTemporaryResultPath = jest
      .fn()
      .mockResolvedValue('/temporary-results/xyz');
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    renderWithWdkService(makeCompleteQuestionState(), {
      getTemporaryResultPath,
    });

    await userEvent.click(screen.getByLabelText(/fasta/i));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('network down');
    expect(fakeTab.close).toHaveBeenCalledTimes(1);
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
    const fakeTab = { location: { replace: jest.fn() }, close: jest.fn() };
    window.open = jest.fn().mockReturnValue(fakeTab);

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
          resultTab: fakeTab,
        })
      )
    );
    // The tab must be opened synchronously by the click handler itself
    // (before the awaited getTemporaryResultPath/fetch chain), not by
    // submitClustalMsaJob — otherwise browsers may block it as a popup.
    expect(window.open).toHaveBeenCalledWith('about:blank', '_blank');
  });
});
