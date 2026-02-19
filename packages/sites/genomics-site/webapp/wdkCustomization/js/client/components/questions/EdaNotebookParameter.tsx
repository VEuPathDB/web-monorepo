import React, { useEffect, useRef, useState } from 'react';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import {
  Analysis,
  makeNewAnalysis,
  NewAnalysis,
  useAnalysisState,
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
import { EdaNotebookAnalysis } from '@veupathdb/eda/lib/notebook/EdaNotebookAnalysis';
import { WdkState } from '@veupathdb/eda/lib/notebook/Types';

type EdaNotebookParameterProps = {
  wdkState: WdkState;
  onReadinessChange?: (isReady: boolean) => void;
};

export function EdaNotebookParameter(props: EdaNotebookParameterProps) {
  const { wdkState, onReadinessChange } = props;
  const { parameters, paramValues, updateParamValue } = wdkState;

  const studyId = paramValues['eda_dataset_id'];
  const notebookType = wdkState.questionProperties['edaNotebookType']?.[0];
  const analysisJson = paramValues['eda_analysis_spec'];

  // Local state gives immediate re-renders so dependent dropdowns always see
  // fresh values (fixes rapid-selection stale state bug).
  const [analysis, setAnalysis] = useState<Analysis | NewAnalysis | undefined>(
    () => {
      const parsed = parseJson(analysisJson);
      return NewAnalysis.is(parsed) ? parsed : makeNewAnalysis(studyId);
    }
  );

  // Persist to WDK after each render. updateParamValue and parameters are
  // stored in refs so they are NOT effect dependencies — this avoids a
  // feedback loop if WDK produces a new updateParamValue reference on the
  // re-render triggered by the Redux dispatch.
  const updateParamValueRef = useRef(updateParamValue);
  const parametersRef = useRef(parameters);
  useEffect(() => {
    updateParamValueRef.current = updateParamValue;
    parametersRef.current = parameters;
  });

  useEffect(() => {
    if (analysis == null) return;
    const param = parametersRef.current.find(
      (p) => p.name === 'eda_analysis_spec'
    );
    if (param) {
      updateParamValueRef.current(param, JSON.stringify(analysis));
    }
  }, [analysis]); // intentionally omitting updateParamValue/parameters (kept current via refs)

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
            <EdaNotebookAnalysis
              analysisState={analysisState}
              notebookType={notebookType}
              wdkState={wdkState}
              onReadinessChange={onReadinessChange}
            />
          </CoreUIThemeProvider>
        </WorkspaceContainer>
      </DocumentationContainer>
    </>
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
