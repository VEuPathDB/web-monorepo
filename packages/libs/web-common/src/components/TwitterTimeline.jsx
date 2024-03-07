import React from 'react';

export default class TwitterTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.timelineRef = React.createRef();
    this.state = {
      isInitialized: false,
    };
  }

  componentDidMount() {
    this.loadTimeline();
  }

  componentDidUpdate() {
    this.loadTimeline();
  }

  loadTimeline() {
    // See https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites
    const t = (window.twttr = (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function (f) {
        t._e.push(f);
      };

      return t;
    })(document, 'script', 'twitter-wjs'));

    if (!this.state.isInitialized && 'init' in t) {
      this.setState({
        isInitialized: true,
      });
    }

    t.ready(() => t.widgets.load(this.timelineRef.current));
  }

  render() {
    const {
      profileId,
      height = null,
      width = '100%',
      theme = null,
      linkColor = null,
    } = this.props;
    return (
      <div
        className="TwitterTimelineContainer"
        style={{
          height,
          width,
        }}
      >
        <a
          ref={this.timelineRef}
          data-height={height}
          data-width={width}
          data-theme={theme}
          data-link-color={linkColor}
          className="twitter-timeline"
          href={`https://twitter.com/${profileId}`}
        >
          Tweets by {profileId}
        </a>
        {this.state.isInitialized && (
          <p>
            <em>
              <strong>Warning</strong>: You must be logged into Twitter/X to
              view our timeline.
            </em>
          </p>
        )}
      </div>
    );
  }
}
