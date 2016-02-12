import React from 'react';
import ReactDOM from 'react-dom';
import CheckboxTreeController from './checkboxTreeController';
import {
  getTree,
  nodeHasProperty,
  getPropertyValue,
  getTargetType,
  getRefName,
  getId,
  getDisplayName,
  getDescription
} from 'wdk-client-utils/OntologyUtils';
import {
  getAttribute
} from 'wdk-client-utils/WdkUtils';
import WdkService from 'wdk-client-utils/WdkService';


wdk.util.namespace("eupathdb.attributeCheckboxTree", function(ns, $) {
  "use strict";

  /**
   * Entry into checkbox tree load for the attribute checkbox tree which appears when the user
   * clicks the Add Columns button on the header of the results table.
   * @param element - div from which this function was called.
   * @param attributes - attributes derived from the div - question name, record class name, default selected list, current selected list,
   * view name
   * @returns {Promise.<T>}
   */
  function setupCheckboxTree(element, attributes) {
    let questionName = attributes.questionName;
    let recordClassName = attributes.recordClassName;
    let defaultSelectedList = attributes.defaultSelectedList.replace(/'/g,"").split(",");
    let currentSelectedList = attributes.currentSelectedList.replace(/'/g,"").split(",");
    let viewName = attributes.viewName;
    let viewMap = {'_default':'gene', 'transcript-view':'transcript'};
    viewName = viewMap[viewName];
    let ServiceUrl = window.location.href.substring(0,
        window.location.href.indexOf("showApplication.do")) + "service";
    let service = new WdkService(ServiceUrl);
    return Promise.all(
      [service.getOntology('Categories'),
       service.findQuestion(question => question.name === questionName),
       service.findRecordClass(recordClass => recordClass.name === recordClassName)]
    ).then(([categoriesOntology, question, recordClass]) => {
        let categoryTree = getTree(categoriesOntology, isQualifying(recordClassName, viewName));
        addSearchSpecificSubtree(question, categoryTree, recordClassName, viewName);
        let selectedList = currentSelectedList || defaultSelectedList;
        let callback = getAttributes(recordClass);
        let controller = new CheckboxTreeController(element, "attributeList_" + viewName, categoryTree.children, selectedList, defaultSelectedList, callback);
        controller.displayCheckboxTree();
    }).catch(function(error) {
      throw new Error(error.message);
    });
  }

  /**
   * Create a predicate function to filter out of the Categories ontology tree those items appropriate for the
   * results page that identify attributes for the current record class.  In the case of the Transcript Record Class, a
   * distinction is made depending on whether the summary view applies to transcripts or genes.
   * @param recordClassName - full name of the current record class
   * @param viewName - either gene or transcript depending on the summary view
   */
  let isQualifying = (recordClassName, viewName) => node => {
      let qualified = nodeHasProperty('targetType', 'attribute', node)
                    && nodeHasProperty('recordClassName', recordClassName, node)
                    && nodeHasProperty('scope', 'results', node);
      if(qualified && recordClassName === 'TranscriptRecordClasses.TranscriptRecordClass' && viewName==="gene") {
        qualified = nodeHasProperty('geneOrTranscript', "gene", node);
      }
      return qualified;
  };

  /**
   * Create a separate search specific subtree, based upon the question asked and tack it onto the start of top level array
   * of nodes in the ontology tree
   * @param question - question posited
   * @param categoryTree - the munged ontology tree
   * @param recordClassName - full name of the record class
   * @param viewName - the name of the view (not sure how that will fly if everything else is _default
   */
  function addSearchSpecificSubtree(question, categoryTree, recordClassName, viewName) {
    if(question.dynamicAttributes.length > 0 && (recordClassName != 'TranscriptRecordClasses.TranscriptRecordClass' ||
       (!question.properties.questionType || (question.properties.questionType.indexOf('transcript') > -1 && viewName==="transcript")))) {
      let subtree = {
        "question":true,
        "id": "search-specific-subtree",
        "displayName": "Search Specific",
        "description": "Information about the records returned that is specific to the search you ran, and the parameters you specified",
        "children": []
      };
      question.dynamicAttributes.forEach(attribute => {
        let node = {
          "question":true,
          "id": attribute.name,
          "displayName": attribute.displayName,
          "descripton": attribute.help,
          "children":[]
        };
        subtree.children.push(node);
      });
      categoryTree.children.unshift(subtree);
    }
  }

  /**
   * Curried function that returned an record class attribute lookup based upon record class and given node.
   * @param recordClass - the record class containing the attributes to check
   * @returns {Function} - function with node argument to return the record class attribute, if found, related to the given node
   */
  function getAttributes(recordClass) {
    return node => {
      return getAttribute(recordClass, getRefName(node));
    }
  }

  ns.setupCheckboxTree = setupCheckboxTree;
  
});