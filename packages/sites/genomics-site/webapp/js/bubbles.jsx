/* global ebrc, wdk */
import {negate} from 'lodash';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import {getTargetType, getDisplayName, getRecordClassUrlSegment, getTooltipContent} from 'wdk-client/Utils/CategoryUtils';
import {CategoriesCheckboxTree, Tooltip, Icon, Link} from 'wdk-client/Components';

function isTranscriptNode(node) {
  return node.properties.label[0] === 'TranscriptRecordClasses.TranscriptRecordClass';
}

function Bubble({ tree }) {
  const [ expandedBranches, setExpandedBranches ] = useState(undefined);
  const [ searchTerm, setSearchTerm ] = useState(undefined);

  if (tree == null) return null;
  
  return (
    <CategoriesCheckboxTree
      tree={tree}
      expandedBranches={expandedBranches}
      searchTerm={searchTerm}
      isSelectable={false}
      searchBoxPlaceholder="Find a search..."
      leafType="search"
      renderNode={renderBubbleNode}
      renderNoResults={renderNoResults}
      onUiChange={setExpandedBranches}
      onSearchTermChange={setSearchTerm}
    />
  );
}

function renderBubbleNode(node) {
  let displayElement = getTargetType(node) === 'search'
    ? <Link to={`/search/${getRecordClassUrlSegment(node)}/${node.wdkReference.urlSegment}`}>
        {getDisplayName(node)}
      </Link>
    : <span>{getDisplayName(node)}</span>
  return (
    <Tooltip content={getTooltipContent(node)}>
      {displayElement}
    </Tooltip>
  );
}

function renderNoResults(searchTerm) {
  return (
    <div>
      <p>
        <Icon type="warning"/> We could not find any searches matching "{searchTerm}".
      </p>

      <p>
        If you are looking for a particular Gene, you can&nbsp;
        <a
          href={`/a/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag&ds_gene_ids_data=${searchTerm}`}
        >search by Gene ID</a>
        &nbsp;or&nbsp;
        <a
          href={`/a/showQuestion.do?questionFullName=GeneQuestions.GenesByTextSearch&value(text_expression)=${searchTerm}`}
        >search based on text</a>.
      </p>
    </div>
  )
}

const SearchBubble = connect(
  (state, props) => {
    const { searchTree } = state.globalData;
    const tree = searchTree == null ? undefined 
    : props.isTranscript ? searchTree.children.find(isTranscriptNode)
    : {
      ...searchTree,
      children: searchTree.children.filter(negate(isTranscriptNode))
    };
    return { tree };
  }
)(Bubble);

wdk.namespace('apidb.bubble', ns => {
  ns.resolver = name => name === 'SearchBubble' ? SearchBubble : undefined;
});
