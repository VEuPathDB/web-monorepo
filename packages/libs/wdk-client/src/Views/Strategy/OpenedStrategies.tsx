import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';
import { StrategyEntry } from 'wdk-client/StoreModules/StrategyStoreModule';
import { ResizableContainer, Link } from 'wdk-client/Components';
import { useSessionBackedState } from 'wdk-client/Hooks/SessionBackedState';

import "./OpenedStrategies.css";

interface Props {
  stepId?: number;
  strategyId?: number;
  openedStrategies?: [number, StrategyEntry][];
  strategyPanelViewId: (strategyId: number) => string;
}

export default function OpenedStrategies(props: Props) {
  const { stepId, strategyId, openedStrategies, strategyPanelViewId } = props;
  const stratPanelRef = useRef<HTMLDivElement>(null);
  const resizeContainerRef = useRef<HTMLDivElement>(null);
  // FIXME Figure out how to compute this...
  const singlePanelHeight = 172;
  // TODO Make this configurable
  const maxDefaultGrowFactor = 2.25;
  const defaultContainerHeight = Math.min(singlePanelHeight * maxDefaultGrowFactor, singlePanelHeight * (openedStrategies?.length || 1));
  const [ storedContainerHeight, setStoredContainerHeight ] = useSessionBackedState(
    0,
    'wdk/strategy-panel-container-height',
    num => String(num),
    str => Number(str) || 0
  );

  const containerHeight = storedContainerHeight || defaultContainerHeight;

  const activeStrategy = useMemo(() => {
    if (strategyId == null || openedStrategies == null) return;
    const activeEntry = openedStrategies.find(entry => entry[0] === strategyId);
    return activeEntry && activeEntry[1];
  }, [ strategyId, openedStrategies ]);

  const activeStrategyElement = useMemo(() => {
    if (stratPanelRef.current == null || openedStrategies == null || strategyId == null) return;
    const indexOfActiveStrategy = openedStrategies.findIndex(entry => entry[0] === strategyId);
    if (indexOfActiveStrategy === -1) return;
    const activeStratDiv = stratPanelRef.current.children[indexOfActiveStrategy];
    return activeStratDiv instanceof HTMLDivElement ? activeStratDiv : undefined;
  }, [ stratPanelRef.current, openedStrategies, strategyId ])

  const scrollToActiveStrategy = useCallback(() => {
    if (activeStrategyElement == null) return;
    activeStrategyElement.scrollIntoView({ block: 'end' });
  }, [ activeStrategyElement ]);

  // Update resize container height if containerHeight changes
  useEffect(() => {
    if (resizeContainerRef.current == null) return;
    resizeContainerRef.current.style.height = containerHeight + 'px';
  }, [ resizeContainerRef.current, containerHeight ]);

  // Make sure resize container height is tall enough for active strategy (any time it changes).
  // This will include expanding a nested strategy. This won't update the user's stored preference.
  useEffect(() => {
    if (resizeContainerRef.current == null || activeStrategyElement == null || activeStrategy == null) return;
    const height = activeStrategyElement.clientHeight;
    if (height > containerHeight) {
      resizeContainerRef.current.style.height = height + 'px';
    }
    scrollToActiveStrategy();
  }, [ activeStrategy ]);

  const stratPanel = (
    <div className="OpenedStrategiesPanel" ref={stratPanelRef}>
      {openedStrategies && openedStrategies.map(([id, entry]) => (
        <StrategyPanelController
          key={id}
          isActive={id === strategyId}
          showCloseButton
          viewId={strategyPanelViewId(id)}
          strategyId={id}
          stepId={id === strategyId ? stepId : undefined}
          {...entry}
        />
      ))}
    </div>
  );

  return (
    <>
      <ResizableContainer
        ref={resizeContainerRef}
        className="OpenedStrategiesPanel--ResizableContainer"
        handles="s"
        minHeight={singlePanelHeight}
        resize={(event, ui) => {
          scrollToActiveStrategy();
        }}
        stop={(event, ui) => {
          // FIXME Why is this breaking resize??
          setStoredContainerHeight(ui.size.height);
        }}
      >
        {stratPanel}
      </ResizableContainer>
      {strategyId == null &&
        <div style={{ fontSize: '1.2em' }}>
          <p>You have no open strategies. Please run a search to start a strategy.</p>
          <p>To open an existing strategy, visit the <Link to="/workspace/strategies/all">'All' page</Link>.</p>
        </div>
      }
      {strategyId != null && stepId == null &&
        <div>
          Select a search above to see the results.
        </div>
      }
    </>
  )
}

/*
function handlePanelScroll(el: HTMLDivElement | null, doResizable?: boolean) {
  if (el == null) return;
  if (el.scrollTop > 0) {
    el.classList.add('OpenedStrategiesPanel__topShadow');
  } else {
    el.classList.remove('OpenedStrategiesPanel__topShadow');
  }

  if ((el.scrollHeight - el.offsetHeight) - el.scrollTop > 0) {
    el.classList.add('OpenedStrategiesPanel__bottomShadow');
  } else {
    el.classList.remove('OpenedStrategiesPanel__bottomShadow');
  }

  if (doResizable) {
    $(el).resizable({
      minHeight: '13em' as any,
      minWidth: '100%' as any
    }).height('32em');
  }
}
 */
