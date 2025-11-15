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
 *   type: String (comes from "type" property of attribute tag),
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
import { wrappable } from '../../Utils/ComponentUtils';
import Link from '../../Components/Link/Link';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { getNodeChildren, getPropertyValue, OntologyNode } from '../../Utils/OntologyUtils';
import {
  getTargetType,
  getRefName,
  getDisplayName,
  getDescription,
  getNodeId,
  getId,
  isIndividual,
  CategoryTreeNode,
} from '../../Utils/CategoryUtils';
import { areTermsInString, makeSearchHelpText } from '../../Utils/SearchUtils';
import { SiteMapOntology } from '../../Actions/SiteMapActions';

/**
 * Data structure for node information used by search and display
 */
interface NodeData {
  id?: string;
  targetType?: string;
  siteMapSpecial?: string;
  ontologyParent?: string;
  recordClassDisplayName?: string;
  name?: string;
  displayName?: string;
  description?: string;
}

/**
 * Props for the SiteMap component
 */
interface SiteMapProps {
  tree: SiteMapOntology;
  expandedList: string[];
  searchText: string;
  siteMapActions: {
    updateExpanded: (expandedList: string[]) => void;
    setSearchText: (searchText: string) => void;
  };
}

/**
 * Displays site map page, basically just a custom expandable tree
 */
const SiteMap: React.FC<SiteMapProps> = (props) => {
  const treeProps = {
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
    searchBoxPlaceholder: 'Search for data...',
    searchBoxHelp: makeSearchHelpText('the items by name or description'),
    searchTerm: props.searchText,
    onSearchTermChange: props.siteMapActions.setSearchText,
    searchPredicate: siteMapSearchPredicate,
  };
  return (
    <div>
      <h1>Data Finder</h1>
      <p>
        Use this tool to find searches, tracks and data pages that might contain
        data you are interested in.
      </p>
      <CheckboxTree {...treeProps} linksPosition={LinksPosition.Top} />
    </div>
  );
};

/**
 * Collects relevant data from the node, used by the search predicate and the
 * display component.
 */
const getNodeData = (node: CategoryTreeNode): NodeData => {
  const data: NodeData = {};
  data.id = getId(node);
  data.targetType = getTargetType(node);
  data.siteMapSpecial = getPropertyValue('SiteMapSpecial', node);
  data.ontologyParent = getPropertyValue('ontologyParent', node);
  data.recordClassDisplayName = getPropertyValue(
    'recordClassDisplayName',
    node
  );
  data.name = getRefName(node);
  if (isIndividual(node)) {
    const tt = data.targetType === 'search' ? '' : ' (' + data.targetType + ')';
    data.displayName = node.wdkReference.displayName + tt;
    data.description = node.wdkReference.description;
  } else if (data.targetType === 'track') {
    data.displayName = getPropertyValue('name', node);
  } else if (data.targetType === 'dataset') {
    data.displayName = data.targetType + ': ' + getDisplayName(node);
  } else {
    data.displayName = getDisplayName(node);
    data.description = getDescription(node);
  }
  return data;
};

/**
 * Defines how to search for site-map nodes
 */
const siteMapSearchPredicate = (
  node: CategoryTreeNode,
  searchQueryTerms: string[]
): boolean => {
  const data = getNodeData(node);
  const strings = [
    data.recordClassDisplayName,
    data.displayName /* , data.description */,
  ];
  const searchableString = strings.join();
  const flag = areTermsInString(searchQueryTerms, searchableString);
  return flag;
};

/**
 * Defines how to display site-map nodes
 */
const renderSiteMapNode = (node: CategoryTreeNode): React.ReactElement => {
  const data = getNodeData(node);

  if (data.targetType === 'search') {
    return (
      <a href={'../showQuestion.do?questionFullName=' + data.name}>
        <span title={data.description}>
          <em>
            {data.recordClassDisplayName} by {data.displayName}
          </em>
        </span>
      </a>
    );
  }
  if (data.siteMapSpecial) {
    if (data.displayName?.match(/ Page$/)) {
      return (
        <Link to={'/record/gene/PF3D7_1133400#' + data.ontologyParent}>
          <span title={data.description}>{data.displayName}</span>
        </Link>
      );
    }
    return (
      <span title={data.description}>
        <em>{data.displayName}</em>
      </span>
    );
  }

  if (!data.targetType) {
    return (
      <span title={data.description}>
        <strong>{data.displayName}</strong>
      </span>
    );
  }

  return <span title={data.description}>{data.displayName}</span>;
};

export default wrappable(SiteMap);
