/* global ebrc, wdk, Wdk */
import {negate} from 'lodash';
import {render} from 'react-dom';
import {getTargetType, getDisplayName, getRefName, getTooltipContent} from 'wdk-client/CategoryUtils';
import {CategoriesCheckboxTree, Tooltip, Icon} from 'wdk-client/Components';

wdk.namespace('apidb.bubble', ns => {
  const { store } = ebrc.context;

  ns.initialize = ($el, attrs) => {
    const unsubscribe = store.subscribe(() => {
      const { searchTree } = store.getState().globalData;
      if (searchTree) {
        unsubscribe();
        const tree = attrs.isTranscript
          ? searchTree.children.find(isTranscriptNode)
          : {
            ...searchTree,
            children: searchTree.children.filter(negate(isTranscriptNode))
          };
        renderBubble({ tree }, $el[0]);
      }
    });
  };
});

function isTranscriptNode(node) {
  return node.properties.label[0] === 'TranscriptRecordClasses.TranscriptRecordClass';
}

function renderBubble(props, el) {
  render((
    <CategoriesCheckboxTree
      {...props}
      isSelectable={false}
      searchBoxPlaceholder="Find a search..."
      leafType="search"
      nodeComponent={BubbleNode}
      onUiChange={expandedBranches => renderBubble(merge(props, {expandedBranches}), el)}
      onSearchTermChange={searchTerm => renderBubble(merge(props, {searchTerm}), el)}
      noResultsComponent={NoResults}
    />
  ), el);
}

function merge(source, props) {
  return Object.assign({}, source, props);
}

function BubbleNode(props) {
  let { node } = props;
  let displayElement = getTargetType(node) === 'search'
    ? <a href={'showQuestion.do?questionFullName=' + getRefName(node)}>
        {getDisplayName(node)}
      </a>
    : <span>{getDisplayName(node)}</span>
  return (
    <Tooltip content={getTooltipContent(node)}>
      {displayElement}
    </Tooltip>
  );
}

function NoResults({ searchTerm }) {
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
