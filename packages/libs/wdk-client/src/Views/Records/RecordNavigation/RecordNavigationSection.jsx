import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { includes, stubTrue } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import CategoriesCheckboxTree from '../../../Components/CheckboxTree/CategoriesCheckboxTree';
import { getId } from '../../../Utils/CategoryUtils';
import { safeHtml, wrappable } from '../../../Utils/ComponentUtils';
import RecordNavigationItem from '../../../Views/Records/RecordNavigation/RecordNavigationItem';

/** Navigation panel for record page */
class RecordNavigationSection extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
    this.state = { activeCategory: null };
  }

  handleSearchTermChange(term) {
    this.props.onNavigationQueryChange(term);
  }

  render() {
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
          {safeHtml(heading, null, 'h1')}
          {visibilityToggle}
        </div>
        <CategoriesCheckboxTree
          disableHelp
          visibilityFilter={visibilityFilter}
          searchBoxPlaceholder="Search section names..."
          tree={categoryTree}
          leafType="section"
          isSelectable={false}
          expandedBranches={navigationCategoriesExpanded}
          onUiChange={onNavigationCategoryExpansionChange}
          searchTerm={navigationQuery}
          onSearchTermChange={this.handleSearchTermChange}
          renderNode={(node, path) => (
            <RecordNavigationItem
              node={node}
              path={path}
              activeSection={activeSection}
              onSectionToggle={onSectionToggle}
              checked={!includes(collapsedSections, getId(node))}
            />
          )}
          linksPosition={LinksPosition.Top}
          styleOverrides={{
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
          }}
        />
      </div>
    );
  }
}

RecordNavigationSection.propTypes = {
  collapsedSections: PropTypes.array,
  onSectionToggle: PropTypes.func,
  heading: PropTypes.node,
};

RecordNavigationSection.defaultProps = {
  onSectionToggle: function noop() {},
  heading: 'Contents',
};

export default wrappable(RecordNavigationSection);
