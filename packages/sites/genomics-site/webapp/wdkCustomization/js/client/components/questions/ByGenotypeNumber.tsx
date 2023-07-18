import React from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import './ByGenotypeNumber.scss';

const cx = makeClassNameHelper('wdk-QuestionForm');

export const ByGenotypeNumber: React.FunctionComponent<Props> = (props) => (
  <EbrcDefaultQuestionForm
    {...props}
    containerClassName={`${cx()} ${cx('ByGenotypeNumber')}`}
  />
);
