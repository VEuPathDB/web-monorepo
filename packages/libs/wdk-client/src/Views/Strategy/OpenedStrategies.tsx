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

export default function OpenedStrategies({ openStrategies, isVisible, setVisibility }: Props) {
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
              viewId="inactiveStrategyPanel"
              strategyId={id}
              showCloseButton
            />
          ))}
      </div>
    </CollapsibleSection>
  )
}