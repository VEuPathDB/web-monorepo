/* global wdk */
import {render} from 'react-dom';
import {pick} from 'lodash';
import {getTargetType, getDisplayName, getRefName, getTooltipContent} from 'wdk-client/CategoryUtils';
import {CategoriesCheckboxTree, Tooltip, Icon} from 'wdk-client/Components';
import {getSearchMenuCategoryTree} from 'eupathdb/wdkCustomization/js/client/util/category';
import WdkService from 'wdk-client/WdkService';

wdk.namespace('apidb.bubble', ns => {
  const wdkService = WdkService.getInstance(wdk.webappUrl('/service'));

  ns.initialize = ($el, attrs) => {
    let options = pick(attrs, 'include', 'exclude');
    Promise.all([
      wdkService.getOntology(),
      wdkService.getRecordClasses()
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

function NoResults({ searchTerm, defaultMessage }) {
  return (
    <div>
      <p>
        <Icon type="warning"/> We could not find any searches matching "{searchTerm}".
      </p>

      <p>
        If you are looking for a particular Gene, you can search by&nbsp;
        <a
          href={`/a/showQuestion.do?questionFullName=GeneQuestions.GeneByLocusTag&ds_gene_ids_data=${searchTerm}`}
        >Gene ID</a>
        &nbsp;or by&nbsp;
        <a
          href={`/a/showQuestion.do?questionFullName=GeneQuestions.GenesByTextSearch&value(text_expression)=${searchTerm}`}
        >Gene Text</a>.
      </p>
    </div>
  )
}
