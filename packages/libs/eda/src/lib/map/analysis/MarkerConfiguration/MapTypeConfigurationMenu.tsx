import { useState } from 'react';
import { H6 } from '@veupathdb/coreui';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import { MarkerConfiguration } from '../appState';
import { TabbedDisplay } from '@veupathdb/coreui';

export interface MarkerConfigurationOption {
  displayName: string;
  icon?: JSX.Element;
  renderConfigurationMenu: JSX.Element;
  type: MarkerConfiguration['type'];
}

interface Props {
  activeMarkerConfigurationType: MarkerConfiguration['type'];
  markerConfigurations: MarkerConfigurationOption[];
  // setActiveMarkerConfigurationType: (type: MarkerConfiguration['type']) => void;
}

const listItemStyles: React.CSSProperties = {
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '5px 10px',
  transition: 'background 0.1s ease',
  width: '100%',
};
const buttonStyles: React.CSSProperties = {
  alignItems: 'center',
  background: 'none',
  border: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
};

export function MapTypeConfigurationMenu({
  activeMarkerConfigurationType,
  markerConfigurations,
}: // setActiveMarkerConfigurationType,
Props) {
  const theme = useUITheme();
  const activeMarkerConfiguration = markerConfigurations.find(
    ({ type }) => type === activeMarkerConfigurationType
  );
  const activeMarkerConfigurationMenu =
    activeMarkerConfiguration?.renderConfigurationMenu;
  const [activeTab, setActiveTab] = useState('markers');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <H6
        additionalStyles={{
          margin: '15px 12px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span>Configure {activeMarkerConfiguration?.displayName}</span>
        {activeMarkerConfiguration?.icon}
      </H6>
      <TabbedDisplay
        tabs={[
          {
            key: 'markers',
            displayName: 'Markers',
            content: activeMarkerConfigurationMenu,
          },
          {
            key: 'plots',
            displayName: 'Supporting Plots',
            content: <>Next up...</>,
          },
        ]}
        activeTab={activeTab}
        onTabSelected={setActiveTab}
      />
    </div>
  );
}
