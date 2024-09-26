import {
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
import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { scrollIntoView } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import {
  Parameter,
  ParameterGroup,
  SelectEnumParam,
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
  BLAST_ALGORITHM_PARAM_NAME,
  BLAST_DATABASE_ORGANISM_PARAM_NAME,
  BLAST_DATABASE_TYPE_PARAM_NAME,
  BLAST_QUERY_SEQUENCE_PARAM_NAME,
  JOB_DESCRIPTION_PARAM_NAME,
  isOmittedParam,
  organismParamValueToFilenames,
  paramValuesToBlastConfig,
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
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

export const blastFormCx = makeClassNameHelper('wdk-QuestionForm');

const EMPTY_QUERY_REGEX = /^\s*$/;
const SINGLE_QUERY_REGEX = /^(?!(.*>.*>.*)$).*$/s;
const BLAST_FORM_CONTAINER_NAME = 'MultiBlast';

export interface Props extends DefaultQuestionFormProps {
  canChangeRecordType?: boolean;
  isMultiBlast?: boolean;
}

interface TransformedProps extends Props {
  originalQuestion: Props['state']['question'];
}

export function BlastForm(props: Props) {
  const targetType = props.state.paramValues[BLAST_DATABASE_TYPE_PARAM_NAME];
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

function BlastFormWithTransformedQuestion(props: TransformedProps) {
  const canChangeRecordType = props.canChangeRecordType ?? false;

  const targetType = props.state.paramValues[BLAST_DATABASE_TYPE_PARAM_NAME];

  const blastAlgorithmParameter = props.state.question.parametersByName[
    BLAST_ALGORITHM_PARAM_NAME
  ] as SelectEnumParam;

  const selectedBlastAlgorithm =
    props.state.paramValues[BLAST_ALGORITHM_PARAM_NAME];

  const selectedBlastAlgorithmDisplay =
    blastAlgorithmParameter.vocabulary.find(
      ([term]) => term === selectedBlastAlgorithm
    )?.[1] ?? selectedBlastAlgorithm;

  const restrictedAdvancedParamGroup = useMemo(() => {
    const fullAdvancedParamGroup =
      props.state.question.groupsByName[ADVANCED_PARAMS_GROUP_NAME];

    if (fullAdvancedParamGroup == null) {
      return undefined;
    }

    return {
      ...fullAdvancedParamGroup,
      displayName: `Advanced ${selectedBlastAlgorithmDisplay.toUpperCase()} Parameters`,
      parameters: fullAdvancedParamGroup.parameters.filter(
        (paramName) =>
          !isOmittedParam(props.state.question.parametersByName[paramName])
      ),
    };
  }, [
    selectedBlastAlgorithmDisplay,
    props.state.question.groupsByName,
    props.state.question.parametersByName,
  ]);

  const enabledAlgorithms = useEnabledAlgorithms(targetType);

  const defaultAdvancedParamsMetadata = useDefaultAdvancedParams(
    props.state.question
  );

  const selectedBlastAlgorithmParameter =
    props.state.question.parametersByName[BLAST_ALGORITHM_PARAM_NAME];

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

  const enableSequenceTextArea =
    !props.state.question.parametersByName[
      BLAST_QUERY_SEQUENCE_PARAM_NAME
    ]?.properties?.['multiBlastOptions']?.includes('fileOnly');

  const targetParamElement = (
    <RadioList
      {...targetParamProps}
      name={`${props.state.question.urlSegment}/${BLAST_DATABASE_TYPE_PARAM_NAME}`}
    />
  );
  const algorithmParamElement = (
    <RadioList
      {...algorithmParamProps}
      name={`${props.state.question.urlSegment}/${BLAST_ALGORITHM_PARAM_NAME}`}
    />
  );
  const sequenceParamElement = (
    <div className="SequenceParam">
      <div className="SequenceParamInstructions">
        {props.originalQuestion.parametersByName[
          BLAST_QUERY_SEQUENCE_PARAM_NAME
        ]?.visibleHelp ??
          (enableSequenceTextArea
            ? props.isMultiBlast
              ? 'Paste one or several sequences, or upload a FASTA file. If both are provided, the file will be used.'
              : 'Paste one sequence, or upload a one-sequence FASTA file. If both are provided, the file will be used.'
            : props.isMultiBlast
            ? 'Upload a FASTA file.'
            : 'Upload a one-sequence FASTA file.')}
      </div>
      {enableSequenceTextArea && (
        <TextArea
          {...sequenceParamProps}
          name={`${props.state.question.urlSegment}/${BLAST_QUERY_SEQUENCE_PARAM_NAME}`}
        />
      )}
      <input
        type="file"
        accept="*"
        name={`${props.state.question.urlSegment}/${BLAST_QUERY_SEQUENCE_PARAM_NAME}__file`}
      />
    </div>
  );
  const dynamicOrganismParam =
    props.state.question.parametersByName[BLAST_DATABASE_ORGANISM_PARAM_NAME];
  const organismParamElement = dynamicOrganismParam && (
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
        value: props.state.paramValues[BLAST_DATABASE_ORGANISM_PARAM_NAME],
        uiState: props.state.paramUIState[BLAST_DATABASE_ORGANISM_PARAM_NAME],
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
    [BLAST_DATABASE_TYPE_PARAM_NAME]: targetParamElement,
    [BLAST_ALGORITHM_PARAM_NAME]: algorithmParamElement,
    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: sequenceParamElement,
    [BLAST_DATABASE_ORGANISM_PARAM_NAME]: organismParamElement,
  };

  const renderBlastParamGroup = useCallback(
    (group: ParameterGroup, formProps: Props) => (
      <div key={group.name} className={blastFormCx('Group', group.name)}>
        {group.name === restrictedAdvancedParamGroup?.name ? (
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
        ) : (
          renderDefaultParamGroup(group, formProps)
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
                  [BLAST_QUERY_SEQUENCE_PARAM_NAME]: [validationError],
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
    async (event: FormEvent<HTMLFormElement>) => {
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

      const targetType =
        props.state.paramValues[BLAST_DATABASE_TYPE_PARAM_NAME];

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
        props.state.paramValues[BLAST_DATABASE_ORGANISM_PARAM_NAME],
        organismsToFiles
      );

      const targets = selectedOrganismFilenames.map((organism) => ({
        organism,
        target: `${organism}${dbTargetName}`,
      }));

      // React's typescript definitions do not make it easy to access the form element this event was attached to.
      // event.target has a generic Event type; event.currentTarget has a FormEvent type, but this is not accurate, since it is `null`
      const queryFileInput = (
        event.target as HTMLFormElement
      ).elements.namedItem(
        `${props.state.question.urlSegment}/${BLAST_QUERY_SEQUENCE_PARAM_NAME}__file`
      );
      const queryFile =
        queryFileInput instanceof HTMLInputElement &&
        queryFileInput.type === 'file'
          ? queryFileInput.files?.[0]
          : undefined;

      const query =
        queryFile ?? props.state.paramValues[BLAST_QUERY_SEQUENCE_PARAM_NAME];

      const config = paramValuesToBlastConfig(props.state.paramValues);

      const jobDescription =
        props.state.paramValues[JOB_DESCRIPTION_PARAM_NAME];

      const createJobResult = await api.createJob(
        projectId,
        targets,
        query,
        config,
        0,
        jobDescription
      );

      if (createJobResult.status === 'ok') {
        const jobId = createJobResult.value.jobId;

        setSubmitting(false);

        history.push(`result/${jobId}`);
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
      wdkDependencies,
      submissionDisabled,
      props.state.paramValues,
      props.state.question.urlSegment,
      targetMetadataByDataType,
      history,
    ]
  );

  return api == null ? null : (
    <div className={props.containerClassName} ref={containerRef}>
      {props.state.question.description && (
        <Banner
          banner={{
            type: 'info',
            hideIcon: true,
            message: safeHtml(props.state.question.description, null, 'div'),
          }}
        />
      )}
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
): Props & { originalQuestion: Props['state']['question'] } {
  const transformedParameters = formProps.state.question.parameters.reduce(
    (memo, parameter) => {
      if (parameter.name === JOB_DESCRIPTION_PARAM_NAME && !isMultiBlast) {
        return memo;
      } else if (
        parameter.name === BLAST_QUERY_SEQUENCE_PARAM_NAME &&
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
          visibleHelp: undefined,
        });

        return memo;
      } else if (parameter.name === BLAST_DATABASE_ORGANISM_PARAM_NAME) {
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
    originalQuestion: formProps.state.question,
  };
}
