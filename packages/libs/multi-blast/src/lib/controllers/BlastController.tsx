import QuestionController, {
  OwnProps as Props,
} from '@veupathdb/wdk-client/lib/Controllers/QuestionController';

export function BlastController(props: Props) {
  return (
    <QuestionController {...props} prepopulateWithLastParamValues={false} />
  );
}
