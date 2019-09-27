import React, { useCallback, useMemo, useState } from 'react';

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
  const [ activeTab, onTabSelected ] = useState<MutuallyExclusiveTabKey>('Chromosome');

  const mutuallyExclusiveSubgroup = useMemo(
    () => ({
      ...props.state.question.groupsByName[GROUP_NAME],
      parameters: props.state.question.groupsByName[GROUP_NAME].parameters.filter(parameter => parameter !== SPAN_ID_LIST_PARAM)
    }),
    [ props.state.question.groupsByName ]
  );

  const onClickAddLocation = useCallback(
    () => {
      const validationResult = validateNewLocation(props.state.paramValues, activeTab);
      const paramUIState = props.state.paramUIState[SPAN_ID_LIST_PARAM];

      if (validationResult.type === 'valid') {
        const idList = (paramUIState.idList || '').trim().length === 0
          ? validationResult.value
          : `${paramUIState.idList}, ${validationResult.value}`;

        props.dispatchAction(updateParamState({
          searchName: SEARCH_NAME,
          paramName: SPAN_ID_LIST_PARAM,
          paramState: {
            ...paramUIState,
            idList
          }
        }));
      } else {
        alert(validationResult.error);
      }
    },
    [ props.state.paramValues, props.state.paramUIState[SPAN_ID_LIST_PARAM], props.dispatchAction, activeTab ]
  );

  const renderParamGroup = useCallback(
    (group: ParameterGroup, props: Props) => (
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
    ), 
    [ activeTab, onTabSelected, onClickAddLocation, props.parameterElements[SPAN_ID_LIST_PARAM] ]
  );

  return (
    <EbrcDefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      validateForm={false}
    />
  );
};

const AddLocationButton = (props: { onClick: () => void }) =>
  <div className={cx('AddLocationButton')}>
    <span className={cx('AddLocationArrows')}>>>></span>
    <button type="button" onClick={props.onClick}>Add Location</button>
    <span className={cx('AddLocationArrows')}>>>></span>
  </div>

type NewLocationValidation = 
  | {
      type: 'valid',
      value: string
    }
  | {
      type: 'invalid',
      error: string
    };

const validateNewLocation = (paramValues: QuestionState['paramValues'], activeTab: MutuallyExclusiveTabKey): NewLocationValidation => {
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

  const startNumericValue = parseInt(startParamValue);
  const endNumericValue = parseInt(endParamValue);

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

const valid = (value: string): NewLocationValidation => ({
  type: 'valid',
  value
});

const invalid = (error: string): NewLocationValidation => ({
  type: 'invalid',
  error
});
