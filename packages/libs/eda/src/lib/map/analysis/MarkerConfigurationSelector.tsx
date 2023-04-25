import { H6 } from '@veupathdb/coreui';

export interface MarkerConfiguration {
  name: string;
  icon?: JSX.Element;
  renderConfigurationMenu: JSX.Element;
}

interface Props {
  markerConfigurations: MarkerConfiguration[];
  selectedMarkerConfigurationName: string;
  setSelectedMarkerConfigurationName: (name: string) => void;
}

export function MarkerConfigurationSelector({
  markerConfigurations,
  selectedMarkerConfigurationName: selectedMarkerConfiguration,
  setSelectedMarkerConfigurationName: setSelectedMarkerConfiguration,
}: Props) {
  const activeMarkerConfigurationMenu = markerConfigurations.find(
    ({ name }) => name === selectedMarkerConfiguration
  )?.renderConfigurationMenu;

  return (
    <div style={{ display: 'flex' }}>
      <H6>Choose marker type:</H6>
      <ul>
        {markerConfigurations.map(({ name, icon }) => {
          return (
            <li
              style={{
                background:
                  selectedMarkerConfiguration === name ? 'blue' : 'inherit',
              }}
              key={name}
            >
              <button onClick={() => setSelectedMarkerConfiguration(name)}>
                {name} <span aria-hidden>{icon}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div>{activeMarkerConfigurationMenu}</div>
    </div>
  );
}
