import React from 'react';

interface TwitterTimelineProps {
  profileId: string;
  height?: number | null;
  width?: string;
  theme?: string | null;
  linkColor?: string | null;
}

interface TwitterTimelineState {
  isInitialized: boolean;
}

interface TwitterWidget {
  widgets: {
    load: (element: HTMLElement | null) => void;
  };
  ready: (callback: () => void) => void;
  _e?: Array<() => void>;
  init?: boolean;
}

declare global {
  interface Window {
    twttr?: TwitterWidget;
  }
}

export default class TwitterTimeline extends React.Component<
  TwitterTimelineProps,
  TwitterTimelineState
> {
  timelineRef: React.RefObject<HTMLAnchorElement>;

  constructor(props: TwitterTimelineProps) {
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
        t = window.twttr || ({} as TwitterWidget);
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://platform.twitter.com/widgets.js';
      fjs.parentNode!.insertBefore(js, fjs);

      t._e = [];
      t.ready = function (f) {
        t._e!.push(f);
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
          height: height ?? undefined,
          width,
        }}
      >
        <div>
          {this.state.isInitialized && (
            <p>
              <em>
                <strong>Warning</strong>: If our Twitter/X timeline is not
                displaying, you may need to log into Twitter/X or alter your
                browser security settings.
              </em>
            </p>
          )}
        </div>
        <a
          ref={this.timelineRef}
          data-height={height ?? undefined}
          data-width={width}
          data-theme={theme ?? undefined}
          data-link-color={linkColor ?? undefined}
          className="twitter-timeline"
          href={`https://twitter.com/${profileId}`}
        >
          Tweets by {profileId}
        </a>
      </div>
    );
  }
}
