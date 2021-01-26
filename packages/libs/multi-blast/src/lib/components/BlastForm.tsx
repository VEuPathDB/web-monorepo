import { FormEvent, useCallback, useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { isEnumParam } from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';
import { QuestionWithMappedParameters } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  Parameter,
  ParameterGroup,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import DefaultQuestionForm, {
  ParameterList,
  Props,
  SubmitButton,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import {
  changeGroupVisibility,
  updateParamValue,
} from '@veupathdb/wdk-client/lib/Actions/QuestionActions';

import { useBlastApi } from '../utils/hooks';
import {
  BLAST_ALGORITHM_PARAM_NAME,
  BLAST_DATABASE_ORGANISM_PARAM_NAME,
  organismParamValueToFilenames,
  paramValuesToBlastConfig,
} from '../utils/params';
import { fetchOrganismFilenameMap } from '../utils/organisms';

const ADVANCED_PARAMS_GROUP_NAME = 'advancedParams';

const OMIT_PARAM_TERM = 'none';

export const blastFormCx = makeClassNameHelper('wdk-QuestionForm');

export function BlastForm(props: Props) {
  const selectedBlastAlgorithm =
    props.state.paramValues[BLAST_ALGORITHM_PARAM_NAME];

  const paramsWhichDependOnlyOnBlastAlgorithm = useMemo(
    () => findParamsWhichDependOnlyOnBlastAlgorithm(props.state.question),
    [props.state.question]
  );

  const advancedParamGroupChanging = useMemo(
    () =>
      paramsWhichDependOnlyOnBlastAlgorithm.some(
        (paramName) => props.state.paramDependenciesUpdating[paramName]
      ),
    [selectedBlastAlgorithm, props.state.paramDependenciesUpdating]
  );

  const restrictedAdvancedParamGroup = useMemo(() => {
    const fullAdvancedParamGroup =
      props.state.question.groupsByName[ADVANCED_PARAMS_GROUP_NAME];

    return {
      ...fullAdvancedParamGroup,
      parameters: fullAdvancedParamGroup.parameters.filter(
        (paramName) =>
          !isOmittedParam(props.state.question.parametersByName[paramName])
      ),
    };
  }, [selectedBlastAlgorithm, advancedParamGroupChanging]);

  const renderBlastParamGroup = useCallback(
    (group: ParameterGroup, formProps: Props) =>
      group.name !== ADVANCED_PARAMS_GROUP_NAME ? (
        renderDefaultParamGroup(group, formProps)
      ) : (
        <ShowHideGroup
          disabled={advancedParamGroupChanging}
          key={group.name}
          searchName={formProps.state.question.urlSegment}
          group={restrictedAdvancedParamGroup}
          uiState={
            !advancedParamGroupChanging
              ? formProps.state.groupUIState[group.name]
              : {
                  ...formProps.state.groupUIState[group.name],
                  isVisible: false,
                }
          }
          onVisibilityChange={formProps.eventHandlers.setGroupVisibility}
        >
          <ParameterList
            parameters={restrictedAdvancedParamGroup.parameters}
            parameterMap={formProps.state.question.parametersByName}
            parameterElements={formProps.parameterElements}
            paramDependenciesUpdating={
              formProps.state.paramDependenciesUpdating
            }
          />
        </ShowHideGroup>
      ),
    [restrictedAdvancedParamGroup]
  );

  return props.submissionMetadata.type === 'create-strategy' ? (
    <NewJobForm {...props} renderParamGroup={renderBlastParamGroup} />
  ) : (
    <DefaultQuestionForm {...props} renderParamGroup={renderBlastParamGroup} />
  );
}

interface NewJobFormProps extends Props {
  renderParamGroup: (group: ParameterGroup, formProps: Props) => JSX.Element;
}

function NewJobForm(props: NewJobFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const api = useBlastApi();

  const wdkDependencies = useContext(WdkDepdendenciesContext);

  const history = useHistory();

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      if (wdkDependencies == null) {
        throw new Error(
          'To use this form, WdkDependendenciesContext must be configured'
        );
      }

      e.preventDefault();

      setSubmitting(true);

      const [projectId, organismFilenameMap] = await Promise.all([
        wdkDependencies.wdkService
          .getConfig()
          .then(({ projectId }) => projectId),
        fetchOrganismFilenameMap(wdkDependencies.wdkService),
      ]);

      const selectedOrganismFilenames = organismParamValueToFilenames(
        props.state.paramValues[BLAST_DATABASE_ORGANISM_PARAM_NAME],
        organismFilenameMap
      );

      // const { jobId } = await api.createJob(projectId, undefined, undefined, paramValuesToBlastConfig(props.state.paramValues));

      setSubmitting(false);

      history.push(
        // `/workspace/blast/result/${jobId}`
        `/workspace/blast/result/24D999A7223980871D8BE884375098F78868370C446C879B7DB4B44DCC7CFCBA`
      );
    },
    [api, history, wdkDependencies, props.state.paramValues]
  );

  return (
    <div className={blastFormCx()}>
      <form onSubmit={onSubmit}>
        {props.state.question.groups
          .filter((group) => group.displayType !== 'hidden')
          .map((group) => props.renderParamGroup(group, props))}
        <div className={blastFormCx('SubmitSection')}>
          <SubmitButton
            submissionMetadata={props.submissionMetadata}
            submitting={submitting}
            submitButtonText={props.submitButtonText}
          />
        </div>
      </form>
    </div>
  );
}

function isOmittedParam(param?: Parameter) {
  return param == null || !isEnumParam(param) || param.displayType === 'treeBox'
    ? false
    : param.vocabulary.length === 1 &&
        param.vocabulary[0][0] === OMIT_PARAM_TERM;
}

function computeParamDependencies(question: QuestionWithMappedParameters) {
  return question.parameters.reduce((memo, param) => {
    param.dependentParams.forEach((depedendentParam) => {
      if (!memo.has(depedendentParam)) {
        memo.set(depedendentParam, new Set());
      }

      memo.get(depedendentParam)?.add(param.name);
    });

    return memo;
  }, new Map<string, Set<string>>());
}

function findParamsWhichDependOnlyOnBlastAlgorithm(
  question: QuestionWithMappedParameters
) {
  const paramDependencies = computeParamDependencies(question);

  const values = [...paramDependencies.entries()];

  return values
    .filter(
      ([, dependencies]) =>
        dependencies.size === 1 && dependencies.has(BLAST_ALGORITHM_PARAM_NAME)
    )
    .map(([paramName]) => paramName);
}

type EventHandlers = {
  setGroupVisibility: typeof changeGroupVisibility;
  updateParamValue: typeof updateParamValue;
};

type GroupProps = {
  searchName: string;
  group: ParameterGroup;
  uiState: any;
  onVisibilityChange: EventHandlers['setGroupVisibility'];
  children: React.ReactChild;
  disabled?: boolean;
};

function ShowHideGroup(props: GroupProps) {
  const {
    searchName,
    group,
    uiState: { isVisible },
    onVisibilityChange,
    disabled = false,
  } = props;
  return (
    <div className={blastFormCx('ShowHideGroup')}>
      <button
        disabled={disabled}
        type="button"
        className={blastFormCx('ShowHideGroupToggle')}
        onClick={() => {
          onVisibilityChange({
            searchName,
            groupName: group.name,
            isVisible: !isVisible,
          });
        }}
      >
        <IconAlt fa={`caret-${isVisible ? 'down' : 'right'}`} />{' '}
        {group.displayName}
      </button>
      <div className={blastFormCx('ShowHideGroupContent')}>
        {isVisible ? props.children : null}
      </div>
    </div>
  );
}
