import React, { useState } from 'react';

import { changeGroupVisibility, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { Tabs } from 'wdk-client/Components';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { ParameterList } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { groupXorParametersByChromosomeAndSequenceID, keyForXorGroupingByChromosomeAndSequenceID } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/utils';

type EventHandlers = {
  setGroupVisibility: typeof changeGroupVisibility,
  updateParamValue: typeof updateParamValue
};

type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
  parameterElements: Record<string, React.ReactNode>;
};

export const MutuallyExclusiveParams: React.FunctionComponent<Props> = ({
  state,
  parameterElements
}) => {
  const [activeTab, onTabSelected] = useState('Chromosome');

  const xorGroupKey = keyForXorGroupingByChromosomeAndSequenceID(state);
  const xorGroupParameters = groupXorParametersByChromosomeAndSequenceID(state);

  const chromosomeParameters = xorGroupParameters['Chromosome'];
  const sequenceIdParameters = xorGroupParameters['Sequence ID'];

  return (
    <div>
      {
        state.question.groups
          .filter(group => group.displayType !== 'hidden')
          .map(group =>
            group.name !== xorGroupKey || !chromosomeParameters || !sequenceIdParameters
              ? (
                  <div>
                    <ParameterList
                      parameterMap={state.question.parametersByName}
                      parameterElements={parameterElements}
                      parameters={group.parameters}
                    />
                  </div>
                )
              : (
                <Tabs
                  key={group.name}
                  activeTab={activeTab}
                  onTabSelected={onTabSelected}
                  tabs={[
                    {
                      key: 'Chromosome',
                      display: 'Chromosome',
                      content: (
                        <div>
                          <ParameterList
                            parameterMap={state.question.parametersByName}
                            parameterElements={parameterElements}
                            parameters={chromosomeParameters}
                          />
                        </div>
                      )
                    },
                    {
                      key: 'Sequence ID',
                      display: 'Sequence ID',
                      content: (
                        <div>
                          <ParameterList
                            parameterMap={state.question.parametersByName}
                            parameterElements={parameterElements}
                            parameters={sequenceIdParameters}
                          />
                        </div>
                      )
                    },
                  ]}
                />
              )
          )
      }
    </div>
  );
};
