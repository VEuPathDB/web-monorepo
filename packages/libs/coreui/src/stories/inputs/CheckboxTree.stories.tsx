import { Story, Meta } from '@storybook/react/types-6-0';

import CheckboxTree, { CheckboxTreeProps } from '../../components/inputs/SelectTree/CheckboxTree';
import { tree } from './mockTreeData';

export default {
    title: 'Inputs/CheckboxTree',
    component: CheckboxTree
} as Meta;

const Template: Story<CheckboxTreeProps<unknown>> = (args) => {
    // console.log({tree: args.tree});
    return (
        <CheckboxTree {...args} />
    )
}

export const Default = Template.bind({});
Default.args = {
    tree,
    expandedList: [],
    additionalFilters: [],
    autoFocusSearchBox: false,
    customCheckboxes: {},
    getNodeChildren: (node: any) => {
        const showMultiFilterDescendants = true;
        return 'type' in node.field && node.field.type === 'multiFilter' && !showMultiFilterDescendants
          ? []
          : node.children ?? [];
      },
    getNodeId: (node: any) => node.field.term,
    isAdditionalFilterApplied: false,
    isMultiPick: true,
    isSearchable: true,
    isSelectable: false,
    linksPosition: 2,
    onExpansionChange: () => null,
    onSearchTermChange: () => {},
    onSelectionChange: () => {},
    renderNode: (node: any) => <>{node.field.display}</>,
    searchBoxHelp: "Filter variables by name, description, or values. Use * as a wildcard for the start of words. For example, <i>typ</i> will match <i>type</i> and <i>typically</i>, while <i>*typ</i> will also match <i>atypical</i>",
    searchBoxPlaceholder: "Find a variable",
    searchPredicate: () => true,
    searchTerm: '',
    selectedList: [],
    showRoot: false,
    showSearchBox: true,
} as CheckboxTreeProps<unknown>;