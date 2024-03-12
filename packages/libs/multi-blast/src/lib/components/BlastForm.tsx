import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'react-router';

import { keyBy } from 'lodash';

import {
  ENABLE_SUBMISSION,
  EnableSubmissionAction,
  updateDependentParams,
} from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import {
  IconAlt,
  Loading,
  RadioList,
  TextArea,
} from '@veupathdb/wdk-client/lib/Components';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { scrollIntoView } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import {
  Parameter,
  ParameterGroup,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import DefaultQuestionForm, {
  ParameterList,
  Props as DefaultQuestionFormProps,
  SubmitButton,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import {
  makeParamDependenciesUpdating,
  useChangeParamValue,
  useDependentParamsAreUpdating,
} from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';

import { useBlastApi } from '../hooks/api';
import { useEnabledAlgorithms } from '../hooks/blastAlgorithms';
import {
  useAlgorithmParamProps,
  useDefaultAdvancedParams,
  useSequenceParamProps,
  useTargetParamProps,
} from '../hooks/params';
import { InputErrors } from '../utils/ServiceTypes';
import {
  ADVANCED_PARAMS_GROUP_NAME,
  ParamNames,
  isOmittedParam,
  organismParamValueToFilenames,
  transformOrganismParameter,
} from '../utils/params';
import { fetchOrganismToFilenameMaps } from '../utils/organisms';
import {
  TargetMetadataByDataType,
  targetTypeTermToDbName,
} from '../utils/targetTypes';
import { isBlastCompatibleWdkService } from '../utils/wdkServiceIntegration';

import { AdvancedParamGroup } from './AdvancedParamGroup';
import { BlastFormValidationInfo } from './BlastFormValidationInfo';

import './BlastForm.scss';
import { paramValuesToBlastQueryConfig } from '../utils/params-to-query-config';

export const blastFormCx = makeClassNameHelper('wdk-QuestionForm');

const EMPTY_QUERY_REGEX = /^\s*$/;
const SINGLE_QUERY_REGEX = /^(?!(.*>.*>.*)$).*$/s;
const BLAST_FORM_CONTAINER_NAME = 'MultiBlast';

export interface Props extends DefaultQuestionFormProps {
  canChangeRecordType?: boolean;
  isMultiBlast?: boolean;
}

export function BlastForm(props: Props) {
  const targetType = props.state.paramValues[ParamNames.BlastDatabaseType];
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const formPropsWithTransformedQuestion = transformFormQuestion(
    props,
    props.isMultiBlast,
    targetMetadataByDataType[targetType].recordClassUrlSegment
  );

  return (
    <BlastFormWithTransformedQuestion {...formPropsWithTransformedQuestion} />
  );
}

function BlastFormWithTransformedQuestion(props: Props) {
  const canChangeRecordType = props.canChangeRecordType ?? false;

  const targetType = props.state.paramValues[ParamNames.BlastDatabaseType];

  const selectedBlastAlgorithm =
    props.state.paramValues[ParamNames.BlastAlgorithm];

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
  }, [
    selectedBlastAlgorithm,
    props.state.question.groupsByName,
    props.state.question.parametersByName,
  ]);

  const enabledAlgorithms = useEnabledAlgorithms(targetType);

  const updateQueryParam = useChangeParamValue(
    props.state.question.parametersByName[ParamNames.BlastQuerySequence],
    props.state,
    props.eventHandlers.updateParamValue
  );

  const onQueryFileInputChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file =
        event.target.files == null || event.target.files.length === 0
          ? null
          : event.target.files[0];

      if (file != null) {
        file.text().then(updateQueryParam);
      }
    },
    [updateQueryParam]
  );

  const defaultAdvancedParamsMetadata = useDefaultAdvancedParams(
    props.state.question
  );

  const selectedBlastAlgorithmParameter =
    props.state.question.parametersByName[ParamNames.BlastAlgorithm];

  const searchName = props.state.question.urlSegment;
  const dispatchAction = props.dispatchAction;
  const paramValues = props.state.paramValues;

  const resetAdvancedParamGroupButtonProps = useMemo(() => {
    if (defaultAdvancedParamsMetadata == null) {
      return;
    }

    return {
      onClick: () => {
        dispatchAction(
          updateDependentParams({
            searchName,
            updatedParameter: selectedBlastAlgorithmParameter,
            refreshedDependentParameters:
              defaultAdvancedParamsMetadata[selectedBlastAlgorithm]
                .defaultParams,
          })
        );
      },
      disabled:
        defaultAdvancedParamsMetadata[
          selectedBlastAlgorithm
        ].areDefaultParamsSelected(paramValues),
    };
  }, [
    defaultAdvancedParamsMetadata,
    dispatchAction,
    paramValues,
    searchName,
    selectedBlastAlgorithm,
    selectedBlastAlgorithmParameter,
  ]);

  const targetParamProps = useTargetParamProps(
    props.state,
    props.eventHandlers.updateParamValue,
    canChangeRecordType
  );
  const algorithmParamProps = useAlgorithmParamProps(
    props.state,
    props.dispatchAction,
    defaultAdvancedParamsMetadata,
    enabledAlgorithms,
    canChangeRecordType
  );
  const sequenceParamProps = useSequenceParamProps(
    props.state,
    props.eventHandlers.updateParamValue
  );

  const targetParamElement = (
    <RadioList
      {...targetParamProps}
      name={`${props.state.question.urlSegment}/${ParamNames.BlastDatabaseType}`}
    />
  );
  const algorithmParamElement = (
    <RadioList
      {...algorithmParamProps}
      name={`${props.state.question.urlSegment}/${ParamNames.BlastAlgorithm}`}
    />
  );
  const sequenceParamElement = (
    <div className="SequenceParam">
      <div className="SequenceParamInstructions">
        {props.isMultiBlast
          ? 'Paste one or several sequences, or upload a FASTA file.'
          : 'Paste one sequence, or upload a one-sequence FASTA file.'}
      </div>
      <TextArea
        {...sequenceParamProps}
        name={`${props.state.question.urlSegment}/${ParamNames.BlastQuerySequence}`}
      />
      <input
        type="file"
        accept="text/*"
        name={`${props.state.question.urlSegment}/${ParamNames.BlastQuerySequence}__file`}
        onChange={onQueryFileInputChanged}
      />
    </div>
  );
  const dynamicOrganismParam =
    props.state.question.parametersByName[ParamNames.BlastDatabaseOrganism];
  const organismParamElement = (
    <Plugin
      context={{
        type: 'questionFormParameter',
        name: dynamicOrganismParam.name,
        paramName: dynamicOrganismParam.name,
        searchName: props.state.question.urlSegment,
        recordClassName: props.state.recordClass.urlSegment,
      }}
      pluginProps={{
        ctx: {
          searchName: props.state.question.urlSegment,
          parameter: dynamicOrganismParam,
          paramValues: props.state.paramValues,
        },
        parameter: dynamicOrganismParam,
        value: props.state.paramValues[ParamNames.BlastDatabaseOrganism],
        uiState: props.state.paramUIState[ParamNames.BlastDatabaseOrganism],
        onParamValueChange: (paramValue: string) => {
          props.eventHandlers.updateParamValue({
            searchName: props.state.question.urlSegment,
            parameter: dynamicOrganismParam,
            paramValues: props.state.paramValues,
            paramValue,
          });
        },
        dispatch: props.dispatchAction,
        isSearchPage: props.submissionMetadata.type === 'create-strategy',
      }}
    />
  );

  const parameterElements = {
    ...props.parameterElements,
    [ParamNames.BlastDatabaseType]: targetParamElement,
    [ParamNames.BlastAlgorithm]: algorithmParamElement,
    [ParamNames.BlastQuerySequence]: sequenceParamElement,
    [ParamNames.BlastDatabaseOrganism]: organismParamElement,
  };

  const renderBlastParamGroup = useCallback(
    (group: ParameterGroup, formProps: Props) => (
      <div key={group.name} className={blastFormCx('Group', group.name)}>
        {group.name !== ADVANCED_PARAMS_GROUP_NAME ? (
          renderDefaultParamGroup(group, formProps)
        ) : (
          <AdvancedParamGroup
            key={group.name}
            searchName={formProps.state.question.urlSegment}
            group={restrictedAdvancedParamGroup}
            uiState={formProps.state.groupUIState[group.name]}
            onVisibilityChange={formProps.eventHandlers.setGroupVisibility}
          >
            <>
              <button
                type="button"
                className="btn"
                {...resetAdvancedParamGroupButtonProps}
              >
                <IconAlt fa="refresh" />
                Reset Values
              </button>
              <ParameterList
                parameters={restrictedAdvancedParamGroup.parameters}
                parameterMap={formProps.state.question.parametersByName}
                parameterElements={formProps.parameterElements}
                paramDependenciesUpdating={makeParamDependenciesUpdating(
                  formProps.state.question,
                  formProps.state.paramsUpdatingDependencies
                )}
              />
            </>
          </AdvancedParamGroup>
        )}
      </div>
    ),
    [resetAdvancedParamGroupButtonProps, restrictedAdvancedParamGroup]
  );

  const containerClassName = `${blastFormCx()} ${blastFormCx(
    BLAST_FORM_CONTAINER_NAME
  )}`;

  const onSubmitSingleQueryQuestionForm = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = EMPTY_QUERY_REGEX.test(sequenceParamProps.value)
        ? 'Please provide a query sequence.'
        : !SINGLE_QUERY_REGEX.test(sequenceParamProps.value)
        ? 'Please limit your query to one sequence.'
        : null;

      if (validationError != null) {
        dispatchAction({
          type: ENABLE_SUBMISSION,
          payload: {
            searchName,
            stepValidation: {
              isValid: false,
              level: 'SYNTACTIC',
              errors: {
                general: [],
                byKey: {
                  [ParamNames.BlastQuerySequence]: [validationError],
                },
              },
            },
          },
        } as EnableSubmissionAction);

        return false;
      }

      return true;
    },
    [searchName, sequenceParamProps.value, dispatchAction]
  );

  return enabledAlgorithms == null || defaultAdvancedParamsMetadata == null ? (
    <Loading />
  ) : props.isMultiBlast ? (
    <NewJobForm
      {...props}
      containerClassName={containerClassName}
      parameterElements={parameterElements}
      renderParamGroup={renderBlastParamGroup}
    />
  ) : (
    <DefaultQuestionForm
      {...props}
      containerClassName={containerClassName}
      parameterElements={parameterElements}
      renderParamGroup={renderBlastParamGroup}
      onSubmit={onSubmitSingleQueryQuestionForm}
    />
  );
}

