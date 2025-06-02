import React, { useCallback, useMemo, useState } from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';
import {
  Parameter,
  StringParam,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import {
  Analysis,
  AnalysisState,
  makeNewAnalysis,
  NewAnalysis,
  useAnalysisState,
  useGetDefaultVariableDescriptor,
  useSetterWithCallback,
  EDAWorkspaceContainer,
  useConfiguredAnalysisClient,
  useConfiguredSubsettingClient,
  useConfiguredDownloadClient,
  useConfiguredDataClient,
  useConfiguredComputeClient,
} from '@veupathdb/eda/lib/core';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';

import './EdaSubsetParameter.scss';
import {
  defaultFormatParameterValue,
  DefaultStepDetailsContent,
  LeafStepDetailsContentProps,
} from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetails';
import { formatFilterDisplayValue } from '@veupathdb/eda/lib/core/utils/study-metadata';
import { DatasetItem } from '@veupathdb/wdk-client/lib/Views/Question/Params/DatasetParamUtils';
import { parseJson } from '@veupathdb/eda/lib/notebook/Utils';
import { EdaNotebookAnalysis } from '@veupathdb/eda/lib/notebook/EdaNotebookAnalysis';
import ParameterComponent from '@veupathdb/wdk-client/lib/Views/Question/ParameterComponent';

const datasetIdParamName = 'eda_dataset_id';

export function EdaNotebookParameter(props: Props<StringParam>) {
  // TEMPORARY: We don't have this value coming from the wdk yet.
  const studyId = props.ctx.paramValues[datasetIdParamName] ?? 'DS_82dc5abc7f';

  const analysisDescriptor = useMemo(() => {
    const jsonParsedParamValue = parseJson(props.value);
    return NewAnalysis.is(jsonParsedParamValue)
      ? jsonParsedParamValue
      : makeNewAnalysis(studyId);
  }, [props.value, studyId]);

  const { onParamValueChange } = props;

  // serialize and persist with `onParamValueChange`
  const persistAnalysis = useCallback(
    (analysis: Analysis | NewAnalysis | undefined) => {
      if (analysis != null) {
        onParamValueChange(JSON.stringify(analysis));
      }
    },
    [onParamValueChange]
  );

  // wrap `persistAnalysis` inside a state setter function with 'functional update' functionality
  const wrappedPersistAnalysis = useSetterWithCallback<
    Analysis | NewAnalysis | undefined
  >(analysisDescriptor, persistAnalysis);

  const analysisState = useAnalysisState(
    analysisDescriptor,
    wrappedPersistAnalysis
  );

  if (studyId == null) return <div>Could not find eda study id</div>;

  return (
    <>
      <DocumentationContainer>
        <WorkspaceContainer studyId={studyId} edaServiceUrl={edaServiceUrl}>
          <EdaNotebookAdapter analysisState={analysisState} />
        </WorkspaceContainer>
      </DocumentationContainer>
      <ParameterComponent {...props} />
    </>
  );
}

interface EdaNotebookAdapterProps {
  analysisState: AnalysisState;
}

function EdaNotebookAdapter(props: EdaNotebookAdapterProps) {
  const { analysisState } = props;
  const datasetId = analysisState.analysis?.studyId;

  // Used for subsetting. To be addressed in #1413
  // const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  // const varAndEnt = getDefaultVariableDescriptor();
  // const [entityId, setEntityId] = useState<string | undefined>(
  //   varAndEnt.entityId
  // );
  // const [variableId, setVariableId] = useState<string | undefined>(
  //   varAndEnt.variableId
  // );

  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
  const downloadClient = useConfiguredDownloadClient(edaServiceUrl);
  const dataClient = useConfiguredDataClient(edaServiceUrl);
  const computeClient = useConfiguredComputeClient(edaServiceUrl);

  const initialAnalysis = useMemo(() => {
    return makeNewAnalysis(datasetId ?? '');
  }, [datasetId]);

  const [analysis, setAnalysis] =
    useState<Analysis | NewAnalysis | undefined>(initialAnalysis);

  return (
    <div className="EdaSubsettingParameter">
      {datasetId && (
        <EDAWorkspaceContainer
          studyId={datasetId}
          analysisClient={analysisClient}
          subsettingClient={subsettingClient}
          downloadClient={downloadClient}
          dataClient={dataClient}
          computeClient={computeClient}
        >
          <EdaNotebookAnalysis
            analysis={analysis}
            studyId={datasetId}
            onAnalysisChange={setAnalysis}
          />
        </EDAWorkspaceContainer>
      )}
    </div>
  );
}

export function EdaNotebookStepDetails(props: LeafStepDetailsContentProps) {
  return (
    <DefaultStepDetailsContent
      {...props}
      formatParameterValue={formatParameterValue}
    />
  );
}

function formatParameterValue(
  parameter: Parameter,
  value: string | undefined,
  datasetParamItems: Record<string, DatasetItem[]> | undefined
) {
  if (parameter.name === 'eda_analysis_spec' && value != null) {
    const obj = parseJson(value);
    if (NewAnalysis.is(obj) || Analysis.is(obj)) {
      if (obj.descriptor.subset.descriptor.length === 0) {
        return (
          <div>
            <em>No filters applied.</em>
          </div>
        );
      }
      return (
        <div style={{ whiteSpace: 'pre-line' }}>
          {obj.descriptor.subset.descriptor.map((filter) => (
            <div>
              {filter.variableId}: {formatFilterDisplayValue(filter)}
            </div>
          ))}
        </div>
      );
    }
  }
  return defaultFormatParameterValue(parameter, value, datasetParamItems);
}
