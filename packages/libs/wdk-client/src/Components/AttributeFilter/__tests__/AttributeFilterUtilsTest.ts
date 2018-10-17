import { getTree, removeIntermediateNodesWithSingleChild, findAncestorFields } from '../AttributeFilterUtils';
import { Field, FieldTreeNode } from '../Types';

describe('getTree', () => {

  it('Should create a tree', () => {
    const input: Array<Field> = [
      { term: '0', display: '0' },
      { term: '1', display: '1', parent: '0' },
      { term: '2', display: '2', parent: '0' },
      { term: '3', display: '3', parent: '1' },
      { term: '4', display: '4', parent: '2' },
    ];

    const expected: FieldTreeNode = {
      field: input[0],
      children: [
        {
          field: input[1],
          children: [
            {
              field: input[3],
              children: []
            }
          ]
        },
        {
          field: input[2],
          children: [
            {
              field: input[4],
              children: []
            }
          ]
        }
      ]
    };
    expect(getTree(input)).toEqual(expected);
  });

  it('Should collapse chain of intermediate nodes with single child', () => {
    const input: FieldTreeNode = {
      field: { term: '0', display: '0' },
      children: [
        {
          field: { term: '1', display: '1' },
          children: [
            {
              field: { term: '2', display: '2' },
              children: [
                {
                  field: { term: '3a', display: '3a' },
                  children: []
                },
                {
                  field: { term: '3b', display: '3b' },
                  children: [
                    {
                      field: { term: '4', display: '4' },
                      children: [
                        {
                          field: { term: '5', display: '5' },
                          children: []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
    const expected: FieldTreeNode = {
      field: { term: '0', display: '0' },
      children: [
       {
         field: { term: '2', display: '2' },
          children: [
            {
              field: { term: '3a', display: '3a' },
              children: []
            },
            {
              field: { term: '5', display: '5' },
              children: []
            }
          ]
        }
      ]
    }
    expect(removeIntermediateNodesWithSingleChild(input)).toEqual(expected);
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