interface NewJobFormProps extends Props {
  renderParamGroup: (group: ParameterGroup, formProps: Props) => JSX.Element;
}

function NewJobForm(props: NewJobFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [inputErrors, setInputErrors] =
    useState<InputErrors | undefined>(undefined);
  const dependentParamsAreUpdating = useDependentParamsAreUpdating(
    props.state.question,
    props.state.paramsUpdatingDependencies
  );
  const submissionDisabled = dependentParamsAreUpdating;

  const api = useBlastApi();

  const wdkDependencies = useContext(WdkDependenciesContext);
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const history = useHistory();

  const onSubmit = useCallback(
    async (event: FormEvent) => {
      if (api == null) {
        throw new Error('To use this form, the BLAST api must be configured.');
      }

      if (wdkDependencies == null) {
        throw new Error(
          'To use this form, WdkDependendenciesContext must be configured.'
        );
      }

      if (!isBlastCompatibleWdkService(wdkDependencies.wdkService)) {
        throw new Error(
          'To use this form, the webapp must be configured with a BLAST-compatible WdkService.'
        );
      }

      event.preventDefault();

      if (submissionDisabled) {
        return false;
      }

      setSubmitting(true);

      const targetType = props.state.paramValues[ParamNames.BlastDatabaseType];

      const [projectId, { organismsToFiles }] = await Promise.all([
        wdkDependencies.wdkService
          .getConfig()
          .then(({ projectId }) => projectId),
        fetchOrganismToFilenameMaps(
          wdkDependencies.wdkService,
          targetType,
          targetMetadataByDataType
        ),
      ]);

      const dbTargetName = targetTypeTermToDbName(targetType);

      const selectedOrganismFilenames = organismParamValueToFilenames(
        props.state.paramValues[ParamNames.BlastDatabaseOrganism],
        organismsToFiles
      );

      const targets = selectedOrganismFilenames.map((organism) => ({
        targetDisplayName: organism,
        targetFile: `${organism}${dbTargetName}`,
      }));

      const createJobResult = await api.queryAPI.createJob(
        {
          jobConfig: {
            targets: targets,
            addToUserCollection: true,
            site: projectId,
          },
          blastConfig: paramValuesToBlastQueryConfig(props.state.paramValues),
          userMeta: {
            summary: props.state.paramValues[ParamNames.JobDescription],
          },
        },
        props.state.paramValues[ParamNames.BlastQuerySequence]
      );

      if (createJobResult.status === 'ok') {
        const jobId = createJobResult.value.queryJobID;

        setSubmitting(false);

        history.push(`/workspace/blast/result/${jobId}`);
      } else if (createJobResult.details.status === 'invalid-input') {
        setInputErrors(createJobResult.details.errors);

        if (containerRef.current != null) {
          scrollIntoView(containerRef.current);
        }

        setSubmitting(false);
      } else {
        setSubmitting(false);
      }
    },
    [
      api,
      history,
      targetMetadataByDataType,
      wdkDependencies,
      props.state.paramValues,
      submissionDisabled,
    ]
  );

  return api == null ? null : (
    <div className={props.containerClassName} ref={containerRef}>
      {inputErrors != null && <BlastFormValidationInfo errors={inputErrors} />}
      <form onSubmit={onSubmit}>
        {props.state.question.groups
          .filter((group) => group.displayType !== 'hidden')
          .map((group) => props.renderParamGroup(group, props))}
        <div className={blastFormCx('SubmitSection')}>
          <SubmitButton
            submissionMetadata={props.submissionMetadata}
            submitting={submitting}
            submitButtonText={props.submitButtonText}
            submissionDisabled={dependentParamsAreUpdating}
          />
        </div>
      </form>
    </div>
  );
}

