import { ResultPanelController } from '@veupathdb/wdk-client/lib/Controllers';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import './IndividualResult.scss';

export type Props =
  | { status: 'loading' }
  | { status: 'not-offered' }
  | {
      status: 'complete';
      answerResultConfig: AnswerSpecResultType;
      viewId: string;
    };

export function IndividualResult(props: Props) {
  return (
    <div className="IndividualResult">
      {props.status === 'loading' ? null : props.status === 'not-offered' ? (
        <p className="NotOffered">
          WDK results are unavailable for hits of this type.
        </p>
      ) : (
        <ResultPanelController
          resultType={props.answerResultConfig}
          viewId={props.viewId}
        />
      )}
    </div>
  );
}
