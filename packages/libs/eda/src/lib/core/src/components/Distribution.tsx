import { Loading } from "@veupathdb/wdk-client/lib/Components";
import FieldFilter from "@veupathdb/wdk-client/lib/Components/AttributeFilter/FieldFilter";
import { Filter } from "@veupathdb/wdk-client/lib/Components/AttributeFilter/Types";
import EmptyState from "@veupathdb/wdk-client/lib/Components/Mesa/Ui/EmptyState";
import { ErrorBoundary } from "@veupathdb/wdk-client/lib/Controllers";
import React from "react";
import { useAnalysis } from "../hooks/useAnalysis";
import { useEdaApi } from "../hooks/useEdaApi";
import { usePromise } from "../hooks/usePromise";
import { StudyEntity, StudyMetadata, StudyVariable } from "../types/study";
import {
  fromEdaFilter,
  toEdaFilter,
  toWdkVariableSummary,
} from "../utils/wdk-filter-param-adapter";

interface Props {
  studyMetadata: StudyMetadata;
  entity: StudyEntity;
  variable: StudyVariable;
}

export function Distribution(props: Props) {
  const { studyMetadata, entity, variable } = props;
  const {
    setFilters,
    history: { current: analysis },
  } = useAnalysis();
  const edaClient = useEdaApi();
  const variableSummary = usePromise(async () => {
    const bg$ = edaClient.getDistribution(
      studyMetadata.id,
      entity.id,
      variable.id,
      {
        filters: [],
      }
    );
    const fg$ = analysis?.filters
      ? edaClient.getDistribution(studyMetadata.id, entity.id, variable.id, {
          filters: analysis.filters.filter(
            // FIXME Bad logic
            (f) => f.entityId !== entity.id || f.variableId !== variable.id
          ),
        })
      : bg$;
    const [bg, fg] = await Promise.all([bg$, fg$]);
    return toWdkVariableSummary(fg, bg, variable);
  }, [edaClient, studyMetadata, variable, entity, analysis?.filters]);
  return variableSummary.pending ? (
    <Loading />
  ) : variableSummary.error ? (
    <div>{String(variableSummary.error)}</div>
  ) : variableSummary.value ? (
    variableSummary.value.distribution.length === 0 ? (
      <div className="MesaComponent">
        <EmptyState culprit="nodata" />
      </div>
    ) : (
      <ErrorBoundary>
        <FieldFilter
          displayName={entity.displayName}
          dataCount={variableSummary.value.entitiesCount}
          filteredDataCount={variableSummary.value.filteredEntitiesCount}
          filters={analysis?.filters.map((f) => fromEdaFilter(f)) ?? []}
          activeField={variableSummary.value?.activeField}
          activeFieldState={{
            loading: false,
            summary: {
              valueCounts: variableSummary.value.distribution,
              internalsCount: variableSummary.value.entitiesCount,
              internalsFilteredCount:
                variableSummary.value.filteredEntitiesCount,
            },
          }}
          onFiltersChange={(filters) =>
            // This doesn't work when filters are for different entities.
            // We need another way to associate filter w/ entity here.
            setFilters(filters.map((f: Filter) => toEdaFilter(f, entity.id)))
          }
          onMemberSort={logEvent("onMemberSort")}
          onMemberSearch={logEvent("onMemberSearch")}
          onRangeScaleChange={logEvent("onRangeScaleChange")}
          selectByDefault={false}
        />
      </ErrorBoundary>
    )
  ) : null;
}

function logEvent(tag: string) {
  return function noop(...args: unknown[]) {
    console.log("Tagged event ::", tag + " ::", ...args);
  };
}
