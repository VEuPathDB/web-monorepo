/**
 * Simple collapsible section that renders a header and content, along with an
 * icon indicating collapsed status.
 *
 * This is a fully controlled widget.
 */

import { zipWith } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import './CollapsibleSection.css';


let defaultClassName = 'wdk-CollapsibleSection';

class CollapsibleSection extends React.PureComponent {
  constructor(...args) {
    super(...args);
    // don't render initially if collpased
    this._renderChildren = !this.props.isCollapsed;

    this.handleCollapsedChange = () => {
      this.props.onCollapsedChange(!this.props.isCollapsed);
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this._renderChildren) {
      this._renderChildren = !nextProps.isCollapsed;      
    }
  }

  render() {
    let { className, id, isCollapsed, headerContent, children } = this.props;
    let [ containerClassName, headerClassName, contentClassName ] =
      makeClassNames(isCollapsed, defaultClassName, className);
    let Header = this.props.headerComponent;
    return(
      <div id={id} className={containerClassName}>
        <Header className={headerClassName} onClick={this.handleCollapsedChange}>
          {headerContent}
        </Header>
        <div className={contentClassName}>
          {this._renderChildren ? children : null}
        </div>
      </div>
    );
  }

}

CollapsibleSection.propTypes = {

  /** Used for the header content **/
  headerContent: PropTypes.node.isRequired,

  // FIXME What is the correct proptype for this?
  /** React Component type or string **/
  headerComponent: PropTypes.any,

  /**
   * Called with either `true` or `false` to indicate if the section is being
   * collapsed.
   */
  onCollapsedChange: PropTypes.func.isRequired,

  /** Whether the content should be collapsed **/
  isCollapsed: PropTypes.bool,

  /**
   * Root class name used.
   * If collapsed, this and {className}__collapsed will be used for container.
   * {className}Header will be used for header container.
   */
  className: PropTypes.string
};

CollapsibleSection.defaultProps = {
  isCollapsed: true,
  headerComponent: 'div'
};


// Helper to generate class names based on an array of baseNames,
// and then to zip them into a space-separated array of class names.
//
// This will add suffixes to baseNames for the header and content container
// elements.
function makeClassNames(isCollapsed, ...baseNames) {
  let classNames = baseNames
  .filter(baseName => baseName != null)
  .map(function(baseName) {
    return ['', 'Header', 'Content']
    .map(function(suffix) {
      return baseName + suffix;
    })
    .map(function(className) {
      return className + (isCollapsed ? ' ' + className + '__collapsed' : '');
    });
  });
  return zipWith(...classNames, function(...args) {
    return args.slice(0, classNames.length).join(' ');
  });
}

export default wrappable(CollapsibleSection);
