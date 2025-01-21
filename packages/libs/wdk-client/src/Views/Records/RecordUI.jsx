import classnames from 'classnames';
import { debounce, get, isEqual, memoize } from 'lodash';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { getId } from '../../Utils/CategoryUtils';
import { wrappable } from '../../Utils/ComponentUtils';
import { findAncestorNode } from '../../Utils/DomUtils';
import { postorderSeq, preorderSeq } from '../../Utils/TreeUtils';
import RecordHeading from '../../Views/Records/RecordHeading';
import RecordMainSection from '../../Views/Records/RecordMain/RecordMainSection';
import RecordNavigationSection from '../../Views/Records/RecordNavigation/RecordNavigationSection';

import '../../Views/Records/Record.css';

/**
 * Renders the main UI for the WDK Record page.
 */
class RecordUI extends Component {
  constructor(props) {
    super(props);

    this._updateActiveSection = this._updateActiveSection.bind(this);

    this._updateUrl = debounce(this._updateUrl.bind(this), 100);

    // We are assuming this value will not change
    this.getHeaderOffset = memoize(this.getHeaderOffset);

    this.recordMainSectionNode = null;
    this.activeSectionTop = null;

    this.state = {
      activeSectionId: null,
    };
  }

  componentDidMount() {
    this._scrollToActiveSection(true);
    this.monitorActiveSection();
  }

  componentDidUpdate(prevProps) {
    let recordChanged = prevProps.record !== this.props.record;
    if (recordChanged) {
      this._scrollToActiveSection(
        !isEqual(this.props.record.id, prevProps.record.id)
      );
    }
  }

  componentWillUnmount() {
    this.unmonitorActiveSection();
  }

  monitorActiveSection() {
    window.addEventListener('scroll', this._updateActiveSection, {
      passive: true,
    });
  }

  unmonitorActiveSection() {
    window.removeEventListener('scroll', this._updateActiveSection, {
      passive: true,
    });
  }

  getHeaderOffset() {
    const headerOffsetString = getComputedStyle(document.body).getPropertyValue(
      '--page-offset-top'
    );
    return parseInt(headerOffsetString) || 0;
  }

  _updateActiveSection() {
    let headerOffsetPx = this.getHeaderOffset();
    let activeElement = preorderSeq(this.props.categoryTree)
      .map((node) => document.getElementById(getId(node)))
      .filter((el) => el != null)
      .findLast((el) => {
        let rect = el.getBoundingClientRect();
        return Math.floor(rect.top) <= headerOffsetPx;
      });
    let activeSectionId = get(activeElement, 'id');

    // keep track of the activeElement's top value. This helps to determine if
    // the page's scroll position needs to be updated, when the record data is
    // updated.
    this.activeSectionTop = activeElement?.getBoundingClientRect().top;

    if (activeSectionId !== this.state.activeSectionId) {
      this.setState({ activeSectionId }, () => {
        this._updateUrl(this.state.activeSectionId);
      });
    }
  }

  _updateUrl(activeSection) {
    let hash = activeSection ? `#${activeSection}` : '';
    let newUrl = new URL(hash, location);
    try {
      history.replaceState(null, null, newUrl);
    } catch (error) {
      console.error('Could not replace history state', newUrl);
      console.error(error);
    }
  }

  _scrollToActiveSection(isFirstLoadForRecordId) {
    const targetId = location.hash.slice(1);
    const targetNode = document.getElementById(targetId);

    // Find the "closest" section containing the targetNode
    const categoryIdSeq = postorderSeq(this.props.categoryTree).map(getId);
    const categoryIdSet = new Set(categoryIdSeq);
    const sectionNode = findAncestorNode(
      targetNode,
      (node) => node instanceof HTMLElement && categoryIdSet.has(node.id)
    );

    if (targetNode != null && sectionNode != null) {
      if (isFirstLoadForRecordId) {
        // open the target section
        this.props.updateSectionVisibility(sectionNode.id, true);
      }

      const rect = targetNode.getBoundingClientRect();

      if (isFirstLoadForRecordId) {
        // always scroll the target into view on the first page load
        targetNode.scrollIntoView(true);
      } else if (
        this.activeSectionTop != null &&
        rect.top !== this.activeSectionTop
      ) {
        // retain the top position of the active section, to prevent page jumps
        window.scrollBy(0, rect.top - this.activeSectionTop);
      }
    }
  }

  render() {
    let classNames = classnames(
      'wdk-RecordContainer',
      'wdk-RecordContainer__' + this.props.recordClass.fullName,
      {
        'wdk-RecordContainer__withSidebar': this.props.navigationVisible,
        'wdk-Compressed': this.props.ownProps.compressedUI,
      }
    );

    let sidebarIconClass = classnames({
      'fa fa-lg': true,
      'fa-angle-double-down': !this.props.navigationVisible,
      'fa-angle-double-up': this.props.navigationVisible,
    });

    let visibilityToggle = (
      <button
        type="button"
        className="wdk-RecordSidebarToggle"
        onClick={() => {
          this.props.updateNavigationVisibility(!this.props.navigationVisible);
        }}
      >
        {this.props.navigationVisible ? '' : 'Show Contents '}
        <i
          className={sidebarIconClass}
          title={
            this.props.navigationVisible ? 'Close sidebar' : 'Open sidebar'
          }
        />
      </button>
    );

    return (
      <div className={classNames}>
        <RecordHeading
          record={this.props.record}
          recordClass={this.props.recordClass}
          headerActions={this.props.headerActions}
        />
        <div className="wdk-RecordSidebarContainer">
          <div className="wdk-RecordSidebar">
            {this.props.navigationVisible ? (
              <RecordNavigationSection
                visibilityToggle={visibilityToggle}
                heading={this.props.record.displayName}
                record={this.props.record}
                recordClass={this.props.recordClass}
                categoryTree={this.props.categoryTree}
                collapsedSections={this.props.collapsedSections}
                activeSection={this.state.activeSectionId}
                navigationQuery={this.props.navigationQuery}
                navigationExpanded={this.props.navigationExpanded}
                navigationCategoriesExpanded={
                  this.props.navigationCategoriesExpanded
                }
                onSectionToggle={this.props.updateSectionVisibility}
                onNavigationVisibilityChange={
                  this.props.updateNavigationVisibility
                }
                onNavigationCategoryExpansionChange={
                  this.props.updateNavigationCategoryExpansion
                }
                onNavigationQueryChange={this.props.updateNavigationQuery}
                requestPartialRecord={this.props.requestPartialRecord}
              />
            ) : (
              visibilityToggle
            )}
          </div>
          <div className="wdk-RecordMain">
            <RecordMainSection
              ref={(c) => (this.recordMainSectionNode = findDOMNode(c))}
              record={this.props.record}
              recordClass={this.props.recordClass}
              categories={this.props.categoryTree.children}
              collapsedSections={this.props.collapsedSections}
              onSectionToggle={this.props.updateSectionVisibility}
              requestPartialRecord={this.props.requestPartialRecord}
              tableStates={this.props.tableStates}
              updateTableState={this.props.updateTableState}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default wrappable(RecordUI);
