import React, { useMemo, useState } from 'react';

import { updateParamState } from 'wdk-client/Actions/QuestionActions';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { Props, getSubmitButtonText } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { mutuallyExclusiveParamsGroupRenderer, MutuallyExclusiveTabKey } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

import './DynSpansBySourceId.scss';

const SEARCH_NAME = 'DynSpansBySourceId';
const GROUP_NAME = 'empty';
const [ MAX_SEGMENT_LENGTH, MAX_SEGMENT_LENGTH_DISPLAY ] = [ 100000, '100Kbps' ];
const CHROMOSOME_PARAM = 'chromosomeOptional';
const SEQUENCE_ID_PARAM = 'sequenceId';
const [ START_PARAM, END_PARAM ] = [ 'start_point','end_point_segment' ];
const STRAND_PARAM = 'sequence_strand';
const SPAN_ID_LIST_PARAM = 'span_id';

const cx = makeClassNameHelper('DynSpansBySourceId');

export const DynSpansBySourceId: React.FunctionComponent<Props> = props => {
  const spanIdParamUIState = props.state.paramUIState[SPAN_ID_LIST_PARAM];

  const [ activeTab, onTabSelected ] = useState<MutuallyExclusiveTabKey>('Chromosome');

  const mutuallyExclusiveSubgroup = useMemo(
    () => makeMutuallyExclusiveSubgroup(props.state.question.groupsByName),
    [ props.state.question.groupsByName ]
  );

  const onSubmit = useMemo(
    () => makeOnSubmit(spanIdParamUIState.sourceType, spanIdParamUIState.idList),
    [ spanIdParamUIState.sourceType, spanIdParamUIState.idList ]
  );

  const onClickAddLocation = useMemo(
    () => makeOnClickAddLocation(props.state.paramValues, activeTab, props.dispatchAction, spanIdParamUIState),
    [ props.state.paramValues, activeTab, props.dispatchAction, spanIdParamUIState ]
  );

  const renderParamGroup = useMemo(
    () => makeRenderParamGroup(mutuallyExclusiveSubgroup, activeTab, onTabSelected, onClickAddLocation),
    [ mutuallyExclusiveSubgroup, activeTab, onTabSelected, onClickAddLocation ]
  );
  
  return (
    <EbrcDefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      validateForm={false}
      onSubmit={onSubmit}
    />
  );
};

const makeMutuallyExclusiveSubgroup = (groupsByName: QuestionState['question']['groupsByName']) => ({
  ...groupsByName[GROUP_NAME],
  parameters: groupsByName[GROUP_NAME].parameters.filter(parameter => parameter !== SPAN_ID_LIST_PARAM)
});

const makeOnSubmit = (sourceType: string, idList?: string) => (e: React.FormEvent) => {
  e.preventDefault();

  if (sourceType !== 'idList') {
    return true;
  }

  const idListValidation = validateIdList(idList);

  if (idListValidation.type === 'invalid') {
    alert(idListValidation.error);
  }

  return idListValidation.type === 'valid';
};

const makeOnClickAddLocation = (
  paramValues: QuestionState['paramValues'], 
  activeTab: MutuallyExclusiveTabKey,
  dispatchAction: Props['dispatchAction'],
  spanIdParamUIState: QuestionState['paramUIState'][typeof SPAN_ID_LIST_PARAM]
) => () => {
  const validationResult = validateNewLocation(paramValues, activeTab);

  if (validationResult.type === 'valid') {
    const idList = (spanIdParamUIState.idList || '').trim().length === 0
      ? validationResult.value
      : `${spanIdParamUIState.idList}, ${validationResult.value}`;

    dispatchAction(updateParamState({
      searchName: SEARCH_NAME,
      paramName: SPAN_ID_LIST_PARAM,
      paramState: {
        ...spanIdParamUIState,
        idList
      }
    }));
  } else {
    alert(validationResult.error);
  }
};

const makeRenderParamGroup = (
  mutuallyExclusiveSubgroup: ParameterGroup, 
  activeTab: MutuallyExclusiveTabKey, 
  onTabSelected: (tab: MutuallyExclusiveTabKey) => void, 
  onClickAddLocation: () => void
) => (group: ParameterGroup, props: Props) => (
  <div className={cx('ParamGroup')}>
    <div className={cx('MutuallyExclusiveParams')}>
      <h4 className={cx('PhaseHeader')}>
        1. Generate a list of segment IDs
      </h4>
      {mutuallyExclusiveParamsGroupRenderer(mutuallyExclusiveSubgroup, props, activeTab, onTabSelected)}
      <AddLocationButton onClick={onClickAddLocation} />
      <div className={cx('Instructions')}>
        <ul>
          <li>
            The max length of each segment is {MAX_SEGMENT_LENGTH_DISPLAY}
          </li>
          <li>
            <span className={cx('ParamName')}>
              End Location
            </span>
            {' '}
            cannot be smaller than 
            {' '}
            <span className={cx('ParamName')}>
              Start at
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div className={cx('SpanIdListParam')}>
      <h4 className={cx('PhaseHeader')}>
        2. When your list is ready, click the 
        "{getSubmitButtonText(props.submissionMetadata, props.submitButtonText)}" 
        button below
      </h4>
      <div className={cx('Instructions')}>
        You may also enter genomic segments, delimited by commas, semicolons, or whitespace, directly into the box below.
        The format of a segment is:

        <div className={cx('Format')}>
          sequence_id:start-end:strand
        </div>
        <div className={cx('Example')}>
          (Examples: TGME49_chrIa:10000-10500:f, Pf3D7_04:100-200:r)
        </div>
      </div>
      {props.parameterElements[SPAN_ID_LIST_PARAM]}
    </div>
  </div>
);

