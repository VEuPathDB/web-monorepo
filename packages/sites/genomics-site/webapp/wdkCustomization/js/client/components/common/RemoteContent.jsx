/**
 * Load remote content and embed within component node. Any javascript
 * included in the remote content will be executed. This is useful for
 * embedding HTML fragments.
 */
import $ from 'jquery';
import React from 'react';

export default class RemoteContent extends React.Component {

  componentDidMount() {
    this.loadContent(this.props.url);
  }

  componentWillReceiveProps(props) {
    this.loadContent(props.url);
  }

  loadContent(url) {
    // Fetch the html and append it.
    // Handling script tags in the received html is hard, so using jquery for the time being.
    $(this.node).load(url, () => this.props.onLoad(this.node));
  }

  render() {
    return (
      <div ref={node => this.node = node}/>
    );
  }
}

RemoteContent.defaultProps = {
  onLoad() {}
};
