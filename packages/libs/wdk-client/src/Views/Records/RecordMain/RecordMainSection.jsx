import PropTypes from 'prop-types';
import { flowRight } from 'lodash';
import React from 'react';
import RecordMainCategorySection from '../../../Views/Records/RecordMain/RecordMainCategorySection';
import { pure, wrappable } from '../../../Utils/ComponentUtils';
import { getId, getLabel } from '../../../Utils/CategoryUtils';

/** @type {React.FunctionComponent} */
let RecordMainSection$;

const RecordMainSection = ({
  depth = 0,
  record,
  recordClass,
  tableStates,
  updateTableState,
  categories,
  collapsedSections,
  parentEnumeration,
  onSectionToggle,
  requestPartialRecord,
}) =>
  categories == null ? null : (
    <>
      {categories.map((category, index) => {
        let categoryName = getLabel(category);
        let categoryId = getId(category);
        let enumeration = String(
          parentEnumeration == null
            ? index + 1
            : parentEnumeration + '.' + (index + 1)
        );

        return (
          <RecordMainCategorySection
            key={categoryName}
            category={category}
            depth={depth}
            enumeration={enumeration}
            isCollapsed={collapsedSections.includes(categoryId)}
            onSectionToggle={onSectionToggle}
            record={record}
            recordClass={recordClass}
            tableStates={tableStates}
            requestPartialRecord={requestPartialRecord}
            updateTableState={updateTableState}
          >
            <RecordMainSection$
              depth={depth + 1}
              record={record}
              recordClass={recordClass}
              tableStates={tableStates}
              categories={category.children}
              collapsedSections={collapsedSections}
              parentEnumeration={enumeration}
              onSectionToggle={onSectionToggle}
              requestPartialRecord={requestPartialRecord}
              updateTableState={updateTableState}
            />
          </RecordMainCategorySection>
        );
      })}
    </>
  );

RecordMainSection.propTypes = {
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
  tableStates: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  collapsedSections: PropTypes.array.isRequired,
  onSectionToggle: PropTypes.func.isRequired,
  depth: PropTypes.number,
  parentEnumeration: PropTypes.string,
};

// Append `$` so we can refer to this component recursively. We want to reserve
// the normal name `RecordMainSection` for the inner function for debugging purposes.
RecordMainSection$ = flowRight(wrappable, pure)(RecordMainSection);

export default RecordMainSection$;
