import { useState } from 'react';
import { H5 } from '@veupathdb/coreui';
import { MarkerConfiguration } from '../appState';
import TabbedDisplay, {
  TabbedDisplayProps,
} from '@veupathdb/coreui/dist/components/grids/TabbedDisplay';

export interface MarkerConfigurationOption {
  displayName: string;
  icon?: JSX.Element;
  renderConfigurationMenu: JSX.Element;
  type: MarkerConfiguration['type'];
}

interface Props {
  activeMarkerConfigurationType: MarkerConfiguration['type'];
  markerConfigurations: MarkerConfigurationOption[];
  mapTypeConfigurationMenuTabs: TabbedDisplayProps<'markers' | 'plots'>['tabs'];
}

export function MapTypeConfigurationMenu({
  activeMarkerConfigurationType,
  markerConfigurations,
  mapTypeConfigurationMenuTabs,
}: Props) {
  const activeMarkerConfiguration = markerConfigurations.find(
    ({ type }) => type === activeMarkerConfigurationType
  );
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
        <span>Configure {activeMarkerConfiguration?.displayName}</span>
        {activeMarkerConfiguration?.icon}
      </H5>
      <TabbedDisplay
        tabs={mapTypeConfigurationMenuTabs}
        activeTab={activeTab}
        onTabSelected={setActiveTab}
      />
    </div>
  );
}
