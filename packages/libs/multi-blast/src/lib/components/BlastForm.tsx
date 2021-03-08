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

import { fromPairs } from 'lodash';

import { updateDependentParams } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import {
  IconAlt,
  RadioList,
  TextArea,
} from '@veupathdb/wdk-client/lib/Components';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { scrollIntoView } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import DefaultQuestionForm, {
  ParameterList,
  Props as DefaultQuestionFormProps,
  SubmitButton,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

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

export const blastFormCx = makeClassNameHelper('wdk-QuestionForm');

const BLAST_FORM_CONTAINER_NAME = 'MultiBlast';

export interface Props extends DefaultQuestionFormProps {
  canChangeRecordType?: boolean;
}

export function BlastForm(props: Props) {
  const canChangeRecordType = props.canChangeRecordType ?? false;

  const targetType = props.state.paramValues[BLAST_DATABASE_TYPE_PARAM_NAME];

  const selectedBlastAlgorithm =
    props.state.paramValues[BLAST_ALGORITHM_PARAM_NAME];

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

  const [queryFile, setQueryFile] = useState<File | null>(null);

  const queryFileProvided = queryFile != null;

  const onQueryFileInputChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQueryFile(
        event.target.files == null || event.target.files.length === 0
          ? null
          : event.target.files[0]
      );
    },
    [setQueryFile]
  );

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
      disabled: defaultAdvancedParamsMetadata[
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
    enabledAlgorithms
  );
  const sequenceParamProps = useSequenceParamProps(
    props.state,
    props.eventHandlers.updateParamValue,
    queryFileProvided
  );

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
        Paste one or several sequences, or provide a FASTA file.
      </div>
      <TextArea
        {...sequenceParamProps}
        name={`${props.state.question.urlSegment}/${BLAST_QUERY_SEQUENCE_PARAM_NAME}`}
      />
      <input
        type="file"
        name={`${props.state.question.urlSegment}/${BLAST_QUERY_SEQUENCE_PARAM_NAME}__file`}
        onChange={onQueryFileInputChanged}
      />
    </div>
  );

  const parameterElements = {
    ...props.parameterElements,
    [BLAST_DATABASE_TYPE_PARAM_NAME]: targetParamElement,
    [BLAST_ALGORITHM_PARAM_NAME]: algorithmParamElement,
    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: sequenceParamElement,
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
                paramDependenciesUpdating={fromPairs(
                  formProps.state.question.parameters
                    .filter(
                      (parameter) =>
                        formProps.state.paramsUpdatingDependencies[
                          parameter.name
                        ]
                    )
                    .flatMap((parameter) =>
                      parameter.dependentParams.map((pn) => [pn, true])
                    )
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

  return enabledAlgorithms == null ||
    defaultAdvancedParamsMetadata == null ? null : props.submissionMetadata
      .type === 'create-strategy' ? (
    <NewJobForm
      {...props}
      containerClassName={containerClassName}
      parameterElements={parameterElements}
      queryFile={queryFile}
      renderParamGroup={renderBlastParamGroup}
    />
  ) : (
    <DefaultQuestionForm
      {...props}
      containerClassName={containerClassName}
      parameterElements={parameterElements}
      renderParamGroup={renderBlastParamGroup}
    />
  );
}

interface NewJobFormProps extends Props {
  renderParamGroup: (group: ParameterGroup, formProps: Props) => JSX.Element;
  queryFile: File | null;
}

function NewJobForm(props: NewJobFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [inputErrors, setInputErrors] = useState<InputErrors | undefined>(
    undefined
  );

  const api = useBlastApi();

  const wdkDependencies = useContext(WdkDepdendenciesContext);
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

      setSubmitting(true);

      const targetType =
        props.state.paramValues[BLAST_DATABASE_TYPE_PARAM_NAME];

      // FIXME: The projectId should be derived from the organism
      // This is necessary to handle the portal site
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

      const query =
        props.queryFile == null
          ? props.state.paramValues[BLAST_QUERY_SEQUENCE_PARAM_NAME]
          : props.queryFile;

      const config = paramValuesToBlastConfig(props.state.paramValues);

      const jobDescription =
        props.state.paramValues[JOB_DESCRIPTION_PARAM_NAME];

      const createJobResult = await api.createJob(
        projectId,
        targets,
        query,
        config,
        jobDescription
      );

      if (createJobResult.status === 'ok') {
        const jobId = createJobResult.value.jobId;

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
      props.queryFile,
      targetMetadataByDataType,
      wdkDependencies,
      props.state.paramValues,
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
          />
        </div>
      </form>
    </div>
  );
}
