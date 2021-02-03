import { FormEvent, useCallback, useContext, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import DefaultQuestionForm, {
  ParameterList,
  Props,
  SubmitButton,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { useBlastApi } from '../hooks/api';
import {
  ADVANCED_PARAMS_GROUP_NAME,
  BLAST_ALGORITHM_PARAM_NAME,
  BLAST_DATABASE_ORGANISM_PARAM_NAME,
  BLAST_DATABASE_TYPE_PARAM_NAME,
  findParamsWhichDependOnlyOnBlastAlgorithm,
  isOmittedParam,
  organismParamValueToFilenames,
  paramValuesToBlastConfig,
} from '../utils/params';
import { fetchOrganismFilenameMap } from '../utils/organisms';

import { AdvancedParamGroup } from './AdvancedParamGroup';

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
      displayName: `Advanced ${selectedBlastAlgorithm.toUpperCase()} Parameters`,
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
        <AdvancedParamGroup
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
        </AdvancedParamGroup>
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

      const targetType =
        props.state.paramValues[BLAST_DATABASE_TYPE_PARAM_NAME];

      const targets = selectedOrganismFilenames.map((organism) => ({
        organism,
        target: `${organism}${targetType}`,
      }));

      const { jobId } = await api.createJob(
        projectId,
        targets,
        paramValuesToBlastConfig(props.state.paramValues)
      );

      setSubmitting(false);

      history.push(`/workspace/blast/result/${jobId}`);
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
