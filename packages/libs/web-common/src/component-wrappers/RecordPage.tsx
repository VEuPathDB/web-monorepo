import React from 'react';
import { RecordAttribute } from '@veupathdb/wdk-client/lib/Components';
import { renderWithCustomElements } from '../util/customElements';
import { findExportWith } from './util';
import {
  RecordInstance,
  RecordClass,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// Wrappers
// --------

interface RecordComponentProps {
  record: RecordInstance;
  recordClass: RecordClass;
  overviewRef?: React.RefObject<HTMLDivElement>;
  depth?: number;
  [key: string]: any;
}

export function RecordHeading(
  DefaultComponent: React.ComponentType<RecordComponentProps>
) {
  const DynamicRecordHeading =
    makeDynamicWrapper('RecordHeading')(DefaultComponent);
  return function EbrcRecordHeading(props: RecordComponentProps) {
    return (
      <React.Fragment>
        <DynamicRecordHeading {...props} />
        {renderWithCustomElements(props.record.attributes.record_overview, {
          className: 'eupathdb-RecordOverviewContainer',
          innerRef: props.overviewRef,
        })}
      </React.Fragment>
    );
  };
}

export function RecordMainSection(
  DefaultComponent: React.ComponentType<RecordComponentProps>
) {
  const DynamicRecordMainSection =
    makeDynamicWrapper('RecordMainSection')(DefaultComponent);
  return function EbrcRecordMainSection(props: RecordComponentProps) {
    return (
      <>
        <DynamicRecordMainSection {...props} />
        {!props.depth && 'attribution' in props.record.attributes && (
          <div className="RecordAttribution">
            <hr />
            <h3>Record Attribution</h3>
            <RecordAttribute
              attribute={props.recordClass.attributesMap.attribution}
              record={props.record}
              recordClass={props.recordClass}
            />
          </div>
        )}
      </>
    );
  };
}

export const RecordUI = makeDynamicWrapper('RecordUI');
export const RecordTable = makeDynamicWrapper('RecordTable');
export const RecordAttributeSection = makeDynamicWrapper(
  'RecordAttributeSection'
);

// Helpers
// -------

const findRecordPageComponent = findExportWith(
  require.context('../components/records', true, /\.(js|jsx)$/)
);

/**
 * Uses partially applied `findRecordPageComponent` function to dynamically
 * "import" a component from a record class module.
 *
 * @example
 * ```
 * const RecordTable = makeDynamicWrapper(findRecordPageComponent('RecordTable'));
 * ```
 */
function makeDynamicWrapper(componentName: string) {
  return function dynamicWrapper(
    DefaultComponent: React.ComponentType<RecordComponentProps>
  ) {
    return function DynamicWrapper(props: RecordComponentProps) {
      // Need to append the .js suffix for this to work. Not sure why this
      // changed, but probably related to the prepublish build. @dmfalke
      const ResolvedComponent =
        findRecordPageComponent(componentName)(
          `./${props.recordClass.fullName}.js`
        ) || DefaultComponent;
      return (
        <ResolvedComponent {...props} DefaultComponent={DefaultComponent} />
      );
    };
  };
}
