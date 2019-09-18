import React from 'react';

import { get } from 'lodash';

import { HelpIcon } from 'wdk-client/Components';
import { Parameter } from 'wdk-client/Utils/WdkModel';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { Props, Group } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

import './RadioParams.scss';

const cx = makeClassNameHelper('wdk-QuestionForm');

type RadioParameterListProps = {
  parameters: string[];
  parameterMap: Record<string, Parameter>;
  parameterElements: Record<string, React.ReactNode>;
  radioParamSet: Set<string>;
  activeRadioParam: string;
  updateActiveRadioParam: (activeRadioParam: string) => void;
}

function RadioParameterList(props: RadioParameterListProps) {
  const { parameters, parameterMap, parameterElements, radioParamSet, activeRadioParam, updateActiveRadioParam } = props;
  return (
    <div className={cx('ParameterList')}>
      {Seq.from(parameters)
        .map(paramName => parameterMap[paramName])
        .map(parameter => (
          <div 
            key={parameter.name}
            className={
              radioParamSet.has(parameter.name) && parameter.name !== activeRadioParam
                ? 'wdk-InactiveRadioParam'
                : undefined
            }
          >
            <div className={cx('ParameterHeading')}>
              <h2>
                {
                  radioParamSet.has(parameter.name) &&
                  <input 
                    type="radio"
                    name="radio-param" 
                    checked={parameter.name === activeRadioParam}
                    onChange={e => {
                      if (
                        e.target.parentElement && 
                        e.target.parentElement.parentElement &&
                        e.target.parentElement.parentElement.parentElement
                      ) {
                        const paramInput: HTMLInputElement | null = 
                          e.target.parentElement.parentElement.parentElement.querySelector('input:not([type=radio])');

                        if (paramInput) {
                          paramInput.focus();
                        }
                      }

                      updateActiveRadioParam(parameter.name);
                    }}
                  />
                }
                <HelpIcon>{parameter.help}</HelpIcon> {parameter.displayName}
              </h2>
            </div>
            <div className={cx('ParameterControl')}>
              {parameterElements[parameter.name]}
            </div>
          </div>
        ))}
    </div>
  )
}

export const RadioParams: React.FunctionComponent<Props> = props => {
  const radioParams: string[] = get( 
    props.state.question.properties,
    'radio-params',
    []
  );
  const radioParamSet = new Set(radioParams);

  const [ activeRadioParam, updateActiveRadioParam ] = React.useState(radioParams[0] || '');

  return (
    <EbrcDefaultQuestionForm 
      {...props}
      renderParamGroup={(group, props) => {
        const { 
          state: { question, groupUIState },
          eventHandlers: { setGroupVisibility }, 
          parameterElements 
        } = props;

        return (
          <Group
            key={group.name}
            searchName={question.urlSegment}
            group={group}
            uiState={groupUIState}
            onVisibilityChange={setGroupVisibility}
          >
            <RadioParameterList
              parameterMap={question.parametersByName}
              parameterElements={parameterElements}
              parameters={group.parameters}
              radioParamSet={radioParamSet}
              activeRadioParam={activeRadioParam}
              updateActiveRadioParam={updateActiveRadioParam}
            />
          </Group>
        );
      }}
    />
  );
};
