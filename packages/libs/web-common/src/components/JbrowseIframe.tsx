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
        callback: ((data: unknown) => void)
      ) => void;
      subscribe: (
        subscribeEvent: string,
        callback: LocationCallback | HighlightCallback | TracksCallback
      ) => void;
      makeCurrentViewURL: () => string;
      config: {
        queryParams: {
          loc: string,
          highlight: string,
          tracks: string,
        };
      }
    }
  }
}

interface JBrowseLocation {
  ref: string,
  start: number,
  end: number,
}

type JBrowseHightlightSection = JBrowseLocation[];

type LocationCallback = (data: JBrowseLocation) => void;
type HighlightCallback = (data: JBrowseHightlightSection) => void;
type TracksCallback = (data: string[][] | undefined) => void;

export function JbrowseIframe(props: Props) {
  const { jbrowseUrl, height } = props;
  const [ key, setKey ] = useState<string>('jbrowse-iframe-' + Math.floor(Math.random()*1000000));
  const [ isResetButtonDisabled, setIsResetButtonDisabled ] = useState<boolean>(true);

  const handleButtonState = useCallback(
    (hasJBrowseViewChanged: boolean) => {
      if (!hasJBrowseViewChanged) return;
      setIsResetButtonDisabled(false);
    }, []);

  function onLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    const JBrowse = event.currentTarget.contentWindow?.JBrowse;
    if (JBrowse == null) throw new Error("Could not load embedded JBrowse instance.");
    JBrowse.afterMilestone('completely initialized', function() {
      let areInitialTracksLoaded = false;
      let isInitialLocationLoaded = false;
      let initialStart: number | null = null;
      const { highlight: initialHighlight, tracks: initialTracks } = JBrowse.config.queryParams;
      JBrowse.subscribe(
        '/jbrowse/v1/n/navigate',
        function(data) {
          if (!isInitialLocationLoaded) {
            isInitialLocationLoaded = true;
            initialStart = data.start;
          }
          if (initialStart == null) return
          handleButtonState(initialStart !== data.start)
        } as LocationCallback
      );
      JBrowse.subscribe(
        '/jbrowse/v1/n/tracks/visibleChanged',
        function(data) {
          if (!data) return;
          if (!areInitialTracksLoaded && data && data[0].length !== initialTracks.split(',').length) {
            return;
          }
          if (!areInitialTracksLoaded && data && data[0].length === initialTracks.split(',').length) {
            areInitialTracksLoaded = true;
            return;
          }
          if (areInitialTracksLoaded) {
            handleButtonState(data[0].toString() !== initialTracks);
          }
        } as TracksCallback
      );
      JBrowse.subscribe(
        '/jbrowse/v1/n/globalHighlightChanged',
        function(data) {
          const newHighlightSection = `${data[0].ref}:${data[0].start}..${data[0].end}`;
          handleButtonState(initialHighlight !== newHighlightSection);
        } as HighlightCallback
      );
    });
  }
  
  function onClick() {
    setKey('jbrowse-iframe-' + Math.floor(Math.random()*1000000));
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
        <button
          onClick={onClick}
          disabled={isResetButtonDisabled}
        >
          Reset view
        </button>
      </div>
      <iframe
        key={key}
        onLoad={onLoad}
        src={jbrowseUrl + "&tracklist=0&nav=1&overview=0&fullviewlink=0&menu=0"}
        width="100%"
        height={height}
        scrolling="no"
        allowFullScreen={false}
      />
    </div>
  );
}