import Select from 'react-select';

import { ActionMeta, ValueType } from 'react-select/src/types';

import { ResultPanelController } from '@veupathdb/wdk-client/lib/Controllers';
import { AnswerSpecResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import { ReportSelect } from './ReportSelect';
import { StrategyLinkOut } from './StrategyLinkOut';

import './IndividualResult.scss';

export type Props =
  | { status: 'loading' }
  | { status: 'not-offered' }
  | {
      status: 'complete';
      answerResultConfig: AnswerSpecResultType;
      hitCountDescription: string;
      individualQueryOptions: IndividualQueryOption[];
      linkOutTooltipContent: string;
      onLinkOutClick?: () => void;
      onSelectedOptionChange: (
        options: ValueType<IndividualQueryOption, false>,
        actionMeta: ActionMeta<IndividualQueryOption>
      ) => void;
      selectedQueryOption: IndividualQueryOption;
      individualJobId: string;
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
          renderHeader={() => (
            <div className="Header">
              {props.individualQueryOptions.length > 1 && (
                <div className="IndividualQueryOptions">
                  Select a query sequence:{' '}
                  <Select
                    className="IndividualQuerySelect"
                    classNamePrefix="IndividualQuerySelect"
                    options={props.individualQueryOptions}
                    value={props.selectedQueryOption}
                    onChange={props.onSelectedOptionChange}
                  />
                </div>
              )}
              <div className="LinkOuts">
                <ReportSelect
                  jobId={props.individualJobId}
                  placeholder={
                    props.individualQueryOptions.length > 1
                      ? 'Download individual result'
                      : 'Download result'
                  }
                />
                <StrategyLinkOut
                  onClick={props.onLinkOutClick}
                  tooltipContent={props.linkOutTooltipContent}
                />
              </div>
              <p className="HitCountDescription">{props.hitCountDescription}</p>
            </div>
          )}
          resultType={props.answerResultConfig}
          viewId={props.viewId}
        />
      )}
    </div>
  );
}
