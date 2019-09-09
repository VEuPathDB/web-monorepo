import React from 'react';
import { CollapsibleSection } from 'wdk-client/Components';
import StrategyPanelController from 'wdk-client/Controllers/StrategyPanelController';

import "./OpenedStrategies.css";
import {StrategyDetails} from 'wdk-client/Utils/WdkUser';

interface Props {
  isVisible: boolean;
  setVisibility: (isVisible: boolean) => void;
  openStrategies: [number, { strategy?: StrategyDetails, isLoading: boolean }][];
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
          .map(([id, entry]) =>(
            <StrategyPanelController
              key={id}
              isActive={id === activeStrategyId}
              viewId={`inactiveStrategyPanel__${id}`}
              strategyId={id}
              showCloseButton
              {...entry}
            />
          ))}
      </div>
    </CollapsibleSection>
  )
}
