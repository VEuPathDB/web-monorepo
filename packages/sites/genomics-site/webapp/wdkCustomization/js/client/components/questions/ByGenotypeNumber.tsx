import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

import './ByGenotypeNumber.scss';

const cx = makeClassNameHelper('wdk-QuestionForm');

export const ByGenotypeNumber: React.FunctionComponent<Props> = props =>
  <EbrcDefaultQuestionForm {...props} containerClassName={`${cx()} ${cx('ByGenotypeNumber')}`} />;
  