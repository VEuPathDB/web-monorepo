import { useMemo, useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import CheckboxTree, { CheckboxTreeProps } from '../../components/inputs/SelectTree/CheckboxTree';
import { tree } from './mockTreeData';
import { 
    preorderSeq, 
    findAncestorFields, 
    Field, 
    FieldTreeNode,
    isLeaf,
} from '../../components/inputs/SelectTree/Utils';
import { uniq } from 'lodash';
 
export default {
    title: 'Inputs/CheckboxTree',
    component: CheckboxTree
} as Meta;

const Template: Story<CheckboxTreeProps<unknown>> = (args) => {
    const fieldSequence = useMemo(() => preorderSeq(tree), [tree]);
    const startExpanded = false;
    const mode = 'singleSelection';
    const [ selectedFields, setSelectedFields ] = useState([]);
    const activeField = null;
    const [ searchTerm, setSearchTerm ] = useState<string>('');

    const getPathToField = useCallback(
        (field?: Field) => {
          if (field == null) return [];
    
          return findAncestorFields(tree, field.term)
            .map((field) => field.term)
            .toArray();
        },
        [tree]
      );

    const [expandedNodes, setExpandedNodes] = useState(() =>
      startExpanded
        ? fieldSequence.map((node) => node.field.term).toArray()
        : mode == 'singleSelection'
        ? getPathToField(activeField)
        : uniq(selectedFields.flatMap(getPathToField))
    );

    const searchPredicate = useCallback(
        (node: FieldTreeNode, searchTerms: string[]) => {
            let isMatched = false;
            for (const term of searchTerms) {
                if (node.field.display.toLowerCase().includes(term.toLowerCase())) {
                    isMatched = true;
                    break;
                }
          };
          return isMatched
        },
        []
      );

    const getNodeChildren =  (node: FieldTreeNode) => {
        const showMultiFilterDescendants = true;
        return 'type' in node.field && node.field.type === 'multiFilter' && !showMultiFilterDescendants
          ? []
          : node.children ?? [];
      }

    const nonCheckboxClickEvent = (node: FieldTreeNode) => {
      if (args.isSelectable || !isLeaf(node, getNodeChildren)) return;
      setSelectedFields([ node.field.term ]);
    }
    
    const renderNode = (node: FieldTreeNode) => {
      return (
        <span
          css={{
            backgroundColor: !args.isSelectable && selectedFields.includes(node.field.term) ? '#e6e6e6' : '',
            padding: '0.125em 0.25em',
            borderRadius: '0.25em',
          }}
          onClick={() => nonCheckboxClickEvent(node)}
        >
          {node.field.display}
        </span>
      )
    }
    
    return (
      <>
        <h2>You've selected: {args.isSelectable ? selectedFields.length + ' variables' : selectedFields}</h2>
        <CheckboxTree 
            {...args} 
            expandedList={expandedNodes} 
            onExpansionChange={setExpandedNodes}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedList={selectedFields}
            currentList={selectedFields}
            onSelectionChange={setSelectedFields}
            // @ts-ignore
            renderNode={renderNode}
            // @ts-ignore
            searchPredicate={searchPredicate}
            />
      </>
    )
}

export const AsSingleSelectLinks = Template.bind({});
AsSingleSelectLinks.args = {
    tree,
    expandedList: [],
    additionalFilters: [],
    autoFocusSearchBox: false,
    customCheckboxes: {},
    getNodeChildren: (node: FieldTreeNode) => {
        const showMultiFilterDescendants = true;
        return 'type' in node.field && node.field.type === 'multiFilter' && !showMultiFilterDescendants
          ? []
          : node.children ?? [];
      },
    getNodeId: (node: FieldTreeNode) => node.field.term,
    isAdditionalFilterApplied: false,
    isMultiPick: true,
    isSearchable: true,
    isSelectable: false,
    linksPosition: 2,
    onExpansionChange: () => null,
    onSearchTermChange: () => {},
    onSelectionChange: () => {},
    renderNode: (node: FieldTreeNode) => <>{node.field.display}</>,
    searchBoxHelp: "Filter variables by name, description, or values. Use * as a wildcard for the start of words. For example, <i>typ</i> will match <i>type</i> and <i>typically</i>, while <i>*typ</i> will also match <i>atypical</i>",
    searchBoxPlaceholder: "Find a variable",
    searchPredicate: () => true,
    searchTerm: '',
    selectedList: [],
    showRoot: false,
    showSearchBox: true,
} as CheckboxTreeProps<unknown>;

export const AsMultiSelect = Template.bind({});
AsMultiSelect.args = {
    ...AsSingleSelectLinks.args,
    isSelectable: true,
} as CheckboxTreeProps<unknown>;