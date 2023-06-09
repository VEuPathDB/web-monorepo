import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { QuestionWithParameters } from '../Utils/WdkModel';

export const requestQuestionWithParameters = makeActionCreator(
  'questions-with-parameters/request',
  (name: string) => ({ name })
);

export const loadQuestionWithParameters = makeActionCreator(
  'question-with-parameters/load',
  (name: string) => ({ name })
);

export const fulfillQuestionWithParameters = makeActionCreator(
  'question-with-parameters/fulfill',
  (name: string, questionWithParameters: QuestionWithParameters) => ({
    name,
    questionWithParameters,
  })
);

export type Action =
  | InferAction<typeof requestQuestionWithParameters>
  | InferAction<typeof loadQuestionWithParameters>
  | InferAction<typeof fulfillQuestionWithParameters>;
