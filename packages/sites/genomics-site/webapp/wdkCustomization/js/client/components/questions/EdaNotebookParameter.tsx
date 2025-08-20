import React, { useState } from 'react';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import {
  Analysis,
  AnalysisState,
  makeNewAnalysis,
  NewAnalysis,
  useAnalysisState,
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
  value: string;
  datasetIdParamName?: string;
  notebookTypeParamName?: string;
  wdkState: WdkState;
};

export function EdaNotebookParameter(props: EdaNotebookParameterProps) {
  const { value, datasetIdParamName, notebookTypeParamName, wdkState } = props;

  // TEMPORARY: We don't have this value coming from the wdk yet.
  const studyId = datasetIdParamName ?? 'DS_82dc5abc7f';
  const notebookType = notebookTypeParamName ?? 'wgcnaCorrelationNotebook';

  // we need to maintain the analysis as regular "live" React state somewhere
  const [analysis, setAnalysis] = useState<NewAnalysis | Analysis | undefined>(
    () => {
      const parsed = parseJson(value);
      return NewAnalysis.is(parsed) ? parsed : makeNewAnalysis(studyId);
    }
  );

  // Disabled for now: persistence of analysis state to the 'param'
  // It should probably be persisted to another 'param' because this
  // 'param' needs to store the WGCNA module

  //  // Here we periodically send analysis state back upstream to WDK
  //  const debouncedPersist = useMemo(
  //    () =>
  //      debounce(
  //        (a: Analysis | NewAnalysis | undefined) =>
  //          onParamValueChange(JSON.stringify(a)),
  //        500
  //      ),
  //    [onParamValueChange]
  //  );
  //  useEffect(() => {
  //    debouncedPersist(analysis);
  //  }, [analysis, debouncedPersist]);
  //
  // useEffect(() => {
  //   return () => {
  //     debouncedPersist.cancel();
  //   };
  // }, [debouncedPersist]);

  // TO DO (maybe)
  // Consider watching `value` for updates that happened on the WDK side
  // and if there's a change that's not deep-equals to `analysis`
  // call `setAnalysis` with a newly deserialised object.
  // But probably this never happens? Maybe if the user
  // has two tabs open?? Good idea to look at what the regular EDA does.

  // debounce clean-up, just to be on the safe side
  // Create the all-singing, all-dancing analysisState
  const analysisState = useAnalysisState(analysis, setAnalysis);

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
