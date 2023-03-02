import React, { useCallback, useMemo } from 'react';

import { get, fromPairs } from 'lodash';

import { HelpIcon, IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { Parameter, ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { makeClassNameHelper, safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { Props, Group } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { isMultiPick, toMultiValueString, toMultiValueArray } from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';

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
  paramDependenciesUpdating: Record<string, boolean>;
}

function RadioParameterList(props: RadioParameterListProps) {
  const {
    parameters,
    parameterMap,
    parameterElements,
    radioParamSet,
    activeRadioParam,
    updateActiveRadioParam,
    paramDependenciesUpdating
  } = props;

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
                    checked={parameter.name === activeRadioParam}
                    onChange={() => {
                      updateActiveRadioParam(parameter.name);
                    }}
                  />
                )
              }
              <h2>
                <HelpIcon>{safeHtml(parameter.help)}</HelpIcon> {parameter.displayName}
                {paramDependenciesUpdating[parameter.name] && <IconAlt fa="circle-o-notch" className="fa-spin fa-fw" />}
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

const NONSENSE_MULTIPICK_STRING = toMultiValueString([NONSENSE_VALUE]);

export const RadioParams: React.FunctionComponent<Props> = props => {
  const radioParams: string[] = get(
    props.state.question.properties,
    'radio-params',
    []
  );
  const radioParamSet = useMemo(
    () => new Set(radioParams),
    [radioParams]
  );

  const initialRadioParam = radioParams.find(
    radioParam => {
      const paramValueString = (props.state.paramValues[radioParam] || '').trim();

      if (isMultiPick(props.state.question.parametersByName[radioParam])) {
        const paramValue = toMultiValueArray(paramValueString);

        return paramValue.length > 0 && !NONSENSE_VALUE_REGEX.test(paramValue[0]);
      } else {
        return paramValueString.length > 0 && !NONSENSE_VALUE_REGEX.test(paramValueString);
      }
    }
  ) || radioParams[0];

  const [activeRadioParam, updateActiveRadioParam] = React.useState(initialRadioParam);

  const renderParamGroup = useCallback((group: ParameterGroup, props: Props) => {
    const {
      state: { question, groupUIState, paramsUpdatingDependencies },
      eventHandlers: { setGroupVisibility },
      parameterElements
    } = props;
    const paramDependenciesUpdating = fromPairs(
      question.parameters.filter(
        parameter => paramsUpdatingDependencies[parameter.name]
      ).flatMap(parameter => parameter.dependentParams.map(pn => [pn, true]))
    );

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
          paramDependenciesUpdating={paramDependenciesUpdating}
        />
      </Group>
    );
  },
    [radioParamSet, activeRadioParam]
  );

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    radioParams.forEach(radioParam => {
      if (radioParam !== activeRadioParam) {
        const parameter = props.state.question.parametersByName[radioParam];
        const paramValue = isMultiPick(parameter)
          ? NONSENSE_MULTIPICK_STRING
          : NONSENSE_VALUE

        props.eventHandlers.updateParamValue({
          searchName: props.state.question.urlSegment,
          parameter,
          paramValues: props.state.paramValues,
          paramValue
        });
      }
    });

    return true;
  }, [props.state, props.eventHandlers.updateParamValue, activeRadioParam]);

  return (
    <EbrcDefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      onSubmit={onSubmit}
      validateForm={false}
    />
  );
};
