import * as React from 'react';

import { ParameterGroup } from 'wdk-client/Utils/WdkModel';
import DefaultQuestionForm, { Props, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { CompoundsByFoldChange } from 'wdk-client/Views/Question/Groups/FoldChange/foldChangeGroup';

function renderParamGroup(group: ParameterGroup, formProps: Props) {
  return group.name === 'dynamic' ?
    ( <CompoundsByFoldChange {...formProps} /> ) :
    renderDefaultParamGroup(group, formProps);
}

export function CompoundsByFoldChangeForm(formProps: Props) {
  return <DefaultQuestionForm {...formProps} renderParamGroup={renderParamGroup}/>;
}