function transformFormQuestion(
  formProps: Props,
  isMultiBlast: boolean = false,
  targetRecordType: string
): Props {
  const transformedParameters = formProps.state.question.parameters.reduce(
    (memo, parameter) => {
      if (parameter.name === ParamNames.JobDescription && !isMultiBlast) {
        return memo;
      } else if (
        parameter.name === ParamNames.BlastQuerySequence &&
        isMultiBlast
      ) {
        memo.push({
          ...parameter,
          displayName: 'Input Sequence(s)',
          help: `
              <p>Paste your Input Sequence(s) in the text box, or upload a FASTA file.</p>
              <a
                href='https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs&DOC_TYPE=BlastHelp#filter'
                target='_blank'
                rel="noreferrer"
              >
                Learn more about BLAST query inputs here.
              </a>
            `,
        });

        return memo;
      } else if (parameter.name === ParamNames.BlastDatabaseOrganism) {
        const organismParameter = transformOrganismParameter(
          parameter,
          targetRecordType
        );

        memo.push(organismParameter);

        return memo;
      } else {
        memo.push(parameter);

        return memo;
      }
    },
    [] as Parameter[]
  );

  const transformedParameterNames = new Set(
    transformedParameters.map(({ name }) => name)
  );

  const transformedGroups = formProps.state.question.groups.map((group) => {
    const transformedGroupParameters = group.parameters.filter((parameter) =>
      transformedParameterNames.has(parameter)
    );

    return {
      ...group,
      parameters: transformedGroupParameters,
    };
  });

  const transformedParametersByName = keyBy(transformedParameters, 'name');
  const transformedGroupsByName = keyBy(transformedGroups, 'name');

  return {
    ...formProps,
    state: {
      ...formProps.state,
      question: {
        ...formProps.state.question,
        parameters: transformedParameters,
        groups: transformedGroups,
        parametersByName: transformedParametersByName,
        groupsByName: transformedGroupsByName,
      },
    },
  };
}
