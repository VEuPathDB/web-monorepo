/* global wdk */
import {render} from 'react-dom';
import {indexBy} from 'lodash';
import {isQualifying, getTargetType, getDisplayName, getRefName} from 'wdk-client/CategoryUtils';
import {getTree} from 'wdk-client/OntologyUtils';
import {preorderSeq} from 'wdk-client/TreeUtils';
import {CategoriesCheckboxTree, Tooltip} from 'wdk-client/Components';

wdk.namespace('apidb.bubble', ns => {
  ns.initialize = ($el, attrs) => {
    let ontology$ = wdk.client.runtime.wdkService.getOntology();
    let recordClasses$ = wdk.client.runtime.wdkService.getRecordClasses();
    Promise.all([ontology$, recordClasses$]).then(([ontology, recordClasses]) => {
      let recordClassMap = indexBy(recordClasses, 'name');
      let searchTrees = attrs.recordClasses
      .map(name => recordClassMap[name])
      .map(makeSearchTree(ontology));
      let tree = searchTrees.length === 1
        // render single tree with categories
        ? searchTrees[0]
        // render multiple trees without ontology categories
        : {
            children: searchTrees.map(searchTree => {
              return Object.assign(searchTree, {
                // assign the array of all leaf nodes to children of searchTree
                children: preorderSeq(searchTree).filter(node => node.children.length === 0).toArray()
              });
            })
          };
      renderBubble({ tree }, $el[0]);
    });
  };
});

function renderBubble(props, el) {
  render((
    <CategoriesCheckboxTree
      {...props}
      isSelectable={false}
      searchBoxPlaceholder="Find a search"
      leafType="search"
      nodeComponent={BubbleNode}
      onUiChange={expandedBranches => renderBubble(Object.assign({}, props, {expandedBranches}), el)}
      onSearchTermChange={searchTerm => renderBubble(Object.assign({}, props, {searchTerm}), el)}
    />
  ), el);
}

function BubbleNode(props) {
  let { node } = props;
  return getTargetType(node) === 'search'
    ? <Tooltip content={node.wdkReference.summary}>
        <a href={'showQuestion.do?questionFullName=' + getRefName(node)}>
          {getDisplayName(node)}
        </a>
      </Tooltip>
    : <span>{getDisplayName(node)}</span>
}

function makeSearchTree(ontology) {
  return recordClass => {
    let tree = getTree(ontology, isQualifying('search', recordClass.name, 'menu'))
    // replace the root of the tree with a record class category node
    return {
      properties: {
        label: [recordClass.name],
        'EuPathDB alternative term': [recordClass.displayNamePlural]
      },
      children: tree.children
    };
  };
}
