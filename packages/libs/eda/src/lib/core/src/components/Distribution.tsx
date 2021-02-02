import { Loading } from "@veupathdb/wdk-client/lib/Components";
import FieldFilter from "@veupathdb/wdk-client/lib/Components/AttributeFilter/FieldFilter";
import {
  DateMemberFilter,
  DateRangeFilter,
  Filter,
  NumberRangeFilter,
} from "@veupathdb/wdk-client/lib/Components/AttributeFilter/Types";
import EmptyState from "@veupathdb/wdk-client/lib/Components/Mesa/Ui/EmptyState";
import { ErrorBoundary } from "@veupathdb/wdk-client/lib/Controllers";
import React from "react";
import {
  StudyEntity,
  StudyMetadata,
  StudyVariable,
  useAnalysis,
  useEdaApi,
  Filter as EdaFilter,
} from "..";
import { usePromise } from "../hooks/usePromise";

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
  const distribution = usePromise(async () => {
    const activeField = {
      display: variable.displayName,
      isRange: variable.dataShape === "continuous",
      parent: variable.parentId,
      precision: 1,
      term: variable.id,
      type: variable.type,
      variableName: variable.providerLabel,
    };
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
    return {
      distribution: Object.entries(bg.distribution).map(([value, count]) => ({
        count,
        filteredCount: fg.distribution[value],
        value,
      })),
      entitiesCount: bg.entitiesCount,
      filteredEntitiesCount: fg.entitiesCount,
      activeField,
    };
  }, [edaClient, studyMetadata, variable, entity, analysis?.filters]);
  return distribution.pending ? (
    <Loading />
  ) : distribution.error ? (
    <div>{String(distribution.error)}</div>
  ) : distribution.value ? (
    distribution.value.distribution.length === 0 ? (
      <div className="MesaComponent">
        <EmptyState culprit="nodata" />
      </div>
    ) : (
      <ErrorBoundary>
        <FieldFilter
          displayName={entity.displayName}
          dataCount={distribution.value.entitiesCount}
          filteredDataCount={distribution.value.filteredEntitiesCount}
          filters={analysis?.filters.map((f) => fromEdaFilter(f)) ?? []}
          activeField={distribution.value?.activeField}
          activeFieldState={{
            loading: false,
            summary: {
              valueCounts: distribution.value.distribution,
              internalsCount: distribution.value.entitiesCount,
              internalsFilteredCount: distribution.value.filteredEntitiesCount,
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

function toEdaFilter(filter: Filter, entityId: string): EdaFilter {
  const variableId = filter.field;
  if ("__entityId" in filter) entityId = (filter as any).__entityId;
  const type: EdaFilter["type"] = filter.isRange
    ? filter.type === "number"
      ? "numberRange"
      : "dateRange"
    : filter.type === "string"
    ? "stringSet"
    : filter.type === "number"
    ? "numberSet"
    : "dateSet";
  return (type === "dateSet"
    ? {
        entityId,
        variableId,
        type,
        dateSet: (filter as DateMemberFilter).value.map((d) => d + " 00:00"),
      }
    : type === "numberSet"
    ? {
        entityId,
        variableId,
        type,
        numberSet: filter.value,
      }
    : type === "stringSet"
    ? {
        entityId,
        variableId,
        type,
        stringSet: filter.value,
      }
    : type === "dateRange"
    ? {
        entityId,
        variableId,
        type,
        min: (filter as DateRangeFilter).value.min + " 00:00",
        max: (filter as DateRangeFilter).value.max + " 00:00",
      }
    : {
        entityId,
        variableId,
        type,
        min: (filter as NumberRangeFilter).value.min,
        max: (filter as NumberRangeFilter).value.max,
      }) as EdaFilter;
}

function fromEdaFilter(filter: EdaFilter): Filter {
  return {
    field: filter.variableId,
    isRange: filter.type.endsWith("Range"),
    includeUnknown: false,
    type: filter.type.replace(/(Set|Range)/, ""),
    value: filter.type.endsWith("Range")
      ? {
          min: (filter as any).min.replace(" 00:00", ""),
          max: (filter as any).max.replace(" 00:00", ""),
        }
      : (filter as any)[filter.type].map((d: string) =>
          d.replace(" 00:00", "")
        ),
    __entityId: filter.entityId,
  } as Filter;
}
