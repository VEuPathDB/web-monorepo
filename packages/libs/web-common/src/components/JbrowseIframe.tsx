import React, { SyntheticEvent, useCallback, useState } from 'react';

interface Props {
  jbrowseUrl: string;
  height: string;
}

declare global {
  interface Window {
    JBrowse: {
      afterMilestone: (
        milestoneName: string,
        callback: (data: unknown) => void
      ) => void;
      subscribe: (
        subscribeEvent: string,
        callback: LocationCallback | HighlightCallback | TracksCallback
      ) => void;
      makeCurrentViewURL: () => string;
      config: {
        queryParams: {
          loc: string;
          highlight: string;
          tracks: string;
        };
      };
    };
  }
}

interface JBrowseLocation {
  ref: string;
  start: number;
  end: number;
}

type JBrowseHightlightSection = JBrowseLocation[];

type LocationCallback = (data: JBrowseLocation) => void;
type HighlightCallback = (data: JBrowseHightlightSection) => void;
type TracksCallback = (data: string[][] | undefined) => void;

export function JbrowseIframe(props: Props) {
  const { jbrowseUrl, height } = props;
  const [isResetButtonDisabled, setIsResetButtonDisabled] =
    useState<boolean>(true);

  // counter is used in the key-hack logic that forces a re-render of the JBrowse iframe
  const [counter, setCounter] = useState<number>(0);

  const handleButtonState = useCallback((hasJBrowseViewChanged: boolean) => {
    if (!hasJBrowseViewChanged) return;
    setIsResetButtonDisabled(false);
  }, []);

  function onLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    const JBrowse = event.currentTarget.contentWindow?.JBrowse;
    if (JBrowse == null)
      throw new Error('Could not load embedded JBrowse instance.');
    JBrowse.afterMilestone('completely initialized', function () {
      const { highlight: initialHighlight, tracks: initialTracks } =
        JBrowse.config.queryParams;

      /**
       * When JBrowse loads, the 'start' and 'end' properties in queryParams.location will differ slightly from what the JBrowse 'navigate' subscriber reports.
       * Parsing out the query params from JBrowse.config.makeFullViewURL() or the jbrowseUrl prop (which is what populates queryParams.location) results in a
       * similar discrepancy. To further complicate matters, the 'end' location is even more volatile: after JBrowse loads, one can simply click on the iframe
       * and the 'end' location will differ from the initial load. Thus, I decided to use only the 'start' property to listen to iframe navigation changes by:
       *  1. closing over a boolean that determines when the initial location has loaded and using it to set an 'initialStart' value
       *  2. having the subscriber's callback disable the reset button if the 'start' data changes
       */
      let isInitialLocationLoaded = false;
      let initialStart: number | null = null;
      JBrowse.subscribe('/jbrowse/v1/n/navigate', function (data) {
        if (!isInitialLocationLoaded) {
          isInitialLocationLoaded = true;
          initialStart = data.start;
        }
        if (initialStart == null) return;
        if (initialStart !== data.start) {
          handleButtonState(true);
        }
      } as LocationCallback);

      /**
       * When loading for the first time, this subscriber callback will run as each initial track is loaded, then (for reasons unknown to me) one more time with
       * 'undefined' data. Therefore, I've closed over another boolean to determine when the initial tracks have loaded such that we can then listen to changes
       * to the tracks.
       */
      let areInitialTracksLoaded = false;
      JBrowse.subscribe('/jbrowse/v1/n/tracks/visibleChanged', function (data) {
        if (!data) return;
        if (
          !areInitialTracksLoaded &&
          data[0].length !== initialTracks.split(',').length
        ) {
          return;
        }
        if (
          !areInitialTracksLoaded &&
          data[0].length === initialTracks.split(',').length
        ) {
          areInitialTracksLoaded = true;
          return;
        }
        if (areInitialTracksLoaded && data[0].toString() !== initialTracks) {
          handleButtonState(true);
        }
      } as TracksCallback);

      JBrowse.subscribe('/jbrowse/v1/n/globalHighlightChanged', function (
        data
      ) {
        const newHighlightSection = `${data[0].ref}:${data[0].start}..${data[0].end}`;
        if (initialHighlight !== newHighlightSection) {
          handleButtonState(true);
        }
      } as HighlightCallback);
    });
  }

  function onClick() {
    setCounter((prev) => prev + 1);
    setIsResetButtonDisabled(true);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '0.5em',
        }}
      >
        <button onClick={onClick} disabled={isResetButtonDisabled}>
          Reset view
        </button>
      </div>
      <iframe
        key={'jbrowse-iframe-' + counter}
        onLoad={onLoad}
        src={jbrowseUrl + '&tracklist=0&nav=1&overview=0&fullviewlink=0&menu=0'}
        width="100%"
        height={height}
        scrolling="no"
        allowFullScreen={false}
      />
    </div>
  );
}
