import React from 'react';

import { Props, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

import { CompoundsByFoldChange, GenericFoldChange } from './FoldChange/foldChangeGroup';

const foldChangeForm = (FoldChangeComponent: React.FunctionComponent<Props>): React.FunctionComponent<Props> => (props: Props) =>
  <EbrcDefaultQuestionForm
    {...props}
    renderParamGroup={(group, formProps) =>
      group.displayType === 'dynamic'
        ? <FoldChangeComponent key={group.name} {...formProps} />
        : renderDefaultParamGroup(group, formProps)
    }
  />;

export const CompoundsByFoldChangeForm = foldChangeForm(CompoundsByFoldChange);
export const GenericFoldChangeForm = foldChangeForm(GenericFoldChange);
