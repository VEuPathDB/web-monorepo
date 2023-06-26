import QuestionController, {
  Props,
} from '@veupathdb/wdk-client/lib/Controllers/QuestionController';

export function BlastQuestionController(props: Props) {
  return (
    <QuestionController {...props} prepopulateWithLastParamValues={false} />
  );
}
