/**
 * "properties": {
 *   "scope": [
 *     "download"
 *   ],
 *   "recordClassName": [
 *     "OrganismRecordClasses.OrganismRecordClass"
 *   ],
 *   "name": [
 *     "is_reference_strain"
 *   ],
 *   "label": [
 *     "OrganismRecordClasses.OrganismRecordClass.is_reference_strain"
 *   ],
 *   "targetType": [
 *     "attribute"
 *   ]
 * },
 *
 * AttributeField JSON will have the following form:
 * {
 *   name: String,
 *   displayName: String,
 *   help: String,
 *   align: String,
 *   isSortable: Boolean,
 *   isRemovable: Boolean,
 *   type: String (comes from “type” property of attribute tag),
 *   category: String,
 *   truncateTo: Integer,
 *   isDisplayable: Boolean,
 *   isInReport: Boolean,
 *   properties: Object
 * }
 *
 * WDK Question objects have the following form:
 * {
 *   name: String,
 *   displayName: String,
 *   shortDisplayName: String,
 *   description: String,
 *   help: String,
 *   newBuild: Number,
 *   reviseBuild: Number,
 *   urlSegment: String,
 *   class: String,
 *   parameters: [ see ParamFormatters ],
 *   defaultAttributes: [ String ],
 *   dynamicAttributes: [ see AttributeFieldFormatter ],
 *   defaultSummaryView: String,
 *   summaryViewPlugins: [ String ]
 * }
 */

import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import Link from 'wdk-client/Components/Link/Link';
import CheckboxTree, { LinksPosition } from '@veupathdb/coreui/dist/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { getNodeChildren, getPropertyValue } from 'wdk-client/Utils/OntologyUtils';
import { getTargetType, getRefName, getDisplayName, getDescription, getNodeId, getId } from 'wdk-client/Utils/CategoryUtils';
import { areTermsInString, makeSearchHelpText } from 'wdk-client/Utils/SearchUtils';

/**
 * Displays site map page, basically just a custom expandable tree
 */
let SiteMap = props => {
  let treeProps = {
    tree: props.tree,
    getNodeId: getNodeId,
    getNodeChildren: getNodeChildren,
    showRoot: false,
    renderNode: renderSiteMapNode,
    expandedList: props.expandedList,
    onExpansionChange: props.siteMapActions.updateExpanded,
    isSelectable: false,
    isSearchable: true,
    showSearchBox: true,
    searchBoxPlaceholder: "Search for data...",
    searchBoxHelp: makeSearchHelpText("the items by name or description"),
    searchTerm: props.searchText,
    onSearchTermChange: props.siteMapActions.setSearchText,
    searchPredicate: siteMapSearchPredicate
  };
  return (
    <div>
      <h1>Data Finder</h1>
      <p>
        Use this tool to find searches, tracks and data pages that might
        contain data you are interested in.
      </p>
      <CheckboxTree 
        {...treeProps} 
        linksPosition={LinksPosition.Top}
      />
    </div>
  );
};

/**
 * Collects relevant data from the node, used by the search predicate and the
 * display component.
 */
let getNodeData = node => {
  let data = {};
  data.id = getId(node);
  data.targetType = getTargetType(node);
  data.siteMapSpecial = getPropertyValue('SiteMapSpecial', node);
  data.ontologyParent = getPropertyValue('ontologyParent', node);
  data.recordClassDisplayName = getPropertyValue('recordClassDisplayName', node);
  data.name = getRefName(node);
  if (node.wdkReference) {
    let tt = data.targetType === "search"? "" : " (" + data.targetType + ")";
    data.displayName = node.wdkReference.displayName + tt;
    data.description = node.wdkReference.description;
  }
  else if (data.targetType === "track"){
    data.displayName = getPropertyValue('name', node);
  }
  else if (data.targetType === "dataset"){
    data.displayName = data.targetType + ": " + getDisplayName(node);
  }
  else {
    data.displayName = getDisplayName(node);
    data.description = getDescription(node);
  }
  return data;
};

/**
 * Defines how to search for site-map nodes
 */
let siteMapSearchPredicate = (node, searchQueryTerms) => {
  let data = getNodeData(node);
  let strings = [ data.recordClassDisplayName, data.displayName /* , data.description */ ];
  let searchableString = strings.join();
  let flag = areTermsInString(searchQueryTerms, searchableString);
  return flag;
};

/**
 * Defines how to display site-map nodes
 */
let renderSiteMapNode = node => {
  let data = getNodeData(node);

  if (data.targetType === 'search') {
    return (
      <a href={'../showQuestion.do?questionFullName=' + data.name}>
        <span title={data.description}><em>{data.recordClassDisplayName} by {data.displayName}</em></span>
      </a>
    );
  }
  if (data.siteMapSpecial) {
    if (data.displayName.match(/ Page$/)) {
      return (
        <Link to={'/record/gene/PF3D7_1133400#' + data.ontologyParent}>
          <span title={data.description}>{data.displayName}</span>
        </Link>
      );
    }
    return ( <span title={data.description}><em>{data.displayName}</em></span> );
  }

  if (!data.targetType) {
    return ( <span title={data.description}><strong>{data.displayName}</strong></span> );
  }

  return ( <span title={data.description}>{data.displayName}</span> );
};

export default wrappable(SiteMap);
