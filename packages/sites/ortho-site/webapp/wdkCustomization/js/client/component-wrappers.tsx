import React from 'react';

import { OrthoMCLPage } from 'ortho-client/components/layout/OrthoMCLPage';
import {
  RecordTable as GroupRecordTable,
  RecordAttributeSection as GroupRecordAttributeSection
} from 'ortho-client/records/GroupRecordClasses.GroupRecordClass';
import {
  RecordTable as SequenceRecordTable
} from 'ortho-client/records/SequenceRecordClasses.SequenceRecordClass';
import {
  RecordAttributeSectionProps,
  RecordTableProps
} from 'ortho-client/records/Types';

export default {
  Page: () => OrthoMCLPage,
  RecordAttributeSection: makeDynamicWrapper('RecordAttributeSection', (props: RecordAttributeSectionProps) => props.recordClass.fullName),
  RecordTable: makeDynamicWrapper('RecordTable', (props: RecordTableProps) => props.recordClass.fullName)
};

const GROUP_RECORD_CLASS_NAME = 'GroupRecordClasses.GroupRecordClass';
const SEQUENCE_RECORD_CLASS_NAME = 'SequenceRecordClasses.SequenceRecordClass';

const wrappedComponentsByRecordClass: Record<string, Record<string, React.ComponentType<any>>> = {
  [GROUP_RECORD_CLASS_NAME]: {
    RecordAttributeSection: GroupRecordAttributeSection,
    RecordTable: GroupRecordTable
  },
  [SEQUENCE_RECORD_CLASS_NAME]: {
    RecordTable: SequenceRecordTable
  }
};

function makeDynamicWrapper<P>(componentName: string, getWrapperType: (props: P) => string) {
  return function dynamicWrapper(DefaultComponent: React.ComponentType<P>) {
    return function WrappedComponent(props: P) {
      const wrapperType = getWrapperType(props);
      const availableWrappers = wrappedComponentsByRecordClass[wrapperType] || {};
      const ResolvedComponent = availableWrappers[componentName] || DefaultComponent;

      return <ResolvedComponent {...props} DefaultComponent={DefaultComponent} />;
    };
  };
}
