import React, { useCallback, useMemo } from 'react';

import { get } from 'lodash';

import { HelpIcon } from 'wdk-client/Components';
import { Parameter, ParameterGroup } from 'wdk-client/Utils/WdkModel';
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
            onFocus={
              radioParamSet.has(parameter.name) 
                ? () => {
                    updateActiveRadioParam(parameter.name);
                  }
                : undefined
            }
          >
            <div className={cx('ParameterHeading')}>
              {
                radioParamSet.has(parameter.name) && (
                  <input 
                    type="radio"
                    name="radio-param" 
                    className={cx('RadioParamElement')}
                    checked={parameter.name === activeRadioParam}
                    onChange={() => {
                      updateActiveRadioParam(parameter.name);
                    }}
                  />
                )
              }
              <h2>
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

const NONSENSE_VALUE = 'N/A';
const NONSENSE_VALUE_REGEX = /^(nil|N\/A)$/;

export const RadioParams: React.FunctionComponent<Props> = props => {
  const radioParams: string[] = get( 
    props.state.question.properties,
    'radio-params',
    []
  );
  const radioParamSet = useMemo(
    () => new Set(radioParams),
    [ radioParams ]
  );

  const initialRadioParam = radioParams.find(
    radioParam => {
      const radioParamValue = (props.state.paramValues[radioParam] || '').trim();
      
      return !!radioParamValue && !NONSENSE_VALUE_REGEX.test(radioParamValue)
    }
  ) || radioParams[0];

  const [ activeRadioParam, updateActiveRadioParam ] = React.useState(initialRadioParam);

  const renderParamGroup = useCallback((group: ParameterGroup, props: Props) => {
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
    }, 
    [ radioParamSet, activeRadioParam ]
  );

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    radioParams.forEach(radioParam => {
      if (radioParam !== activeRadioParam) {
        props.eventHandlers.updateParamValue({
          searchName: props.state.question.urlSegment,
          parameter: props.state.question.parametersByName[radioParam],
          paramValues: props.state.paramValues,
          paramValue: NONSENSE_VALUE
        });
      }
    });

    return true;
  }, [ props.state, props.eventHandlers.updateParamValue, activeRadioParam ]);

  return (
    <EbrcDefaultQuestionForm 
      {...props}
      renderParamGroup={renderParamGroup}
      onSubmit={onSubmit}
      validateForm={false}
    />
  );
};
