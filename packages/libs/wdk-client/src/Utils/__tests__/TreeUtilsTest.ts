import * as TreeUtils from 'wdk-client/Utils/TreeUtils';

test('preorderSeq', function() {
  let tree = {
    id: 1,
    children: [
      { id: 2, children: [] },
      { id: 3, children: [
        { id: 4, children: [] }
      ]}
    ]
  };

  let ids = TreeUtils.preorderSeq(tree)
    .map(n => n.id)
    .toArray();

  expect(ids).toEqual([ 1, 2, 3, 4]);

});

test('postorderSeq', function() {
  let tree = {
    id: 1,
    children: [
      { id: 2, children: [] },
      { id: 3, children: [
        { id: 4, children: [] }
      ]}
    ]
  };

  let ids = TreeUtils.postorderSeq(tree)
    .map(n => n.id)
    .toArray();

  expect(ids).toEqual([ 2, 4, 3, 1 ]);

});

test('mapStructure', function() {
  let tree = {
    id: 1,
    children: [
      { id: 2, children: [] },
      { id: 3, children: [
        { id: 4, children: [] }
      ]}
    ]
  };
  let expectedStructure = {
    number: 1,
    subNumbers: [
      { number: 2, subNumbers: [] },
      { number: 3, subNumbers: [
        { number: 4, subNumbers: [] }
      ]}
    ]
  };
  let mappedStructure = TreeUtils.mapStructure(
    (node, mappedChildren) => {
      return {
        number: node.id,
        subNumbers: mappedChildren
      };
    },
    node => node.children, tree);
  expect(mappedStructure).toEqual(expectedStructure);
});

test('foldStructure', () => {

  type Node = {
    id: number;
    children: Node[];
  }
  /*
   *          (id: 1)
   *         /       \
   *     (id: 2)   (id: 3)
   *                   \
   *                 (id: 4)
   *                /       \
   *            (id: 5)   (id: 6)
   */
  let tree = {
    id: 1,
    children: [
      { id: 2, children: [] },
      { id: 3, children: [
        { id: 4, children: [
          { id: 5, children: [] },
          { id: 6, children: [] }
        ] }
      ]}
    ]
  };
  let expected = [ 1, 3, 4, 6 ]
  let fold = (path: Node[], node: Node) => node.id === 6 || path.length ? [ node, ...path ] :  path;
  let result = TreeUtils.foldStructure(fold, [], tree).map(node => node.id)
  expect(result).toEqual(expected);
})

test('compactRootNodes', function() {
  type Node = {
    id: number;
    children: Node[];
  }
  let tree = {
    id: 1,
    children: [
      { id: 2,
        children: [
          {
            id: 3,
            children: [
              {
                id: 4,
                children: []
              }
            ]
          }
        ]
      }
    ]
  };

  let compactedTree = TreeUtils.compactRootNodes(tree) as Node;

  expect(compactedTree.id).toBe(4);

});

test('pruneDescendantNodes', function() {
  let tree = {
    id: 1,
    children: [
      { id: 2,
        children: [
          {
            id: 3,
            children: [
              {
                id: 4,
                children: []
              }
            ]
          }
        ]
      }
    ]
  };

  let expectedTree = {
    id: 1,
    children: [
      {
        id: 4,
        children: [ ]
      }
    ]
  };

  let prunedTree = TreeUtils.pruneDescendantNodes(n => n.id !== 3 && n.id !== 2, tree);

  expect(prunedTree).toEqual(expectedTree);


  // Generate a tree where leaves have certain properties

  let tree2 = {
    id: 1,
    children: [
      { id: 2, children: [] },
      { id: 3, children: [
        { id: 4, children: [] }
      ]}
    ]
  };

  let prunedTree2 = TreeUtils.pruneDescendantNodes(n => n.children.length > 0 || n.id === 2, tree2);

  expect(prunedTree2).toEqual({
    id: 1,
    children: [
      { id: 2, children: [] }
    ]
  });

});