const AddLocationButton = (props: { onClick: () => void }) =>
  <div className={cx('AddLocationButton')}>
    <span className={cx('AddLocationArrows')}>>>></span>
    <button type="button" onClick={props.onClick}>Add Location</button>
    <span className={cx('AddLocationArrows')}>>>></span>
  </div>

type Validation =
  | {
      type: "valid";
      value: string;
    }
  | {
      type: "invalid";
      error: string;
    };

const valid = (value: string): Validation => ({
  type: "valid",
  value
});

const invalid = (error: string): Validation => ({
  type: "invalid",
  error
});

const validateNewLocation = (paramValues: QuestionState['paramValues'], activeTab: MutuallyExclusiveTabKey): Validation => {
  const { 
    [CHROMOSOME_PARAM]: chromosomeParamValue, 
    [SEQUENCE_ID_PARAM]: sequenceIdParamValue,
    [START_PARAM]: startParamValue, 
    [END_PARAM]: endParamValue,
    [STRAND_PARAM]: sequenceStrandParamValue
  } = paramValues;

  if (
    activeTab === 'Chromosome' && 
    (
      !chromosomeParamValue ||
      chromosomeParamValue === 'Choose chromosome'
    )
  ) {
    return invalid('Please select a chromosome (or Search by Sequence ID)');
  } 
  
  if (
    activeTab === 'Sequence ID' && 
    (
      !sequenceIdParamValue ||
      sequenceIdParamValue.startsWith('(Example')
    )
  ) {
    return invalid('Please input a sequence ID (or Search by Chromosome)');
  }

  if (!startParamValue) {
    return invalid('Please input a "Start at" value');
  }

  if (!endParamValue) {
    return invalid('Please input an "End Location" value');
  }

  const startNumericValue = +startParamValue;
  const endNumericValue = +endParamValue;

  if (Number.isNaN(startNumericValue)) {
    return invalid('"Start at" should be numeric');
  }

  if (Number.isNaN(endNumericValue)) {
    return invalid('"End location" should be numeric');
  }

  if (endNumericValue < startNumericValue) {
    return invalid('"End location" cannot be smaller than "Start at"');
  }

  if (endNumericValue - startNumericValue >= MAX_SEGMENT_LENGTH) {
    return invalid(`Your segment cannot be longer than ${MAX_SEGMENT_LENGTH_DISPLAY}`);
  }

  const sequenceString = activeTab === 'Chromosome' ? chromosomeParamValue : sequenceIdParamValue

  return valid(`${sequenceString}:${startNumericValue}-${endNumericValue}:${sequenceStrandParamValue}`);
};

const validateIdList = (idList?: string): Validation => {
  const segmentIds = (idList || "")
    .split(/[;,\s]+/g)
    .filter(id => id.length > 0);

  if (segmentIds.length === 0) {
    return invalid("Your list should have at least one segment id");
  }

  return segmentIds.reduce(
    (memo, segmentId) => {
      if (memo.type === "invalid") {
        return memo;
      }

      const segmentIdValidity = validateSegmentId(segmentId);

      return segmentIdValidity.type === "invalid" ? segmentIdValidity : memo;
    },
    { type: "valid", value: segmentIds.join(",") } as Validation
  );
};

const validateSegmentId = (segmentId: string): Validation => {
  const [chromosome, range, strand, ...restIdTokens] = segmentId.split(":");

  if (!chromosome) {
    return invalid(`Your segment ID "${segmentId}" is missing a chromosome`);
  } else if (!range) {
    return invalid(`Your segment ID "${segmentId}" is missing a range`);
  } else if (!strand) {
    return invalid(`Your segment ID "${segmentId}" is missing a strand`);
  } else if (restIdTokens.length > 0) {
    return invalid(`Your segment ID "${segmentId}" has extraneous input ${restIdTokens.join(';')}`);
  }

  const [ start, end, ...restRangeTokens ] = range.split('-');

  if (!start) {
    return invalid(`The range for your segment ID "${segmentId}" is missing a start value`)
  } else if (!end) {
    return invalid(`The range for your segment ID "${segmentId}" is missing an end value`)
  } else if (restRangeTokens.length > 0) {
    return invalid(`Your segment ID "${segmentId}" has extraneous input "${restRangeTokens.join('-')}"`);
  } else if (Number.isNaN(+start)) {
    return invalid(`Your segment ID "${segmentId}" has a non-numeric start value "${start}"`);
  } else if (Number.isNaN(+end)) {
    return invalid(`Your segment ID "${segmentId}" has a non-numeric end value "${start}"`);
  }

  const startNumericValue = +start;
  const endNumericValue = +end;

  if (endNumericValue < startNumericValue) {
    return invalid(`Your segment ID "${segmentId}" has an end "${endNumericValue}" which is smaller than its start "${startNumericValue}"`);
  } else if (endNumericValue - startNumericValue >= MAX_SEGMENT_LENGTH) {
    return invalid(`Your segment ID "${segmentId}" is longer than the maximum supported length of ${MAX_SEGMENT_LENGTH_DISPLAY}`);
  }

  return strand !== 'f' && strand !== 'r'
    ? invalid(`Your segment ID ${segmentId} has an invalid strand "${strand}"`)
    : valid(segmentId);
};
