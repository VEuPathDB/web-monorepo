import React from 'react';

import { Props, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { CompoundsByFoldChange, GenericFoldChange } from 'wdk-client/Views/Question/Groups/FoldChange/foldChangeGroup';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

const foldChangeForm = (FoldChangeComponent: React.FunctionComponent<Props>): React.FunctionComponent<Props> => (props: Props) =>
  <EbrcDefaultQuestionForm
    {...props}
    renderParamGroup={(group, formProps) =>
      group.displayType === 'dynamic'
        ? <FoldChangeComponent {...formProps} />
        : renderDefaultParamGroup(group, formProps)
    }
  />;

export const CompoundsByFoldChangeForm = foldChangeForm(CompoundsByFoldChange);
export const GenericFoldChangeForm = foldChangeForm(GenericFoldChange);
