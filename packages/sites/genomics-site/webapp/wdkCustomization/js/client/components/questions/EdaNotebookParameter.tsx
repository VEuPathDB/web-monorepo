import React, { useCallback, useMemo } from 'react';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import {
  Analysis,
  AnalysisState,
  makeNewAnalysis,
  NewAnalysis,
  useAnalysisState,
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
import CoreUIThemeProvider from '@veupathdb/coreui/lib/components/theming/UIThemeProvider';
import colors, {
  error,
  warning,
  success,
} from '@veupathdb/coreui/lib/definitions/colors';
import './EdaSubsetParameter.scss';
import {
  defaultFormatParameterValue,
  DefaultStepDetailsContent,
  LeafStepDetailsContentProps,
} from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetails';
import { formatFilterDisplayValue } from '@veupathdb/eda/lib/core/utils/study-metadata';
import { DatasetItem } from '@veupathdb/wdk-client/lib/Views/Question/Params/DatasetParamUtils';
import { parseJson } from '@veupathdb/eda/lib/notebook/Utils';
import {
  EdaNotebookAnalysis,
  WdkState,
} from '@veupathdb/eda/lib/notebook/EdaNotebookAnalysis';

type EdaNotebookParameterProps = {
  wdkState: WdkState;
};

export function EdaNotebookParameter(props: EdaNotebookParameterProps) {
  const { wdkState } = props;
  const { parameters, paramValues, updateParamValue } = wdkState;

  const studyId = paramValues['eda_dataset_id'];
  const notebookType = paramValues['eda_notebook_type'];
  const analysisJson = paramValues['eda_analysis_spec'];

  // Deserialize analysis from the WDK param, or create a fresh one.
  // useMemo ensures we react to external changes (e.g. param resets).
  const analysisDescriptor = useMemo(() => {
    const parsed = parseJson(analysisJson);
    return NewAnalysis.is(parsed) ? parsed : makeNewAnalysis(studyId);
  }, [analysisJson, studyId]);

  // Persist analysis state back to the eda_analysis_spec WDK parameter
  const persistAnalysis = useCallback(
    (analysis: Analysis | NewAnalysis | undefined) => {
      if (analysis == null) return;
      const param = parameters.find((p) => p.name === 'eda_analysis_spec');
      if (param) {
        updateParamValue(param, JSON.stringify(analysis));
      }
    },
    [parameters, updateParamValue]
  );

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
          <CoreUIThemeProvider
            theme={{
              palette: {
                primary: { hue: colors.mutedCyan, level: 600 },
                secondary: { hue: colors.mutedRed, level: 500 },
                error: { hue: error, level: 600 },
                warning: { hue: warning, level: 600 },
                info: { hue: colors.mutedCyan, level: 600 },
                success: { hue: success, level: 600 },
              },
            }}
          >
            <EdaNotebookAdapter
              analysisState={analysisState}
              notebookType={notebookType}
              wdkState={wdkState}
            />
          </CoreUIThemeProvider>
        </WorkspaceContainer>
      </DocumentationContainer>
    </>
  );
}

interface EdaNotebookAdapterProps {
  analysisState: AnalysisState;
  notebookType: string;
  wdkState: WdkState;
}

function EdaNotebookAdapter(props: EdaNotebookAdapterProps) {
  const { analysisState, wdkState, notebookType } = props;
  const studyId = analysisState.analysis?.studyId;

  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
  const downloadClient = useConfiguredDownloadClient(edaServiceUrl);
  const dataClient = useConfiguredDataClient(edaServiceUrl);
  const computeClient = useConfiguredComputeClient(edaServiceUrl);

  return (
    <div className="EdaSubsettingParameter">
      {studyId && (
        <EDAWorkspaceContainer
          studyId={studyId}
          analysisClient={analysisClient}
          subsettingClient={subsettingClient}
          downloadClient={downloadClient}
          dataClient={dataClient}
          computeClient={computeClient}
        >
          <EdaNotebookAnalysis
            analysisState={analysisState}
            notebookType={notebookType}
            wdkState={wdkState}
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

//
// TO DO: adapt for notebook
//
// this function returns a brief summary of the search/analysis
// for the edit/revise popup
//
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
          {obj.descriptor.subset.descriptor.map((filter, index) => (
            <div key={index}>
              {filter.variableId}: {formatFilterDisplayValue(filter)}
            </div>
          ))}
        </div>
      );
    }
  }
  return defaultFormatParameterValue(parameter, value, datasetParamItems);
}
