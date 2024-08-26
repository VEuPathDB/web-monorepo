import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { TabbableContainer } from '@veupathdb/wdk-client/lib/Components';

const LEFT_ARROW_CODE = 37;
const RIGHT_ARROW_CODE = 39;
const ESC_CODE = 27;
const MOTION_CODES = new Set([33, 34, 37, 38, 39, 40]); // Page{Up,Down} and Arrow{Left,Up,Right,Down}

let ThumbnailPropType = PropTypes.shape({
  // id attribute of the HTMLElement the thumbnail should link to
  anchor: PropTypes.string.isRequired,
  // display string to show above thumbnail
  displayName: PropTypes.string.isRequired,
  // React element to display in the layover when the thumbnail is zoomed
  element: PropTypes.element.isRequired,
  // additional properties to pass as data-* props to the Thumbnail HTMLElement
  data: PropTypes.object,
});

/**
 * Thumbnails for overview section of record page.
 */
export class OverviewThumbnails extends Component {
  constructor(...args) {
    super(...args);
    this.thumbnailNodes = new Map();
    this.state = {
      activeThumbnail: null,
    };

    this.setNode = (node) => {
      this.node = node;
    };

    this.handlePopoverClick = () => {
      this.props.onThumbnailClick(this.state.activeThumbnail);
      this.setActiveThumbnail(null);
    };

    this.handleKeyPress = (event) => {
      if (this.state.activeThumbnail) {
        let { which } = event;
        let index = this.props.thumbnails.indexOf(this.state.activeThumbnail);
        let prev = this.props.thumbnails[index - 1];
        let next = this.props.thumbnails[index + 1];
        if (which === RIGHT_ARROW_CODE) {
          if (next) this.setActiveThumbnail(next);
        } else if (which === LEFT_ARROW_CODE) {
          if (prev) this.setActiveThumbnail(prev);
        } else if (which === ESC_CODE) {
          this.setActiveThumbnail(null);
        }
        if (MOTION_CODES.has(which)) event.preventDefault();
      }
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
    this.popoverNode = document.createElement('div');
    document.body.appendChild(this.popoverNode);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  setActiveThumbnail(thumbnail) {
    if (thumbnail === this.state.activeThumbnail) return;

    // stop scroll events if thumbnail is active
    document.body.style.overflow = thumbnail == null ? '' : 'hidden';

    this.setState({
      activeThumbnail: thumbnail,
      activeThumbnailNode: this.thumbnailNodes.get(thumbnail),
    });
  }

  render() {
    return (
      <div ref={this.setNode} className="eupathdb-Thumbnails">
        {this.props.thumbnails.map((thumbnail) => (
          <div
            className="eupathdb-ThumbnailWrapper"
            key={thumbnail.anchor}
            ref={(node) => this.thumbnailNodes.set(thumbnail, node)}
          >
            <div className="eupathdb-ThumbnailLabel">
              <a
                href={'#' + thumbnail.anchor}
                onClick={() => this.props.onThumbnailClick(thumbnail)}
              >
                {thumbnail.displayName}
              </a>
            </div>
            <a
              {...getDataProps(thumbnail)}
              className={
                'eupathdb-Thumbnail eupathdb-Thumbnail__' + thumbnail.anchor
              }
              href={'#' + thumbnail.anchor}
              onClick={() => this.props.onThumbnailClick(thumbnail)}
            >
              <img
                alt={thumbnail.displayName}
                src={
                  '/a/wdkCustomization/images/gene_record_thumbnails/' +
                  thumbnail.anchor +
                  '.png'
                }
              />
            </a>
            {/* <button className="eupathdb-ThumbnailZoomButton" type="button" title="View larger image" onClick={() => this.setActiveThumbnail(thumbnail)}><i className="fa fa-search-plus"/></button> */}
          </div>
        ))}
        {this.renderPopover()}
      </div>
    );
  }

  renderPopover() {
    if (this.state.activeThumbnail) {
      let index = this.props.thumbnails.indexOf(this.state.activeThumbnail);
      let prev = this.props.thumbnails[index - 1];
      let next = this.props.thumbnails[index + 1];
      return ReactDOM.createPortal(
        <TabbableContainer>
          <div
            className="eupathdb-ThumbnailPopover"
            onMouseEnter={this.handlePopoverMouseEnter}
            onMouseLeave={this.handlePopoverMouseLeave}
          >
            <button
              autoFocus
              style={{
                position: 'fixed',
                right: '10px',
                top: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '5em',
                color: 'white',
              }}
              title="Close graphics viewer"
              type="button"
              onClick={() => this.setActiveThumbnail(null)}
            >
              &times;
            </button>
            <button
              style={{
                position: 'fixed',
                left: '10px',
                top: '50vh',
                background: 'transparent',
                border: 'none',
                fontSize: '5em',
                color: prev == null ? '' : 'white',
              }}
              title={
                prev == null
                  ? "You're at the first graphic"
                  : 'Go to the previous graphic'
              }
              type="button"
              disabled={prev == null}
              onClick={() => this.setActiveThumbnail(prev)}
            >
              <i className="fa fa-angle-left" />
            </button>
            <button
              style={{
                position: 'fixed',
                right: '10px',
                top: '50vh',
                background: 'transparent',
                border: 'none',
                fontSize: '5em',
                color: next == null ? '' : 'white',
              }}
              title={
                next == null
                  ? "You're at the last graphic"
                  : 'Go to the previous graphic'
              }
              type="button"
              disabled={next == null}
              onClick={() => this.setActiveThumbnail(next)}
            >
              <i className="fa fa-angle-right" />
            </button>
            <div>
              <h1 className="eupathdb-ThumbnailPopoverText">
                {this.state.activeThumbnail.displayName}
              </h1>
            </div>
            <div
              className={
                'eupathdb-Thumbnail eupathdb-Thumbnail__' +
                this.state.activeThumbnail.anchor
              }
              {...getDataProps(this.state.activeThumbnail)}
            >
              {this.state.activeThumbnail.element}
            </div>
            <div style={{ margin: '1em' }}>
              <a
                style={{ color: 'white' }}
                href={'#' + this.state.activeThumbnail.anchor}
                onClick={this.handlePopoverClick}
              >
                Go to section on page
              </a>
            </div>
          </div>
        </TabbableContainer>,
        this.popoverNode
      );
    } else {
      return null;
    }
  }
}

OverviewThumbnails.propTypes = {
  thumbnails: PropTypes.arrayOf(ThumbnailPropType).isRequired,
  onThumbnailClick: PropTypes.func,
};

OverviewThumbnails.defaultProps = {
  onThumbnailClick() {},
};

/**
 * Map keys of `thumbnail.data` object to 'data-{key}'.
 */
function getDataProps(thumbnail) {
  let { data = {} } = thumbnail;
  return lodash.mapKeys(data, function (value, key) {
    return 'data-' + key;
  });
}
