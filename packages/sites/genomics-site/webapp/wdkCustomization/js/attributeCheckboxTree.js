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
        let categoryTree = getTree(categoriesOntology, isQualifying(recordClassName, viewName, 'results'));
        addSearchSpecificSubtree(question, categoryTree, recordClassName, viewName);
        let selectedList = currentSelectedList || defaultSelectedList;
        let controller = new CheckboxTreeController(element, "attributeList_" + viewName, categoryTree.children, "selectedFields", selectedList, defaultSelectedList);
        controller.displayCheckboxTree();
    }).catch(function(error) {
      throw new Error(error.message);
    });
  }


  /**
   * Create a predicate function to filter out of the Categories ontology tree those items appropriate for the given
   * scope that identify attributes for the current record class.  In the case of the Transcript Record Class, a
   * distinction is made depending on whether the summary view applies to transcripts or genes.
   * 
   * @param recordClassName - full name of the current record class
   * @param viewName - either gene or transcript depending on the summary view
   */
  let isQualifying = (recordClassName, viewName, scope) => node => {
      let qualified = nodeHasProperty('targetType', 'attribute', node)
                    && nodeHasProperty('recordClassName', recordClassName, node)
                    && nodeHasProperty('scope', scope, node);
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
      let subtree = createNode("search_specific_subtree","Search Specific",
                               "Information about the records returned that is specific to the search you ran, and the parameters you specified");
      question.dynamicAttributes.forEach(attribute => {
        let node = createNode(attribute.name, attribute.displayName, attribute.help);
        subtree.children.push(node);
      });
      categoryTree.children.unshift(subtree);
    }
  }

  /**
   * Returns a JSON object representing a simplified category tree node that will be properly interpreted
   * by the checkboxTreeController
   * @param id - name or id of the node
   * @param displayName - name to be displayed
   * @param description - tooltip
   * @returns {{properties: {targetType: string[], name: *[]}, wdkReference: {displayName: *, help: *}, children: Array}}
   */
  function createNode(id, displayName, description) {
    return {
      "properties" : {
        "targetType" : ["attribute"],
        "name" : [id]
      },
      "wdkReference" : {
        "displayName" : displayName,
        "help" : description
      },
      "children":[]
    }
  }

  ns.setupCheckboxTree = setupCheckboxTree;
  ns.isQualifying = isQualifying;
  ns.addSearchSpecificSubtree = addSearchSpecificSubtree;

});