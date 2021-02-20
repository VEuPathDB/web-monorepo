import { ResultPanelController } from '@veupathdb/wdk-client/lib/Controllers';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

export type Props =
  | { loading: true }
  | {
      loading: false;
      answerResultConfig: AnswerSpecResultType;
      viewId: string;
    };

export function IndividualResult(props: Props) {
  return (
    <div className="IndividualResult">
      {props.loading ? null : (
        <ResultPanelController
          resultType={props.answerResultConfig}
          viewId={props.viewId}
        />
      )}
    </div>
  );
}
