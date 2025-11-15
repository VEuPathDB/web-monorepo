import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { includes, stubTrue } from 'lodash';
import React from 'react';
import CategoriesCheckboxTree from '../../../Components/CheckboxTree/CategoriesCheckboxTree';
import { CategoryTreeNode, getId } from '../../../Utils/CategoryUtils';
import {
  safeHtml,
  wrappable,
  ComponentWrapper,
} from '../../../Utils/ComponentUtils';
import RecordNavigationItem from '../../../Views/Records/RecordNavigation/RecordNavigationItem';

/** Navigation panel for record page */
interface RecordNavigationSectionProps {
  activeSection: string;
  categoryTree: CategoryTreeNode;
  collapsedSections: string[];
  heading?: React.ReactNode;
  navigationQuery: string;
  navigationCategoriesExpanded: string[];
  onNavigationCategoryExpansionChange: (ids: string[]) => void;
  onNavigationQueryChange: (term: string) => void;
  onSectionToggle?: (id: string, value?: boolean) => void;
  visibilityFilter?: (node: CategoryTreeNode) => boolean;
  visibilityToggle?: React.ReactNode;
}

interface RecordNavigationSectionState {
  activeCategory: null | string;
}

class RecordNavigationSection extends React.PureComponent<
  RecordNavigationSectionProps,
  RecordNavigationSectionState
> {
  static defaultProps: Partial<RecordNavigationSectionProps> = {
    onSectionToggle: () => {},
    heading: 'Contents',
  };

  constructor(props: RecordNavigationSectionProps) {
    super(props);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
    this.state = { activeCategory: null };
  }

  handleSearchTermChange(term: string): void {
    this.props.onNavigationQueryChange(term);
  }

  render(): React.ReactNode {
    let {
      activeSection,
      categoryTree,
      collapsedSections,
      heading,
      navigationQuery,
      navigationCategoriesExpanded,
      onNavigationCategoryExpansionChange,
      onSectionToggle,
      visibilityFilter = stubTrue,
      visibilityToggle,
    } = this.props;

    return (
      <div className="wdk-RecordNavigationSection">
        <div className="wdk-RecordNavigationSectionHeader">
          {safeHtml(heading as string, null, 'h1')}
          {visibilityToggle}
        </div>
        <CategoriesCheckboxTree
          {...({
            disableHelp: true,
            visibilityFilter,
            searchBoxPlaceholder: 'Search section names...',
            tree: categoryTree,
            leafType: 'section',
            isSelectable: false,
            expandedBranches: navigationCategoriesExpanded,
            onUiChange: onNavigationCategoryExpansionChange,
            searchTerm: navigationQuery,
            onSearchTermChange: this.handleSearchTermChange,
            renderNode: (node: any, path: any) => (
              <RecordNavigationItem
                node={node}
                path={path}
                activeSection={activeSection}
                onSectionToggle={onSectionToggle}
                checked={!includes(collapsedSections, getId(node))}
              />
            ),
            linksPosition: LinksPosition.Top,
            styleOverrides: {
              treeSection: {
                ul: {
                  padding: '0 0 0 1em',
                },
              },
              treeNode: {
                nodeWrapper: {
                  alignItems: 'center',
                },
              },
            },
          } as any)}
        />
      </div>
    );
  }
}

export default wrappable<RecordNavigationSectionProps>(
  RecordNavigationSection
) as unknown as ComponentWrapper<RecordNavigationSectionProps>;
