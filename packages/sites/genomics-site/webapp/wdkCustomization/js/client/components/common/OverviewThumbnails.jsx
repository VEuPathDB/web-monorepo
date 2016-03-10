import React from 'react';
import lodash from 'lodash';

import { getBestPosition, isNodeOverflowing } from '../../utils';


// TODO Smart position of popover
export class OverviewThumbnails extends React.Component {

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

        this.detectOverflow = lodash.throttle(() => {
            console.log('is overflowed', isNodeOverflowing(this.node));
        }, 250);

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

    componentDidMount() {
        window.addEventListener('resize', this.detectOverflow);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.detectOverflow);
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
            <div ref={this.setNode} className="eupathdb-Thumbnails">
                {this.props.thumbnails.map(thumbnail => (
                     <div className="eupathdb-ThumbnailWrapper" key={thumbnail.gbrowse_url}>
                         <div className="eupathdb-ThumbnailLabel">
                             <a href={'#' + thumbnail.anchor}>{thumbnail.displayName}</a>
                         </div>
                         <div className="eupathdb-Thumbnail"
                              onMouseEnter={this.handleThumbnailMouseEnter(thumbnail)}
                              onMouseLeave={this.handleThumbnailMouseLeave}>
                             <a href={'#' + thumbnail.anchor}>
                                 <img width="150" src={thumbnail.imgUrl}/>
                             </a>
                         </div>
                     </div>
                 ))}
                     {this.renderPopover()}
            </div>
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
                    <div>(Click on image to view section on page)</div>
                    <a href={'#' + this.state.activeThumbnail.anchor}
                       onClick={this.handlePopoverClick}>
                        <img src={this.state.activeThumbnail.imgUrl}/>
                    </a>
                </div>
            );
        }
    }

}
