import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { fullScreenAppPlugins } from '.';
import { AnalysisState } from '../../hooks/analysis';
import { useAnalysisClient } from '../../hooks/workspace';
import { isSavedAnalysis } from '../../utils/analysis';
import makeSnackbarProvider from '@veupathdb/coreui/dist/components/notifications/SnackbarProvider';
import { Close, FilledButton } from '@veupathdb/coreui';

const SnackbarProvider = makeSnackbarProvider();

interface Props {
  analysisState: AnalysisState;
  appName: string;
  onClose: () => void;
}
export default function FullScreenContainer(props: Props) {
  const plugin = fullScreenAppPlugins[props.appName];
  const [nodeRef, setNodeRef] = useState<HTMLDivElement>();
  useEffect(() => {
    if (plugin == null) return;
    const div = document.createElement('div');
    document.body.appendChild(div);
    const currentStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setNodeRef(div);
    return function cleanup() {
      document.body.removeChild(div);
      document.body.style.overflow = currentStyle;
    };
  }, [plugin]);
  const { loading, appState, updateAppState } = useAppState(
    isSavedAnalysis(props.analysisState.analysis)
      ? props.analysisState.analysis.analysisId
      : undefined,
    props.appName
  );
  const isSaved = isSavedAnalysis(props.analysisState.analysis);

  useEffect(() => {
    if (!isSaved) {
      props.analysisState.saveAnalysis();
    }
    // Use an empty array so that this only runs when the component
    // first mounts. This avoids multiple save requests, resulting
    // in the creation of multiple analyses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (plugin == null) return <div>Unknown plugin</div>;
  return nodeRef && isSaved
    ? createPortal(
        <SnackbarProvider domRoot={nodeRef} styleProps={{}}>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              background: 'white',
            }}
          >
            <div
              style={{
                position: 'absolute',
                zIndex: 2,
                right: 12,
                top: 8,
                transform: 'scale(1.5)',
              }}
            >
              <FilledButton
                onPress={props.onClose}
                text=""
                icon={Close}
                themeRole="secondary"
              />
            </div>
            <div
              style={{
                position: 'absolute',
                zIndex: 1,
                height: '100%',
                width: '100%',
              }}
            >
              {loading ? null : (
                <plugin.fullScreenComponent
                  appState={appState}
                  persistAppState={updateAppState}
                  analysisState={props.analysisState}
                />
              )}
            </div>
          </div>
        </SnackbarProvider>,
        nodeRef
      )
    : null;
}

function useAppState(analysisId: string | undefined, appName: string) {
  // This code is a little naive and lacks safeguards against
  // race conditions, throttling requests, etc.
  const analysisClient = useAnalysisClient();
  const [appState, setAppState] = useState<unknown>();
  const [loading, setLoading] = useState(false);
  const key = analysisId && `fullScreenApp/${analysisId}/${appName}`;

  useEffect(() => {
    if (key == null) return;
    setLoading(true);
    // We are returning the "cancel" function that is returned by
    // `Task.prototype.run`. The "cancel" function has the effect of
    // preventing the invocation of the callback passed to
    // `Task.prototype.run`, if the Promise returned by the callback passed to
    // `Task.fromPromise` has not yet been settled.
    return Task.fromPromise(() => analysisClient.getPreferences())
      .map((preferences) => preferences[key])
      .run((appState) => {
        setAppState(appState);
        setLoading(false);
      });
  }, [analysisClient, key]);

  const updateAppState = useCallback(
    (state: unknown) => {
      setAppState(state);
      if (key == null) return;
      analysisClient.setPreferences({
        [key]: state,
      });
    },
    [analysisClient, key]
  );

  return { loading, appState, updateAppState };
}
