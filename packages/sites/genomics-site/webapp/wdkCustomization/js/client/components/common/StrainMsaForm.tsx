import React, { useState } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { FilterParamNew } from '@veupathdb/wdk-client/lib/Components';
import { QuestionActions } from '@veupathdb/wdk-client/lib/Actions';
import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { DispatchAction } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { isType as isFilterParamNew } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { ClustalAlignmentForm } from '@veupathdb/web-common/lib/components';
import {
  fetchTemporaryResultText,
  parseBedToFeatures,
  submitClustalMsaJob,
} from '@veupathdb/web-common/lib/util/msaJobSubmission';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import { rootUrl } from '../../config';
import { SEQUENCE_RETRIEVAL_BASE_URL } from '../../util/computeJobConfig';

const SEARCH_NAME = 'StrainSegmentsByMeta';
const METADATA_FILTER_PARAM = 'variation_sample_meta';
const START_PARAM = 'start_point';
const END_PARAM = 'end_point_segment';
const STRAND_PARAM = 'sequence_strand';
const DEFAULT_VARIANT_OFFSET = 1000;
const SEQUENCE_TYPE = 'dnaseq';
const MSA_FORMAT = 'clustal';

// The six client-known params, in the shape StrainSegmentsByMeta's
// searchConfig.parameters expects. eda_sample_table_suffix is deliberately
// excluded — it is backend-set and must never be sent by the client.
function buildSearchParameters(paramValues: Record<string, string>) {
  return {
    organismSinglePick: paramValues.organismSinglePick,
    sequenceId: paramValues.sequenceId,
    sequence_strand: paramValues.sequence_strand,
    start_point: paramValues.start_point,
    end_point_segment: paramValues.end_point_segment,
    variation_sample_meta: paramValues.variation_sample_meta,
  };
}

type WdkRecord = {
  recordClassName: string;
  attributes: Record<string, string | null>;
};

type Region =
  | { kind: 'range'; start: string; end: string }
  | { kind: 'point'; location: string; offset: number };

/**
 * Gene has a natural start/end range (start_min/end_max) to default from.
 * Variant is a single point (location) with no range — its region input is
 * a symmetric offset around that point instead, defaulting to 1000nt each
 * direction. Pulled out as its own pure function so the render logic below
 * only has to switch on `region.kind`, not repeat the record-class check.
 */
export function deriveRegion(record: WdkRecord): Region {
  if (record.recordClassName === 'VariantRecordClasses.VariantRecordClass') {
    return {
      kind: 'point',
      location: record.attributes.location ?? '',
      offset: DEFAULT_VARIANT_OFFSET,
    };
  }
  return {
    kind: 'range',
    start: record.attributes.start_min ?? '',
    end: record.attributes.end_max ?? '',
  };
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

  const setOffset = (offset: number) => {
    if (region.kind !== 'point') return;
    const location = Number(region.location);
    updateParam(START_PARAM, String(location - offset));
    updateParam(END_PARAM, String(location + offset));
  };

  const searchConfig = { parameters: buildSearchParameters(paramValues) };

  const handleFastaSubmit = async () => {
    const resultTab = window.open('about:blank', '_blank');
    try {
      const path = await wdkService.getTemporaryResultPath(
        { searchName, searchConfig },
        'fasta',
        {}
      );
      const fastaText = await fetchTemporaryResultText(path);
      resultTab?.document?.write(`<pre>${fastaText}</pre>`);
    } catch (error) {
      if (resultTab) resultTab.close();
      throw error;
    }
  };

  const handleMsaConfirm = async () => {
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

    await submitClustalMsaJob({
      api,
      sequenceType: SEQUENCE_TYPE,
      features,
      msaFormat: MSA_FORMAT,
      resultRouteBase: `${rootUrl}/workspace/msa`,
      paramsSummary: `Strain segments, ${MSA_FORMAT.toUpperCase()} output format`,
    });
  };

  return (
    <div>
      {region.kind === 'range' ? (
        <div>
          <label>
            Start{' '}
            <input
              type="number"
              value={paramValues[START_PARAM] ?? ''}
              onChange={(e) => updateParam(START_PARAM, e.target.value)}
            />
          </label>
          <label>
            End{' '}
            <input
              type="number"
              value={paramValues[END_PARAM] ?? ''}
              onChange={(e) => updateParam(END_PARAM, e.target.value)}
            />
          </label>
        </div>
      ) : (
        <div>
          <label>
            Offset{' '}
            <input
              type="number"
              value={region.offset}
              onChange={(e) => setOffset(Number(e.target.value))}
            />
          </label>
        </div>
      )}
      <div>
        <label>
          <input
            type="radio"
            name="sequence_strand"
            checked={(paramValues[STRAND_PARAM] ?? '+') === '+'}
            onChange={() => updateParam(STRAND_PARAM, '+')}
          />{' '}
          Forward (+)
        </label>
        <label>
          <input
            type="radio"
            name="sequence_strand"
            checked={paramValues[STRAND_PARAM] === '-'}
            onChange={() => updateParam(STRAND_PARAM, '-')}
          />{' '}
          Reverse (-)
        </label>
      </div>
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
      <div>
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
          Multiple sequence alignment (Clustal Omega)
        </label>
      </div>
      {outputChoice === 'fasta' ? (
        <button type="button" onClick={handleFastaSubmit}>
          Submit
        </button>
      ) : (
        <ClustalAlignmentForm
          action="about:blank"
          sequenceCount={2}
          sequenceType="strain segments"
          onConfirm={handleMsaConfirm}
        >
          <input type="submit" value="Submit" />
        </ClustalAlignmentForm>
      )}
    </div>
  );
});
