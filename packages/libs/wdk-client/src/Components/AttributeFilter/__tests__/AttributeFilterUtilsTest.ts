import { getTree, removeIntermediateNodesWithSingleChild, findAncestorFields } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';
import { Field, FieldTreeNode } from 'wdk-client/Components/AttributeFilter/Types';

const ontology = require('wdk-client/Components/AttributeFilter/__tests__/TestOntology.json');

describe('getTree', () => {

  it('Should create a tree', () => {
    const tree = getTree(ontology);
    expect(tree).toMatchSnapshot();
  });

  it('Should collapse chain of intermediate nodes with single child', () => {
    const tree = getTree(ontology);
    const modifiedTree = removeIntermediateNodesWithSingleChild(tree);

    expect(modifiedTree).toMatchSnapshot();
  });

})

describe('findAncestorFields', () => {
  it('Should return the correct path of ancestor terms', () => {
    const fields: Array<Field> = [
      { term: '0', display: '0' },
      { term: '1', display: '1', parent: '0' },
      { term: '2', display: '2', parent: '0' },
      { term: '3', display: '3', parent: '2' },
      { term: '4', display: '4', parent: '2' },
      { term: '5', display: '5', parent: '4' },
      { term: '6', display: '6', parent: '5' },
    ];

    const tree = getTree(fields);

    expect(findAncestorFields(tree, '3').toArray()).toEqual([fields[0], fields[2], fields[3]]);
    expect(findAncestorFields(tree, '6').toArray()).toEqual([fields[0], fields[2], fields[4], fields[5], fields[6]]);
  })
})