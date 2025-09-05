import React, { useCallback, useMemo, useState } from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';
import {
  Parameter,
  StringParam,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Subsetting } from '@veupathdb/eda/lib/workspace';
import { WorkspaceContainer } from '@veupathdb/eda/lib/workspace/WorkspaceContainer';
import {
  Analysis,
  AnalysisState,
  Filter,
  makeNewAnalysis,
  NewAnalysis,
  useAnalysisState,
  useGetDefaultVariableDescriptor,
  useStudyEntities,
  useSetterWithCallback,
} from '@veupathdb/eda/lib/core';
import { VariableLinkConfig } from '@veupathdb/eda/lib/core/components/VariableLink';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';
import { DocumentationContainer } from '@veupathdb/eda/lib/core/components/docs/DocumentationContainer';
import { useEntityCounts } from '@veupathdb/eda/lib/core/hooks/entityCounts';
import FilterChipList from '@veupathdb/eda/lib/core/components/FilterChipList';

import './EdaSubsetParameter.scss';
import {
  defaultFormatParameterValue,
  DefaultStepDetailsContent,
  LeafStepDetailsContentProps,
} from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetails';
import { formatFilterDisplayValue } from '@veupathdb/eda/lib/core/utils/study-metadata';
import { DatasetItem } from '@veupathdb/wdk-client/lib/Views/Question/Params/DatasetParamUtils';
import { parseJson } from '@veupathdb/eda/lib/notebook/Utils';

const datasetIdParamName = 'eda_dataset_id';

export function EdaSubsetParameter(props: Props<StringParam>) {
  const studyId = props.ctx.paramValues[datasetIdParamName];

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
    <DocumentationContainer>
      <WorkspaceContainer studyId={studyId} edaServiceUrl={edaServiceUrl}>
        <SubsettingAdapter analysisState={analysisState} />
      </WorkspaceContainer>
    </DocumentationContainer>
  );
}

interface SubsettingAdapterProps {
  analysisState: AnalysisState;
}

function SubsettingAdapter(props: SubsettingAdapterProps) {
  const { analysisState } = props;
  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const varAndEnt = getDefaultVariableDescriptor();
  const [entityId, setEntityId] = useState<string | undefined>(
    varAndEnt.entityId
  );
  const [variableId, setVariableId] = useState<string | undefined>(
    varAndEnt.variableId
  );
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
  const baseEntity = entities[0];
  const filteredCount = filteredCounts.value?.[baseEntity.id];
  const totalCount = totalCounts.value?.[baseEntity.id];

  return (
    <div className="EdaSubsettingParameter">
      <div className="EdaSubsettingParameterCounts">
        <div className="EdaSubsettingParameterCounts-Total">
          {totalCount != null &&
            totalCount.toLocaleString() +
              ' ' +
              baseEntity.displayNamePlural +
              ' Total'}
        </div>
        <div className="EdaSubsettingParameterCounts-FiltersAndChips">
          <div className="EdaSubsettingParameterCounts-Filtered">
            {totalCount != null &&
              filteredCount != null &&
              filteredCount.toLocaleString() +
                ' of ' +
                totalCount.toLocaleString() +
                ' ' +
                baseEntity.displayNamePlural +
                ' selected'}
          </div>
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
        </div>
      </div>
      <Subsetting
        analysisState={analysisState}
        entityId={entityId ?? ''}
        variableId={variableId ?? ''}
        variableLinkConfig={variableLinkConfig}
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
        hideStarredVariables
      />
    </div>
  );
}

export function EdaSubsetStepDetails(props: LeafStepDetailsContentProps) {
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
