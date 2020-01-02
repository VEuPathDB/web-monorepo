import classnames from 'classnames';
import { debounce, get } from 'lodash';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Sticky from 'wdk-client/Components/Display/Sticky';
import { getId } from 'wdk-client/Utils/CategoryUtils';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { addScrollAnchor } from 'wdk-client/Utils/DomUtils';
import { postorderSeq } from 'wdk-client/Utils/TreeUtils';
import 'wdk-client/Views/Records/Record.css';
import RecordHeading from 'wdk-client/Views/Records/RecordHeading';
import RecordMainSection from 'wdk-client/Views/Records/RecordMain/RecordMainSection';
import RecordNavigationSection from 'wdk-client/Views/Records/RecordNavigation/RecordNavigationSection';

/**
 * Renders the main UI for the WDK Record page.
 */
class RecordUI extends Component {

  constructor(props) {
    super(props);
    // bind event handlers
    this._updateActiveSection = debounce(this._updateActiveSection.bind(this), 100);
    this.monitorActiveSection = debounce(this.monitorActiveSection.bind(this), 100);

    this.recordMainSectionNode = null;
  }

  componentDidMount() {
    this._scrollToActiveSection();
    this.removeScrollAnchor = addScrollAnchor(
      this.recordMainSectionNode,
      document.getElementById(location.hash.slice(1))
    );
  }

  componentDidUpdate(prevProps) {
    let recordChanged = prevProps.record !== this.props.record;
    if (recordChanged) {
      this._scrollToActiveSection();
    }
  }

  componentWillUnmount() {
    this.unmonitorActiveSection();
    this.removeScrollAnchor();
    this._updateActiveSection.cancel();
    this.monitorActiveSection.cancel();
  }

  monitorActiveSection() {
    window.addEventListener('scroll', this._updateActiveSection, { passive: true });
  }

  unmonitorActiveSection() {
    window.removeEventListener('scroll', this._updateActiveSection, { passive: true });
  }

  _updateActiveSection() {
    let activeElement = postorderSeq(this.props.categoryTree)
    .map(node => document.getElementById(getId(node)))
    .filter(el => el != null)
    .find(el => {
      let rect = el.getBoundingClientRect();
      return rect.top <= 50 && rect.bottom > 50;
    });
    let activeSection = get(activeElement, 'id');
    console.debug(Date.now(), 'updated activeSection', activeSection);
    let newUrl = location.pathname + location.search + (activeSection ? '#' + activeSection : '');
    history.replaceState(null, null, newUrl);
  }

  _scrollToActiveSection() {
    this.unmonitorActiveSection();
    let domNode = document.getElementById(location.hash.slice(1));
    if (domNode != null) {
      domNode.scrollIntoView(true);
      console.debug(Date.now(), 'scrolled to active section', domNode, domNode.getBoundingClientRect().top);
    }
    this.monitorActiveSection();
  }

  render() {
    let classNames = classnames(
      'wdk-RecordContainer',
      'wdk-RecordContainer__' + this.props.recordClass.fullName,
      {
        'wdk-RecordContainer__withSidebar': this.props.navigationVisible
      }
    );

    let sidebarIconClass = classnames({
      'fa fa-lg': true,
      'fa-angle-double-down': !this.props.navigationVisible,
      'fa-angle-double-up': this.props.navigationVisible
    });

    return (
      <div className={classNames}>
        <RecordHeading
          record={this.props.record}
          recordClass={this.props.recordClass}
          headerActions={this.props.headerActions}
        />
        <Sticky>
          {({isFixed}) => (
            <div className={'wdk-RecordSidebar' + (
              isFixed ? ' wdk-RecordSidebar__fixed' : '')}>
              <button type="button" className="wdk-RecordSidebarToggle"
                onClick={() => {
                  if (!this.props.navigationVisible) window.scrollTo(0, window.scrollY);
                  this.props.updateNavigationVisibility(!this.props.navigationVisible);
                }}
              >
                {this.props.navigationVisible ? '' : 'Show Contents '}
                <i className={sidebarIconClass}
                  title={this.props.navigationVisible ? 'Close sidebar' : 'Open sidebar'}/>
              </button>
              <RecordNavigationSection
                heading={this.props.record.displayName}
                record={this.props.record}
                recordClass={this.props.recordClass}
                categoryTree={this.props.categoryTree}
                collapsedSections={this.props.collapsedSections}
                activeSection={this.props.activeSection}
                navigationQuery={this.props.navigationQuery}
                navigationExpanded={this.props.navigationExpanded}
                navigationCategoriesExpanded={this.props.navigationCategoriesExpanded}
                onSectionToggle={this.props.updateSectionVisibility}
                onNavigationVisibilityChange={this.props.updateNavigationVisibility}
                onNavigationCategoryExpansionChange={this.props.updateNavigationCategoryExpansion}
                onNavigationQueryChange={this.props.updateNavigationQuery}
                requestPartialRecord={this.props.requestPartialRecord}
              />
            </div>
          )}
        </Sticky>
        <div className="wdk-RecordMain">
          {/* <div className="wdk-RecordMainSectionFieldToggles">
            <button type="button" title="Expand all content" className="wdk-Link"
              onClick={this.props.updateAllFieldVisibility.bind(null, true)}>Expand All</button>
            {' | '}
            <button type="button" title="Collapse all content" className="wdk-Link"
              onClick={this.props.updateAllFieldVisibility.bind(null, false)}>Collapse All</button>
          </div> */}
          <RecordMainSection
            ref={c => this.recordMainSectionNode = findDOMNode(c)}
            record={this.props.record}
            recordClass={this.props.recordClass}
            categories={this.props.categoryTree.children}
            collapsedSections={this.props.collapsedSections}
            onSectionToggle={this.props.updateSectionVisibility}
            requestPartialRecord={this.props.requestPartialRecord}
          />
        </div>
      </div>
    )
  }
}

export default wrappable(RecordUI);
