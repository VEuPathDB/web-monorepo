import React from 'react';
import { CollapsibleSection } from 'wdk-client/Components';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';

import "./OpenedStrategies.css";

interface Props {
  isVisible: boolean;
  setVisibility: (isVisible: boolean) => void;
  openStrategies: number[];
  activeStrategyId?: number;
}

export default function OpenedStrategies({ openStrategies, isVisible, setVisibility, activeStrategyId }: Props) {
  if (openStrategies.length < 2) return null;
  return (
    <CollapsibleSection
      className="OpenedStrategies"
      isCollapsed={!isVisible}
      headerContent={`${openStrategies.length} opened strategies`}
      onCollapsedChange={isCollapsed => setVisibility(!isCollapsed)}
    >
      <div>
        {openStrategies
          .map(id =>(
            <StrategyPanelController
              key={id}
              isActive={id === activeStrategyId}
              viewId={`inactiveStrategyPanel__${id}`}
              strategyId={id}
              showCloseButton
            />
          ))}
      </div>
    </CollapsibleSection>
  )
}
