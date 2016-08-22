/* global wdk */
import {render} from 'react-dom';
import {pick} from 'lodash';
import {getTargetType, getDisplayName, getRefName, getTooltipContent} from 'wdk-client/CategoryUtils';
import {CategoriesCheckboxTree, Tooltip} from 'wdk-client/Components';
import {getSearchMenuCategoryTree} from '../wdkCustomization/js/client/util/category';
import context from '../wdkCustomization/js/client/main';

wdk.namespace('apidb.bubble', ns => {
  ns.initialize = ($el, attrs) => {
    let options = pick(attrs, 'include', 'exclude');
    Promise.all([
      context.wdkService.getOntology(),
      context.wdkService.getRecordClasses()
    ]).then(([ ontology, recordClasses ]) => getSearchMenuCategoryTree(ontology, recordClasses, options)).then(tree => {
      if (tree.children.length === 1) {
        renderBubble({ tree: tree.children[0] }, $el[0]);
      } else {
        renderBubble({ tree }, $el[0]);
      }
    }).catch(console.error.bind(console));
  };
});

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
