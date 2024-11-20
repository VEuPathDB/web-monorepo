import React, { useState } from 'react';
import {
  Filter,
  useAnalysis,
  useStudyEntities,
  useStudyMetadata,
  useStudyRecord,
} from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import Subsetting from '../workspace/Subsetting';
import { useEntityCounts } from '../core/hooks/entityCounts';
import FilterChipList from '../core/components/FilterChipList';

interface Props {
  analysisId: string;
}

export function EdaNotebookAnalysis(props: Props) {
  const { analysisId } = props;
  const analysisState = useAnalysis(
    analysisId === 'new' ? undefined : analysisId
  );
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const entities = useStudyEntities();
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );
  const [entityId, setEntityId] = useState<string>();
  const [variableId, setVariableId] = useState<string>();
  return (
    <div>
      <h1>EDA Notebook</h1>
      {safeHtml(studyRecord.displayName, null, 'h2')}
      <h3>
        <SaveableTextEditor
          value={analysisState.analysis?.displayName ?? ''}
          onSave={analysisState.setName}
        />
      </h3>
      <details>
        <summary>
          Subset &nbsp;&nbsp;
          <FilterChipList
            filters={analysisState.analysis?.descriptor.subset.descriptor}
            entities={entities}
            selectedEntityId={entityId}
            selectedVariableId={variableId}
            removeFilter={(filter) =>
              analysisState.setFilters((filters) =>
                filters.filter(
                  (f) =>
                    f.entityId !== filter.entityId ||
                    f.variableId !== filter.variableId
                )
              )
            }
            variableLinkConfig={{
              type: 'button',
              onClick: (value) => {
                setEntityId(value?.entityId);
                setVariableId(value?.variableId);
              },
            }}
          />
        </summary>
        <Subsetting
          analysisState={analysisState}
          entityId={entityId ?? ''}
          variableId={variableId ?? ''}
          totalCounts={totalCountsResult.value}
          filteredCounts={filteredCountsResult.value}
          variableLinkConfig={{
            type: 'button',
            onClick: (value) => {
              setEntityId(value?.entityId);
              setVariableId(value?.variableId);
            },
          }}
        />
      </details>
    </div>
  );
}
