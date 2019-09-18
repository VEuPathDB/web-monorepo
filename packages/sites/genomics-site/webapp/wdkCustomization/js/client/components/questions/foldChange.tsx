import React from 'react';

import DefaultQuestionForm, { Props, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { CompoundsByFoldChange, GenericFoldChange } from 'wdk-client/Views/Question/Groups/FoldChange/foldChangeGroup';

const foldChangeForm = (FoldChangeComponent: React.FunctionComponent<Props>): React.FunctionComponent<Props> => (props: Props) =>
  <DefaultQuestionForm
    {...props}
    renderParamGroup={(group, formProps) =>
      group.name === 'dynamic'
        ? <FoldChangeComponent {...formProps} />
        : renderDefaultParamGroup(group, formProps)
    }
  />;

export const CompoundsByFoldChangeForm = foldChangeForm(CompoundsByFoldChange);
export const GenericFoldChangeForm = foldChangeForm(GenericFoldChange);
