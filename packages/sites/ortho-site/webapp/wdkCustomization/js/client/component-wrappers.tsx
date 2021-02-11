import React from 'react';

import { Props as RecordAttributeSectionProps } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';

import { OrthoMCLPage } from 'ortho-client/components/layout/OrthoMCLPage';
import { SiteSearchInput } from 'ortho-client/components/site-search/SiteSearchInput';
import {
  RecordAttribute as GroupRecordAttribute,
  RecordAttributeSection as GroupRecordAttributeSection,
  RecordTable as GroupRecordTable
} from 'ortho-client/records/GroupRecordClasses.GroupRecordClass';
import {
  RecordTable as SequenceRecordTable,
  RecordAttributeSection as SequenceRecordAttributeSection
} from 'ortho-client/records/SequenceRecordClasses.SequenceRecordClass';
import {
  RecordAttributeProps,
  RecordTableProps
} from 'ortho-client/records/Types';
import {
  RecordTableSection
} from 'ortho-client/records/RecordTableSection';

export default {
  Page: () => OrthoMCLPage,
  RecordAttribute: makeDynamicWrapper('RecordAttribute', (props: RecordAttributeProps) => props.recordClass.fullName),
  RecordAttributeSection: makeDynamicWrapper('RecordAttributeSection', (props: RecordAttributeSectionProps) => props.recordClass.fullName),
  RecordTable: makeDynamicWrapper('RecordTable', (props: RecordTableProps) => props.recordClass.fullName),
  RecordTableSection,
  SiteSearchInput
};

const GROUP_RECORD_CLASS_NAME = 'GroupRecordClasses.GroupRecordClass';
const SEQUENCE_RECORD_CLASS_NAME = 'SequenceRecordClasses.SequenceRecordClass';

const wrappedComponentsByRecordClass: Record<string, Record<string, React.ComponentType<any>>> = {
  [GROUP_RECORD_CLASS_NAME]: {
    RecordAttribute: GroupRecordAttribute,
    RecordAttributeSection: GroupRecordAttributeSection,
    RecordTable: GroupRecordTable
  },
  [SEQUENCE_RECORD_CLASS_NAME]: {
    RecordAttributeSection: SequenceRecordAttributeSection,
    RecordTable: SequenceRecordTable
  }
};

function makeDynamicWrapper<P>(componentName: string, getWrapperType: (props: P) => string) {
  return function dynamicWrapper(DefaultComponent: React.ComponentType<P>) {
    return function WrappedComponent(props: P) {
      const wrapperType = getWrapperType(props);
      const availableWrappers = wrappedComponentsByRecordClass[wrapperType] ?? {};
      const ResolvedComponent = availableWrappers[componentName] || DefaultComponent;

      return <ResolvedComponent {...props} DefaultComponent={DefaultComponent} />;
    };
  };
}
