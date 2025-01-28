import React, { useEffect, useMemo, useState } from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';
import { StringParam } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Subsetting } from '@veupathdb/eda/lib/workspace';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import {
  Analysis,
  AnalysisState,
  Filter,
  NewAnalysis,
  Status,
  useAnalysis,
  useConfiguredAnalysisClient,
  useConfiguredComputeClient,
  useConfiguredDataClient,
  useConfiguredDownloadClient,
  useConfiguredSubsettingClient,
  useStudyEntities,
} from '@veupathdb/eda/lib/core';
import { VariableLinkConfig } from '@veupathdb/eda/lib/core/components/VariableLink';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';
import { useEntityCounts } from '@veupathdb/eda/lib/core/hooks/entityCounts';
import FilterChipList from '@veupathdb/eda/lib/core/components/FilterChipList';

export function EdaSubsettingParameter(props: Props<StringParam>) {
  const studyId = props.parameter.properties?.edaProperties?.[0];
  const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
  const dataClient = useConfiguredDataClient(edaServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const downloadClient = useConfiguredDownloadClient(edaServiceUrl);
  const computeClient = useConfiguredComputeClient(edaServiceUrl);

  if (studyId == null) return <div>Could not find eda study id</div>;

  return (
    <DocumentationContainer>
      <WorkspaceContainer
        studyId={studyId}
        subsettingClient={subsettingClient}
        dataClient={dataClient}
        analysisClient={analysisClient}
        downloadClient={downloadClient}
        computeClient={computeClient}
      >
        <SubsettingContainer
          onAnalysisChange={function (
            analysis?: AnalysisState['analysis']
          ): void {
            console.log({ analysis });
          }}
        />
      </WorkspaceContainer>
    </DocumentationContainer>
  );
}

interface SubsettingContainerProps {
  onAnalysisChange: (analysis?: AnalysisState['analysis']) => void;
}

function SubsettingContainer(props: SubsettingContainerProps) {
  const { onAnalysisChange } = props;
  const [entityId, setEntityId] = useState<string>();
  const [variableId, setVariableId] = useState<string>();
  const analysisState = useAnalysis(undefined, undefined, false);
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const entities = useStudyEntities();
  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(filters);
  const variableLinkConfig = useMemo((): VariableLinkConfig => {
    return {
      type: 'button',
      onClick(value) {
        if (value) {
          setEntityId(value.entityId);
          setVariableId(value.variableId);
        }
      },
    };
  }, []);
  useEffect(() => {
    onAnalysisChange(analysisState.analysis);
  }, [analysisState.analysis, onAnalysisChange]);
  return (
    <>
      <FilterChipList
        filters={filters}
        selectedEntityId={entityId}
        selectedVariableId={variableId}
        entities={entities}
        removeFilter={function (filter: Filter): void {
          const nextFilters = filters?.filter(
            (f) =>
              f.entityId !== filter.entityId ||
              f.variableId !== filter.variableId
          );
          analysisState.setFilters(nextFilters ?? []);
        }}
        variableLinkConfig={variableLinkConfig}
      />
      <Subsetting
        analysisState={analysisState}
        entityId={entityId ?? ''}
        variableId={variableId ?? ''}
        variableLinkConfig={variableLinkConfig}
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
    </>
  );
}

// function useAnalysis(studyId: string): AnalysisState {
//   const [analysis, setAnalysis] = useState<NewAnalysis>({
//     apiVersion: 'v1',
//     studyId,
//     studyVersion: 'v1',
//     isPublic: false,
//     displayName: 'Unnamed analysis',
//     descriptor: {
//       subset: {
//         descriptor: [],
//         uiSettings: {},
//       },
//       computations: [],
//       starredVariables: [],
//       dataTableConfig: {},
//       derivedVariables: [],
//     }
//   });
//
//   function makeSetter<T extends keyof NewAnalysis>(property: T) {
//     return function setProperty(value: (NewAnalysis[T] | ((value: NewAnalysis[T]) => NewAnalysis[T]))) {
//       setAnalysis(analysis => ({
//         ...analysis,
//         [property]: typeof value === 'function'
//           ? value(analysis[property])
//           : value
//       }));
//     }
//   }
//
//   const analysisState: AnalysisState = {
//     status: Status.Loaded,
//     analysis,
//     hasUnsavedChanges: true,
//     setName: makeSetter('displayName'),
//     setDescription: makeSetter('description'),
//     setNotes: makeSetter('notes'),
//     setIsPublic: makeSetter('isPublic'),
//     setFilters: mak
//   };
// }
