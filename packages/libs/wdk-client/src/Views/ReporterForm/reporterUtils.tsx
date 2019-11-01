import { getTree } from 'wdk-client/Utils/OntologyUtils';
import { isQualifying, addSearchSpecificSubtree, CategoryOntology } from 'wdk-client/Utils/CategoryUtils';
import { AttributeField, Question, RecordClass, TableField } from 'wdk-client/Utils/WdkModel';
import { UserPreferences } from 'wdk-client/Utils/WdkUser';

/**
 * Typical attachment type vocabulary for reporter forms
 */
export let attachmentTypes = [
  { value: "text", display: "Text File" },
  { value: "plain", display: "Show in Browser" }
];

export let tabularAttachmentTypes = [
  { value: "text", display: "Tab-delimited (.txt) file" },
  { value: "csv", display: "Comma-delimited (.csv) file*" },
  /*{ value: "excel", display: "Excel file*" },*/
  { value: "plain", display: "Show in browser"}
];

/**
 * Predicate to tell whether a given object should be shown in a reporter form
 */
export function isInReport(obj: { isInReport: boolean }) {
  return obj.isInReport;
}

/**
 * Retrieves attribute metadata objects from the passed record class that pass
 * the predicate and appends any reporter dynamic attribute metadata (that pass
 * the predicate) from the question.
 */
export function getAllAttributes(recordClass: RecordClass, question: Question, predicate: (attr: AttributeField) => boolean) {
  let attributes = recordClass.attributes.filter(predicate);
  question.dynamicAttributes.filter(predicate)
    .forEach(reportAttr => { attributes.push(reportAttr); });
  return attributes;
}

/**
 * Retrieves table metadata objects from the passed record class that pass the
 * predicate.
 */
export function getAllTables(recordClass: RecordClass, predicate: (table: TableField) => boolean) {
  return recordClass.tables.filter(predicate);
}

/**
 * Initializes form attribute state based on:
 *   1. user preferences if they exist
 *   2. default columns for the question
 * Then must trim off any non-download-scope attributes
 */
export function getAttributeSelections(userPrefs: UserPreferences, question: Question, allReportScopedAttrs: string[] = []) {
  // try initializing based on user prefs
  let userPrefKey = question.name + "_summary";
  let initialAttrs = (userPrefKey in userPrefs ?
      // preference key found; use user preference
      userPrefs.project[userPrefKey].split(',') :
      // otherwise, use default attribs from question
      question.defaultAttributes);
  // now must trim off any that do not appear in the tree (probably results-page scoped)
  return initialAttrs.filter(attr => allReportScopedAttrs.indexOf(attr) != -1);
}

export function getAttributeTree(categoriesOntology: CategoryOntology, recordClassName: string, question: Question) {
  let categoryTree = getTree(categoriesOntology, isQualifying({
    targetType: 'attribute',
    recordClassName,
    scope: 'download'
  }));
  return addSearchSpecificSubtree(question, categoryTree);
}

export function getTableTree(categoriesOntology: CategoryOntology, recordClassName: string) {
  let categoryTree = getTree(categoriesOntology, isQualifying({
    targetType: 'table',
    recordClassName,
    scope: 'download'
  }));
  return categoryTree;
}

/**
 * Special implementation of a regular form change handler that adds the
 * recordclass's primary key to any new value passed in
 */
export function getAttributesChangeHandler<T extends {}>(
  inputName: string,
  onParentChange: (t: T) => void,
  previousState: T,
  recordClass: RecordClass
) {
  return (newAttribsArray: string[]) => {
    onParentChange(Object.assign({}, previousState, { [inputName]: addPk(newAttribsArray, recordClass) }));
  };
}

/**
 * Inspects the passed attributes array.  If the recordClass's primary key
 * attribute is not already in the array, returns a copied array with the PK as
 * the first element.  If not, simply returns the passed array.
 */
export function addPk(attributesArray: string[], recordClass: RecordClass) {
  return prependAttrib(recordClass.recordIdAttributeName, attributesArray);
}

export function prependAttrib(attribName: string, attributesArray: string[]) {
  let currentIndex = attributesArray.indexOf(attribName);
  if (currentIndex > -1) {
    // attrib already present, copy passed array and remove existing instance
    attributesArray = attributesArray.slice();
    attributesArray.splice(currentIndex, 1);
  }
  // prepend clean array with passed attrib name
  return [ attribName ].concat(attributesArray);
}
