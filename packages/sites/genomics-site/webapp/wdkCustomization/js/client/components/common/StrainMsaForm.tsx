import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { FilterParamNew, HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import { QuestionActions } from '@veupathdb/wdk-client/lib/Actions';
import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { DispatchAction } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { isType as isFilterParamNew } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { ClustalAlignmentForm } from '@veupathdb/web-common/lib/components';
import {
  fetchTemporaryResultText,
  parseBedToFeatures,
  submitClustalMsaJob,
  submitSyncFastaRequest,
} from '@veupathdb/web-common/lib/util/msaJobSubmission';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import { rootUrl } from '../../config';
import { SEQUENCE_RETRIEVAL_BASE_URL } from '../../util/computeJobConfig';
import { sanitizeFlankInput } from './flankInput';

const SEARCH_NAME = 'StrainSegmentsByMeta';
const METADATA_FILTER_PARAM = 'variation_sample_meta';
const START_PARAM = 'start_point';
const END_PARAM = 'end_point_segment';
const STRAND_PARAM = 'sequence_strand';
const EDA_SAMPLE_TABLE_SUFFIX_PARAM = 'eda_sample_table_suffix';
const DEFAULT_GENE_FLANK = 0;
const DEFAULT_VARIANT_FLANK = 1000;
const SEQUENCE_TYPE = 'dnaseq';
const MSA_FORMAT = 'clustal_guidetree';
const MSA_ALIGNER = 'mafft';
const MIN_SEGMENT_LENGTH = 10;
const MAX_SEGMENT_LENGTH = 150000;
const DEFAULT_PERCENT_ACTG = 90;
const MIN_PERCENT_ACTG = 10;
const MSA_DEFLINE_FORMAT = 'QUERYONLY';
const SYNC_FASTA_DEFLINE_FORMAT = 'QUERYANDREGION';
const SYNC_FASTA_BASES_PER_LINE = 60;

// Clustal Omega's runtime on this data is roughly linear in both sequence
// count and segment length (same-locus strain segments are near-identical
// apart from SNPs/small indels, so profile-profile merges stay close to
// diagonal rather than the O(L^2) worst case) — so budget a roughly
// constant sequenceCount * segmentLength product rather than gating on
// sequenceCount alone. PLACEHOLDER: not yet calibrated against real
// Clustal Omega run times; adjust once we have timings.
const MSA_RUNTIME_BUDGET_BASES = 50_000_000;
// Never let a very long segment drive the allowed sequence count below
// what's needed to make an alignment meaningful at all.
const MIN_BLOCK_THRESHOLD = 2;

// Adjacent radio/number-input labels are rendered as siblings with no
// wrapping element of their own; without an explicit gap, browsers give
// them no horizontal space beyond the label's own text.
const RADIO_ROW_STYLE = { display: 'flex', gap: '20px', alignItems: 'center' };

// A <button> and an <input type="submit"> both match this site's shared
// .btn styling (eupathdb-Buttons.scss), but browsers apply their own,
// different UA-default font/line-height to each element type underneath
// it — AllSites.scss's general <input> reset explicitly excludes
// type='submit', so it's never normalized to match <button>'s font.
// Pin the values .btn itself declares as inline styles (which win over
// any stylesheet regardless of that gap) so both submit paths render at
// an identical size no matter which native element backs them.
const SUBMIT_BUTTON_STYLE = {
  padding: '8px 12px',
  fontSize: '1em',
  lineHeight: '1em',
  fontFamily: 'inherit',
};

/**
 * eda_sample_table_suffix is a vocab param with exactly one valid term,
 * determined by the organism param (organismSinglePick) it depends on —
 * never a UI control, never user-editable, but its single term must still
 * be sent to the backend (unlike organismSinglePick/sequenceId, which the
 * backend already has via the record; this one the backend cannot derive
 * on its own). The WDK question flow refreshes this param's vocabulary
 * automatically whenever organismSinglePick changes (UPDATE_DEPENDENT_PARAMS),
 * so by submit time question.parametersByName reflects the correct,
 * organism-specific single-element vocabulary.
 */
function getEdaSampleTableSuffixTerm(
  parametersByName: Record<string, Parameter>
): string {
  const parameter = parametersByName[EDA_SAMPLE_TABLE_SUFFIX_PARAM];
  if (parameter == null || !('vocabulary' in parameter)) return '';
  const vocabulary = parameter.vocabulary;
  if (!Array.isArray(vocabulary) || vocabulary.length === 0) return '';
  const [term] = vocabulary[0];
  return term;
}

// The six client-known params plus eda_sample_table_suffix's single
// resolved vocab term, in the shape StrainSegmentsByMeta's
// searchConfig.parameters expects.
function buildSearchParameters(
  paramValues: Record<string, string>,
  parametersByName: Record<string, Parameter>
) {
  return {
    organismSinglePick: paramValues.organismSinglePick,
    sequenceId: paramValues.sequenceId,
    sequence_strand: paramValues.sequence_strand,
    start_point: paramValues.start_point,
    end_point_segment: paramValues.end_point_segment,
    variation_sample_meta: paramValues.variation_sample_meta,
    eda_sample_table_suffix: getEdaSampleTableSuffixTerm(parametersByName),
  };
}

type WdkRecord = {
  recordClassName: string;
  attributes: Record<string, string | null>;
};

// `flank` is the default number of bases to extend on each side of the
// region's anchor: the gene's start/end for a range, the variant's location
// for a point.
type Region =
  | { kind: 'range'; start: string; end: string; flank: number }
  | { kind: 'point'; location: string; flank: number };

export function isVariantRecord(record: WdkRecord): boolean {
  return record.recordClassName === 'VariantRecordClasses.VariantRecordClass';
}

/**
 * Gene has a natural start/end range (start_min/end_max); its region input
 * is a flank extending that range on both sides, defaulting to none.
 * Variant is a single point (location) with no range — its region input is
 * likewise a flank, symmetric around that point, defaulting to 1000nt each
 * direction. Pulled out as its own pure function so the render logic below
 * only has to switch on `region.kind`, not repeat the record-class check.
 */
export function deriveRegion(record: WdkRecord): Region {
  if (isVariantRecord(record)) {
    return {
      kind: 'point',
      location: record.attributes.location ?? '',
      flank: DEFAULT_VARIANT_FLANK,
    };
  }
  return {
    kind: 'range',
    start: record.attributes.start_min ?? '',
    end: record.attributes.end_max ?? '',
    flank: DEFAULT_GENE_FLANK,
  };
}

/** The [start, end] (inclusive) the region covers once `flank` is applied. */
function regionBounds(region: Region, flank: number): [string, string] {
  if (region.kind === 'range') {
    // start_min/end_max are empty until the record has loaded.
    if (region.start === '' || region.end === '') return ['', ''];
    return [
      String(Math.max(1, Number(region.start) - flank)),
      String(Number(region.end) + flank),
    ];
  }
  const location = Number(region.location);
  return [String(Math.max(1, location - flank)), String(location + flank)];
}

type Props = {
  record: WdkRecord;
  dispatch: DispatchAction;
  questionState: QuestionState | undefined;
};

const enhance = connect((state: RootState) => ({
  questionState: get(state.question, ['questions', SEARCH_NAME], undefined),
}));

export const StrainMsaForm = enhance(function StrainMsaForm(props: Props) {
  const { record, dispatch, questionState } = props;

  // Hooks must run unconditionally on every render (Rules of Hooks), so they
  // are called here, above the early returns below that gate on
  // questionState/filterParameter — even though their results are only used
  // once this function reaches the submit-handling logic further down.
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const [outputChoice, setOutputChoice] = useState<'fasta' | 'msa'>('msa');
  const [fastaSubmitError, setFastaSubmitError] = useState<string | null>(null);
  const [percentActg, setPercentActg] = useState(DEFAULT_PERCENT_ACTG);
  // The user-editable flank, in bases on each side of the region's anchor
  // (see Region). Seeded once from deriveRegion's default below, then driven
  // entirely by the user's own edits — never recomputed from the record
  // after that, so a keystroke here is never fought or reverted.
  const [flank, setFlank] = useState(() => deriveRegion(record).flank);
  // The raw text of the flank box, so it can be cleared (an empty box
  // counts as a flank of 0).
  const [flankText, setFlankText] = useState(() => String(flank));

  // Task 4's Redux epic deliberately doesn't seed start_point/end_point_segment
  // from the record (Gene's start_min/end_max, or Variant's location, each
  // +/- the flank above) — that's left to this component. Seed them once per
  // question load, not once per paramValues change — dispatching
  // updateParamValue for the user's own flank edits changes paramValues,
  // and a guard keyed on paramValues (or on questionState as a whole, which
  // changes reference whenever paramValues does) would re-fire this effect
  // on that same dispatch and clobber the edit right back to the default.
  //
  // observeStrainMsaFilter (the epic) re-dispatches updateActiveQuestion on
  // every RECORD_UPDATE, and a WDK record page's attributes/tables can load
  // in more than one batch — each RECORD_UPDATE restarts loadQuestion, which
  // resets paramValues to the bare model defaults (start_point defaults to
  // '1') and replaces questionState.question with a new object
  // (QUESTION_LOADED in QuestionStoreModule.ts) — unlike a plain
  // updateParamValue dispatch (UPDATE_PARAM_VALUE), which only ever changes
  // paramValues, leaving the same question object in place. Guarding on
  // `question`'s object identity therefore re-seeds exactly on a genuine
  // question (re)load, and never on a paramValues-only change from either
  // this component's own dispatches or the user's edits.
  const loadedQuestion = questionState?.question;
  const seededQuestionRef = useRef<typeof loadedQuestion>(undefined);

  useEffect(() => {
    if (seededQuestionRef.current === loadedQuestion) return;
    if (questionState == null || questionState.questionStatus !== 'complete')
      return;

    const { question, paramValues } = questionState;
    const region = deriveRegion(record);
    const [derivedStart, derivedEnd] = regionBounds(region, flank);

    seededQuestionRef.current = loadedQuestion;

    if (
      paramValues[START_PARAM] === derivedStart &&
      paramValues[END_PARAM] === derivedEnd
    ) {
      return;
    }

    const searchName = question.urlSegment;
    const startParameter = question.parametersByName[START_PARAM];
    const endParameter = question.parametersByName[END_PARAM];
    if (startParameter != null) {
      dispatch(
        QuestionActions.updateParamValue({
          searchName,
          parameter: startParameter,
          paramValues,
          paramValue: derivedStart,
        })
      );
    }
    if (endParameter != null) {
      dispatch(
        QuestionActions.updateParamValue({
          searchName,
          parameter: endParameter,
          paramValues,
          paramValue: derivedEnd,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedQuestion, questionState]);

  // Renders nothing until observeStrainMsaFilter has seeded this question.
  if (questionState == null || questionState.questionStatus !== 'complete')
    return null;

  const { question, paramValues, paramUIState } = questionState;
  const searchName = question.urlSegment;
  const filterParameter = question.parametersByName[METADATA_FILTER_PARAM];
  const filterUiState = paramUIState[METADATA_FILTER_PARAM];
  const filterValue = paramValues[METADATA_FILTER_PARAM];

  // FilterParamNew (the component) requires the parameter to be the
  // FilterParamNew parameter variant, not the general Parameter union.
  if (filterParameter == null || !isFilterParamNew(filterParameter))
    return null;

  const updateParam = (paramName: string, paramValue: string) => {
    const parameter = question.parametersByName[paramName];
    if (parameter == null) return;
    dispatch(
      QuestionActions.updateParamValue({
        searchName,
        parameter,
        paramValues,
        paramValue,
      })
    );
  };

  const region = deriveRegion(record);

  const handleFlankChange = (newFlank: number) => {
    setFlank(newFlank);
    const [start, end] = regionBounds(region, newFlank);
    updateParam(START_PARAM, start);
    updateParam(END_PARAM, end);
  };

  // Basic sanity guards — not a substitute for the backend's own
  // validation, just enough to catch obviously-nonsensical input (a
  // negative flank, or a segment length outside [MIN_SEGMENT_LENGTH,
  // MAX_SEGMENT_LENGTH]) before it's ever submitted. Start/End can briefly
  // be empty strings on the render
  // right after questionStatus first becomes 'complete', before the
  // region-seeding effect above has run — treated as "not yet seeded", not
  // "invalid", so no spurious error flashes during that one render.
  const startValue = Number(paramValues[START_PARAM]);
  const endValue = Number(paramValues[END_PARAM]);
  const hasSeededRange =
    region.kind === 'range' &&
    paramValues[START_PARAM] &&
    paramValues[END_PARAM];
  // end_point_segment/start_point are both inclusive, so the segment is
  // (end - start + 1) bases long; the flank control produces a segment
  // symmetric around the point, 2 * flank bases long.
  const segmentLength =
    region.kind === 'point'
      ? 2 * flank
      : hasSeededRange
      ? endValue - startValue + 1
      : null;

  const regionValidationError =
    flank < 0
      ? 'Flank must be 0 or greater.'
      : segmentLength != null && segmentLength < MIN_SEGMENT_LENGTH
      ? `Segment must be at least ${MIN_SEGMENT_LENGTH}bp.`
      : segmentLength != null && segmentLength > MAX_SEGMENT_LENGTH
      ? `Segment must be no more than ${MAX_SEGMENT_LENGTH}bp.`
      : null;

  const percentActgError =
    percentActg < MIN_PERCENT_ACTG
      ? `Minimum percent ACTG must be at least ${MIN_PERCENT_ACTG}.`
      : null;

  const hasValidationError =
    regionValidationError != null || percentActgError != null;

  // Undefined (segment length not yet known) falls back to
  // ClustalAlignmentForm's own DEFAULT_BLOCK_THRESHOLD.
  const dynamicBlockThreshold =
    segmentLength == null
      ? undefined
      : Math.max(
          MIN_BLOCK_THRESHOLD,
          Math.floor(MSA_RUNTIME_BUDGET_BASES / segmentLength)
        );

  const sequenceCount = filterUiState?.filteredCount ?? 0;
  // The mirror image of dynamicBlockThreshold: the region length that would
  // fit under the same budget at the current sequenceCount, purely for
  // display in ClustalAlignmentForm's block dialog. Undefined when
  // sequenceCount isn't yet known (0), matching dynamicBlockThreshold's own
  // "not yet known" convention.
  const maxSegmentLengthForCount =
    sequenceCount > 0
      ? Math.floor(MSA_RUNTIME_BUDGET_BASES / sequenceCount)
      : undefined;

  const searchConfig = {
    parameters: buildSearchParameters(paramValues, question.parametersByName),
  };

  const handleFastaSubmit = async () => {
    // Opened as the very first, synchronous statement of this handler, for
    // the same reason as handleMsaConfirm's resultTab below — see its
    // comment.
    const resultTab = window.open('about:blank', '_blank');
    setFastaSubmitError(null);
    try {
      const path = await wdkService.getTemporaryResultPath(
        { searchName, searchConfig },
        'bed',
        {}
      );
      const bedText = await fetchTemporaryResultText(path);
      const features = parseBedToFeatures(bedText);

      const api = SequenceRetrievalApi.getClient(
        SEQUENCE_RETRIEVAL_BASE_URL,
        wdkService
      );

      const fastaText = await submitSyncFastaRequest({
        api,
        sequenceType: SEQUENCE_TYPE,
        features,
        deflineFormat: SYNC_FASTA_DEFLINE_FORMAT,
        basesPerLine: SYNC_FASTA_BASES_PER_LINE,
        percentActg,
      });
      resultTab?.document?.write(`<pre>${fastaText}</pre>`);
    } catch (error) {
      if (resultTab) resultTab.close();
      setFastaSubmitError(
        error instanceof Error
          ? error.message
          : 'An error occurred while submitting the FASTA request.'
      );
    }
  };

  const handleMsaConfirm = async () => {
    // Open the result tab as the very first, synchronous statement of this
    // handler, before any await — otherwise, by the time the bed report
    // fetch/parse resolves, we're no longer inside the user gesture's call
    // stack and browsers may block window.open as a popup.
    const resultTab = window.open('about:blank', '_blank');
    // The tab sits blank for several seconds while the bed report is
    // fetched/parsed and the job is submitted (all awaited below, in
    // series) — write a placeholder so it isn't literally empty in the
    // meantime. submitClustalMsaJob replaces this entirely once the job
    // is submitted and it navigates to the real result page.
    resultTab?.document?.write('<p>Preparing your alignment…</p>');

    try {
      const path = await wdkService.getTemporaryResultPath(
        { searchName, searchConfig },
        'bed',
        { strainNamesUnique: true }
      );
      const bedText = await fetchTemporaryResultText(path);
      const features = parseBedToFeatures(bedText);

      const api = SequenceRetrievalApi.getClient(
        SEQUENCE_RETRIEVAL_BASE_URL,
        wdkService
      );

      await submitClustalMsaJob({
        api,
        sequenceType: SEQUENCE_TYPE,
        features,
        msaFormat: MSA_FORMAT,
        aligner: MSA_ALIGNER,
        resultRouteBase: `${rootUrl}/workspace/msa`,
        paramsSummary: `${features.length} Strain segments. Aligner: MAFFT. Output format: clustal`,
        resultTab,
        percentActg,
        deflineFormat: MSA_DEFLINE_FORMAT,
      });
    } catch (error) {
      // Only this function's own steps (bed-report fetch/parse) need
      // closing here — submitClustalMsaJob already closes resultTab itself
      // on its own failure (e.g. the actual job submission rejecting).
      if (resultTab && !resultTab.closed) resultTab.close();
      throw error;
    }
  };

  return (
    <div style={{ padding: '15px' }}>
      <div style={{ marginBottom: '15px' }}>
        <FilterParamNew
          ctx={{ searchName, parameter: filterParameter, paramValues }}
          parameter={filterParameter}
          value={filterValue}
          uiState={filterUiState}
          dispatch={dispatch}
          onParamValueChange={(newValue) =>
            updateParam(METADATA_FILTER_PARAM, newValue)
          }
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <strong style={{ fontSize: '1.2em' }}>
          View {sequenceCount} sample sequences
        </strong>
      </div>
      <div style={{ ...RADIO_ROW_STYLE, marginBottom: '15px' }}>
        <label>
          <input
            type="radio"
            name="output_choice"
            checked={outputChoice === 'fasta'}
            onChange={() => setOutputChoice('fasta')}
          />{' '}
          FASTA
        </label>
        <label>
          <input
            type="radio"
            name="output_choice"
            checked={outputChoice === 'msa'}
            onChange={() => setOutputChoice('msa')}
          />{' '}
          Multiple sequence alignment (MAFFT)
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <div style={RADIO_ROW_STYLE}>
          <label>
            Flank (nt){' '}
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              style={{ width: '8ch', marginLeft: '1em' }}
              value={flankText}
              onChange={(e) => {
                const text = sanitizeFlankInput(e.target.value);
                setFlankText(text);
                handleFlankChange(Number(text));
              }}
            />
          </label>
          {segmentLength != null && <span>({segmentLength}nt)</span>}
        </div>
        {regionValidationError && (
          <div role="alert" style={{ color: 'red', marginTop: '5px' }}>
            {regionValidationError}
          </div>
        )}
      </div>
      <div style={{ ...RADIO_ROW_STYLE, marginBottom: '15px' }}>
        <label>
          <input
            type="radio"
            name="sequence_strand"
            checked={(paramValues[STRAND_PARAM] ?? 'f') === 'f'}
            onChange={() => updateParam(STRAND_PARAM, 'f')}
          />{' '}
          Forward (+)
        </label>
        <label>
          <input
            type="radio"
            name="sequence_strand"
            checked={paramValues[STRAND_PARAM] === 'r'}
            onChange={() => updateParam(STRAND_PARAM, 'r')}
          />{' '}
          Reverse (-)
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Minimum percent ACTG:{' '}
          <input
            type="number"
            min={MIN_PERCENT_ACTG}
            max={100}
            value={percentActg}
            onChange={(e) => setPercentActg(Number(e.target.value))}
          />
        </label>{' '}
        <HelpIcon>
          Exclude sequences (eg, heavily masked) that are below this percent of
          A/C/T/G nucleotide values. Such sequences can disrupt the alignment
        </HelpIcon>
        {percentActgError && (
          <div role="alert" style={{ color: 'red', marginTop: '5px' }}>
            {percentActgError}
          </div>
        )}
      </div>
      <div style={{ minHeight: '38px' }}>
        {outputChoice === 'fasta' ? (
          <div>
            <button
              type="button"
              className="btn"
              style={SUBMIT_BUTTON_STYLE}
              disabled={hasValidationError}
              onClick={handleFastaSubmit}
            >
              Submit
            </button>
            {fastaSubmitError && (
              <div role="alert" style={{ color: 'red', marginTop: '10px' }}>
                {fastaSubmitError}
              </div>
            )}
          </div>
        ) : (
          <ClustalAlignmentForm
            action="about:blank"
            sequenceCount={sequenceCount}
            sequenceType="strain segments"
            onConfirm={handleMsaConfirm}
            blockThreshold={dynamicBlockThreshold}
            segmentLength={segmentLength ?? undefined}
            maxSegmentLength={maxSegmentLengthForCount}
          >
            <input
              type="submit"
              value="Submit"
              style={SUBMIT_BUTTON_STYLE}
              disabled={hasValidationError}
            />
          </ClustalAlignmentForm>
        )}
      </div>
    </div>
  );
});
