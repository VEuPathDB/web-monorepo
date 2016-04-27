import {Component, PropTypes} from 'react';
import lodash from 'lodash';
import {getBestPosition} from '../../utils';
import VerticalScrollHelper from './VerticalScrollHelper';

let ThumbnailPropType = PropTypes.shape({
  anchor: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired
});

/**
 * Thumbnails for overview section of record page.
 */
export class OverviewThumbnails extends Component {

  constructor(...args) {
    super(...args);
    this.timeoutId = null;
    this.state = {
      showPopover: false
    };

    this.setNode = node => { this.node = node; };

    this.computePosition = popoverNode => {
      if (popoverNode == null) return;
      let { offsetLeft, offsetTop } = getBestPosition(
        popoverNode,
        this.state.activeThumbnailNode
      );
      popoverNode.style.left = offsetLeft + 'px';
      popoverNode.style.top = offsetTop + 'px';
    };

    this.handleThumbnailMouseEnter = thumbnail => event => {
      this.setShowPopover(true, 250);
      this.setActiveThumbnail(event, thumbnail);
    };

    this.handlePopoverMouseEnter = () => {
      this.setShowPopover(true, 250);
    };

    this.handleThumbnailMouseLeave = this.handlePopoverMouseLeave = () => {
      this.setShowPopover(false, 250);
    };

    this.handlePopoverClick = () => {
      this.setShowPopover(false, 0);
    };
  }

  setActiveThumbnail(event, thumbnail) {
    if (thumbnail === this.state.activeThumbnail) return;
    this.setState({
      activeThumbnail: thumbnail,
      activeThumbnailNode: event.target,
      showPopover: false
    });
  }

  setShowPopover(show, delay) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.setState({ showPopover: show });
    }, delay);
  }

  render() {
    return (
      <VerticalScrollHelper>
        <div ref={this.setNode} className="eupathdb-Thumbnails">
          {this.props.thumbnails.map(thumbnail => (
            <div className="eupathdb-ThumbnailWrapper" key={thumbnail.anchor}>
              <div className="eupathdb-ThumbnailLabel">
                <a href={'#' + thumbnail.anchor}>{thumbnail.displayName}</a>
              </div>
              <a className={'eupathdb-Thumbnail eupathdb-Thumbnail__' + thumbnail.anchor}
                {...getDataProps(thumbnail)}
                onMouseEnter={this.handleThumbnailMouseEnter(thumbnail) }
                onMouseLeave={this.handleThumbnailMouseLeave}
                href={'#' + thumbnail.anchor}>
                <img width="150" src={thumbnail.imgUrl}/>
              </a>
            </div>
          )) }
          {this.renderPopover() }
        </div>
      </VerticalScrollHelper>
    );
  }

  renderPopover() {
    if (this.state.showPopover) {
      return (
        <div className="eupathdb-ThumbnailPopover"
          ref={this.computePosition}
          onMouseEnter={this.handlePopoverMouseEnter}
          onMouseLeave={this.handlePopoverMouseLeave}>
          <h3>{this.state.activeThumbnail.displayName}</h3>
          <div>(Click on image to view section on page) </div>
          <a href={'#' + this.state.activeThumbnail.anchor}
            className={'eupathdb-Thumbnail eupathdb-Thumbnail__' + this.state.activeThumbnail.anchor}
            {...getDataProps(this.state.activeThumbnail)}
            onClick={this.handlePopoverClick}>
            <img src={this.state.activeThumbnail.imgUrl}/>
          </a>
        </div>
      );
    }
  }

}

OverviewThumbnails.propTypes = {
  thumbnails: PropTypes.arrayOf(ThumbnailPropType).isRequired
};

function getDataProps(thumbnail) {
  let { data = {} } = thumbnail;
  return lodash.mapKeys(data, function(value, key) {
    return 'data-' + key;
  });
}
