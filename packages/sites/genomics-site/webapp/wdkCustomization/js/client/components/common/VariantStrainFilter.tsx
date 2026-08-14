import { connect } from 'react-redux';
import { get } from 'lodash';
import { FilterParamNew } from '@veupathdb/wdk-client/lib/Components';
import { QuestionActions } from '@veupathdb/wdk-client/lib/Actions';
import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { DispatchAction } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { isType as isFilterParamNew } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils';

type Props = {
  dispatch: DispatchAction;
  questionState: QuestionState | undefined;
};

const enhance = connect((state: RootState) => ({
  questionState: get(
    state.question,
    ['questions', 'VariantAlignmentForm'],
    undefined
  ),
}));

export const VariantStrainFilter = enhance(function VariantStrainFilter(
  props: Props
) {
  let { dispatch, questionState } = props;

  // Renders nothing until observeVariantStrainFilter has loaded the question. If the
  // epic does not fire, this section is silently blank - there is no error anywhere.
  if (questionState == null || questionState.questionStatus !== 'complete')
    return null;

  let { question, paramValues, paramUIState } = questionState;
  let searchName = question.urlSegment;
  let parameter = question.parametersByName.variant_strain_meta;
  let uiState = paramUIState.variant_strain_meta;
  let value = paramValues.variant_strain_meta;

  // FilterParamNew (the component) requires the parameter to be the FilterParamNew
  // parameter variant, not the general Parameter union. The null check is not
  // redundant: noUncheckedIndexedAccess is off, so TS types this lookup as
  // always-present, and a missing key would make the guard throw on `.type`.
  if (parameter == null || !isFilterParamNew(parameter)) return null;

  return (
    <div>
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
              paramValues,
              paramValue: newValue,
            })
          );
        }}
      />
    </div>
  );
});
