import { Story, Meta } from '@storybook/react/types-6-0';
import { tree } from './mockTreeData';
import { 
    preorderSeq, 
    findAncestorFields, 
    Field, 
    FieldTreeNode, 
} from '../../components/inputs/SelectTree/Utils';
import { uniq } from 'lodash';

import SelectTree, { SelectTreeProps } from '../../components/inputs/SelectTree';

export default {
    title: 'Inputs/SelectTree',
    component: SelectTree
} as Meta;

const Template: Story<SelectTreeProps<unknown>> = (args) => {
    return (
        <SelectTree {...args} />
    )
}

export const Standard = Template.bind({});
Standard.args = {
    defaultButtonDisplayContent: 'Click me',
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
} as SelectTreeProps<unknown>;