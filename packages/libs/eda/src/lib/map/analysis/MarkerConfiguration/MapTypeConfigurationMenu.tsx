import { useState } from 'react';
import { H5 } from '@veupathdb/coreui';
import { MarkerConfiguration } from '../appState';
import TabbedDisplay, {
  TabbedDisplayProps,
} from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';

export interface MarkerConfigurationOption {
  displayName: string;
  icon?: JSX.Element;
  configurationMenu: JSX.Element;
  type: MarkerConfiguration['type'];
}

interface Props {
  markerConfiguration: MarkerConfigurationOption;
  mapTypeConfigurationMenuTabs: TabbedDisplayProps<'markers' | 'plots'>['tabs'];
}

export function MapTypeConfigurationMenu({
  markerConfiguration,
  mapTypeConfigurationMenuTabs,
}: Props) {
  const [activeTab, setActiveTab] = useState('markers');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <H5
        additionalStyles={{
          margin: '15px 12px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span>Configure {markerConfiguration.displayName}</span>
        {markerConfiguration.icon}
      </H5>
      <TabbedDisplay
        tabs={mapTypeConfigurationMenuTabs}
        activeTab={activeTab}
        onTabSelected={setActiveTab}
      />
    </div>
  );
}
