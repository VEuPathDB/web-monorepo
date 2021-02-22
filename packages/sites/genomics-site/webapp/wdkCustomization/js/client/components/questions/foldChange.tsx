import React from 'react';

import { Props, renderDefaultParamGroup } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

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
