import React, { ComponentType, Suspense, useMemo } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { Props } from '@veupathdb/wdk-client/lib/Controllers/AnswerController';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { usePreferredOrganismsState, usePreferredOrganismsEnabledState } from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

import { PageLoading } from '../components/common/PageLoading';
import { isPreferredDataset, isPreferredOrganism } from '../util/preferredOrganisms';

interface RecordFilterPredicate {
  (record: RecordInstance): boolean
}

export function AnswerController(DefaultComponent: ComponentType<Props>): ComponentType<Props> {
  return function(props) {
    return (
      <Suspense fallback={<PageLoading />}>
        {
          props.ownProps.recordClass === 'organism'
            ? <OrganismAnswerController {...props} DefaultComponent={DefaultComponent} />
            : props.ownProps.recordClass === 'dataset'
            ? <DatasetAnswerController {...props} DefaultComponent={DefaultComponent} />
            : <DefaultComponent {...props} />
        }
      </Suspense>
    )
  };
}

function OrganismAnswerController(props: Props & { DefaultComponent: ComponentType<Props> }) {
  const organismAnswerProps = useExternallyFilteredAnswerProps(props, makeOrganismFilterPredicate);

  return <props.DefaultComponent {...organismAnswerProps} />;
}

function DatasetAnswerController(props: Props & { DefaultComponent: ComponentType<Props> }) {
  const datasetAnswerProps = useExternallyFilteredAnswerProps(props, makeDatasetFilterPredicate);

  return <props.DefaultComponent {...datasetAnswerProps} />;
}

function useExternallyFilteredAnswerProps(
  props: Props,
  makeFilterPredicate: (preferredOrganismsEnabled: boolean, preferredOrganisms: Set<string>) => RecordFilterPredicate
): Props {
  const [ preferredOrganisms ] = usePreferredOrganismsState();
  const [ preferredOrganismsEnabled ] = usePreferredOrganismsEnabledState();

  const { visibleRecords, totalCount } = useMemo(
    () => {
      const filterPredicate = makeFilterPredicate(
        preferredOrganismsEnabled,
        new Set(preferredOrganisms)
      );

      return {
        visibleRecords: makeVisibleRecords(props.stateProps.records, filterPredicate),
        totalCount: makeTotalCount(props.stateProps.unfilteredRecords, filterPredicate)
      };
    },
    [ preferredOrganisms, preferredOrganismsEnabled, props.stateProps.records, props.stateProps.unfilteredRecords, makeFilterPredicate ]
  );

  return useMemo(
    () => ({
      ...props,
      stateProps: {
        ...props.stateProps,
        records: visibleRecords,
        meta: props.stateProps.meta && {
          ...props.stateProps.meta,
          totalCount
        }
      }
    }),
    [ props, visibleRecords, totalCount ]
  );
}

function makeVisibleRecords(records: RecordInstance[] | undefined, filterPredicate: RecordFilterPredicate) {
  return records?.filter(filterPredicate);
}

function makeTotalCount(records: RecordInstance[] | undefined, filterPredicate: RecordFilterPredicate) {
  return records?.reduce(
    (count, record) =>
      count +
      (filterPredicate(record) ? 1 : 0),
    0
  ) ?? 0;
}

function makeOrganismFilterPredicate(preferredOrganismsEnabled: boolean, preferredOrganisms: Set<string>): RecordFilterPredicate {
  return record => (
    !preferredOrganismsEnabled ||
    isPreferredOrganism(record, preferredOrganisms)
  );
}

function makeDatasetFilterPredicate(preferredOrganismsEnabled: boolean, preferredOrganisms: Set<string>): RecordFilterPredicate {
  return record => (
    !preferredOrganismsEnabled ||
    isPreferredDataset(record, preferredOrganisms)
  );
}
