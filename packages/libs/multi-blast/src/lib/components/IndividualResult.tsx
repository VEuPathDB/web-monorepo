import Select from 'react-select';

import { ActionMeta, ValueType } from 'react-select/src/types';

import { ResultPanelController } from '@veupathdb/wdk-client/lib/Controllers';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import './IndividualResult.scss';

export type Props =
  | { status: 'loading' }
  | { status: 'not-offered' }
  | {
      status: 'complete';
      answerResultConfig: AnswerSpecResultType;
      individualQueryOptions: IndividualQueryOption[];
      onSelectedOptionChange: (
        options: ValueType<IndividualQueryOption, false>,
        actionMeta: ActionMeta<IndividualQueryOption>
      ) => void;
      selectedQueryOption: IndividualQueryOption;
      viewId: string;
    };

export interface IndividualQueryOption {
  value: number;
  label: string;
}

export function IndividualResult(props: Props) {
  return (
    <div className="IndividualResult">
      {props.status === 'loading' ? null : props.status === 'not-offered' ? (
        <p className="NotOffered">
          WDK results are unavailable for hits of this type.
        </p>
      ) : (
        <ResultPanelController
          renderHeader={
            props.individualQueryOptions.length > 1
              ? () => (
                  <Select
                    options={props.individualQueryOptions}
                    value={props.selectedQueryOption}
                    onChange={props.onSelectedOptionChange}
                  />
                )
              : undefined
          }
          resultType={props.answerResultConfig}
          viewId={props.viewId}
        />
      )}
    </div>
  );
}
