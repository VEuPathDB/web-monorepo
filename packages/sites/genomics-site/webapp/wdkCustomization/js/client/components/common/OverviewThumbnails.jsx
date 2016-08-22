import {Component, PropTypes} from 'react';
import lodash from 'lodash';
import {getBestPosition} from '../../util/domUtils';

let ThumbnailPropType = PropTypes.shape({
  anchor: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  element: PropTypes.element.isRequired
});

/**
 * Thumbnails for overview section of record page.
 */
export class OverviewThumbnails extends Component {

  constructor(...args) {
    super(...args);
    this.thumbnailNodes = new Map();
    this.state = {
      activeThumbnail: null
    };

    this.setNode = node => { this.node = node; };

    this.computePosition = popoverNode => {
      if (popoverNode == null) return;
      // popoverNode.style.left = (window.innerWidth - popoverNode.clientWidth) / 2 + 'px';
      // popoverNode.style.top = (window.innerHeight - popoverNode.clientHeight) / 2 + 'px';
      // let { offsetLeft, offsetTop } = getBestPosition(
      //   popoverNode,
      //   this.state.activeThumbnailNode
      // );
      // popoverNode.style.left = offsetLeft + 'px';
      // popoverNode.style.top = offsetTop + 'px';
    };

    this.handlePopoverClick = () => {
      this.props.onThumbnailClick(this.state.activeThumbnail);
      this.setState({ activeThumbnail: null });
    };

    this.handleKeyPress = event => {
      if (this.state.activeThumbnail) {
        let index = this.props.thumbnails.indexOf(this.state.activeThumbnail);
        let prev = this.props.thumbnails[index - 1];
        let next = this.props.thumbnails[index + 1];
        if (event.key === "ArrowRight") {
          if (next) this.setActiveThumbnail(next);
        }
        else if (event.key === "ArrowLeft") {
          if (prev) this.setActiveThumbnail(prev);
        }
        else if (event.key === "Escape") {
          this.setActiveThumbnail(null);
        }
      }
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  setActiveThumbnail(thumbnail) {
    if (thumbnail === this.state.activeThumbnail) return;
    this.setState({
      activeThumbnail: thumbnail,
      activeThumbnailNode: this.thumbnailNodes.get(thumbnail)
    });
  }

  render() {
    return (
      <div ref={this.setNode} className="eupathdb-Thumbnails">
        {this.props.thumbnails.map(thumbnail => (
          <div className="eupathdb-ThumbnailWrapper" key={thumbnail.anchor}
            ref={node => this.thumbnailNodes.set(thumbnail, node)}>
            <div className="eupathdb-ThumbnailLabel">
              <a href={'#' + thumbnail.anchor}
                onClick={() => this.props.onThumbnailClick(thumbnail)}>
                {thumbnail.displayName}
              </a>
            </div>
            <a {...getDataProps(thumbnail)}
              className={'eupathdb-Thumbnail eupathdb-Thumbnail__' + thumbnail.anchor}
              href={'#' + thumbnail.anchor}
              onClick={() => this.props.onThumbnailClick(thumbnail)}
            >
              {thumbnail.element}
            </a>
            <button className="eupathdb-ThumbnailZoomButton" type="button" title="View larger image" onClick={() => this.setActiveThumbnail(thumbnail)}><i className="fa fa-search-plus"/></button>
          </div>
          )) }
          {this.renderPopover() }
        </div>
    );
  }

  renderPopover() {
    if (this.state.activeThumbnail) {
      let index = this.props.thumbnails.indexOf(this.state.activeThumbnail);
      let prev = this.props.thumbnails[index - 1];
      let next = this.props.thumbnails[index + 1];
      return (
        <div className="eupathdb-ThumbnailPopover"
          ref={(node) => this.computePosition(node)}
          onMouseEnter={this.handlePopoverMouseEnter}
          onMouseLeave={this.handlePopoverMouseLeave}>
          <h3 className="eupathdb-ThumbnailPopoverText">{this.state.activeThumbnail.displayName}</h3>
          <div className="eupathdb-ThumbnailPopoverText">(Click on image to view section on page) </div>
          <div>
            <button type="button" disabled={prev == null} onClick={() => this.setActiveThumbnail(prev)}>Prev</button>
            <button type="button" disabled={next == null} onClick={() => this.setActiveThumbnail(next)}>Next</button>
            <button type="button" onClick={() => this.setState({ activeThumbnail: null })}>Close</button>
          </div>
          <a href={'#' + this.state.activeThumbnail.anchor}
            className={'eupathdb-Thumbnail eupathdb-Thumbnail__' + this.state.activeThumbnail.anchor}
            {...getDataProps(this.state.activeThumbnail)}
            onClick={this.handlePopoverClick}>
            {this.state.activeThumbnail.element}
          </a>
        </div>
      );
    }
  }

}

OverviewThumbnails.propTypes = {
  thumbnails: PropTypes.arrayOf(ThumbnailPropType).isRequired,
  onThumbnailClick: PropTypes.func
};

OverviewThumbnails.defaultProps = {
  onThumbnailClick(){}
};

function getDataProps(thumbnail) {
  let { data = {} } = thumbnail;
  return lodash.mapKeys(data, function(value, key) {
    return 'data-' + key;
  });
}
