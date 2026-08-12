import React from 'react';
import { connect } from 'react-redux';
import { get, pick } from 'lodash';
import { FilterParamNew } from '@veupathdb/wdk-client/lib/Components';
import { QuestionActions } from '@veupathdb/wdk-client/lib/Actions';

const headingStyle = {
  fontSize: '1.2em',
  fontWeight: 500,
  margin: '2rem 0 1rem',
};

const enhance = connect(({ question, globalData }) =>
  Object.assign(
    {
      questionState: get(question, ['questions', 'VariantAlignmentForm'], {}),
    },
    pick(globalData.config, 'projectId')
  )
);

export const VariantStrainFilter = enhance(function VariantStrainFilter(props) {
  let {
    dispatch,
    questionState: { questionStatus, question, paramValues, paramUIState },
  } = props;

  // Renders nothing until observeVariantStrainFilter has loaded the question. If the
  // epic does not fire, this section is silently blank - there is no error anywhere.
  if (questionStatus !== 'complete') return null;

  let searchName = question.urlSegment;
  let parameter = question.parametersByName.variant_strain_meta;
  let uiState = paramUIState.variant_strain_meta;
  let value = paramValues.variant_strain_meta;

  return (
    <div>
      <div style={headingStyle}>Select strains:</div>
      <FilterParamNew
        ctx={{ searchName, parameter, paramValues }}
        parameter={parameter}
        value={value}
        uiState={uiState}
        dispatch={dispatch}
        onParamValueChange={(newValue) => {
          dispatch(
            QuestionActions.updateParamValue({
              searchName,
              parameter,
              dependentParameters: [],
              paramValues,
              paramValue: newValue,
            })
          );
        }}
      />
    </div>
  );
});
