import { H6, Paragraph } from '@veupathdb/coreui';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';

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

const listItemStyles: React.CSSProperties = {
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  transition: 'background 0.1s ease',
  padding: '5px 10px',
};
const buttonStyles: React.CSSProperties = {
  background: 'none',
  width: '100%',
  border: 'none',
  padding: '5px 10px',
};

export function MarkerConfigurationSelector({
  markerConfigurations,
  selectedMarkerConfigurationName: selectedMarkerConfiguration,
  setSelectedMarkerConfigurationName: setSelectedMarkerConfiguration,
}: Props) {
  const theme = useUITheme();
  const activeMarkerConfigurationMenu = markerConfigurations.find(
    ({ name }) => name === selectedMarkerConfiguration
  )?.renderConfigurationMenu;

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <H6
          additionalStyles={{
            padding: '10px 25px 10px 25px',
            textAlign: 'center',
          }}
        >
          Choose marker type:
        </H6>
        <ul style={{ listStyle: 'none', margin: 0 }}>
          {markerConfigurations.map(({ name, icon }) => {
            const isActive = selectedMarkerConfiguration === name;

            return (
              <li
                style={{
                  ...listItemStyles,
                  background: isActive
                    ? theme?.palette.primary.hue[100]
                    : 'inherit',
                }}
                key={name}
              >
                <button
                  style={buttonStyles}
                  onClick={() => setSelectedMarkerConfiguration(name)}
                >
                  <span
                    style={{
                      fontFamily: theme?.typography?.paragraphs?.fontFamily,
                      fontSize: 16,
                      fontWeight: isActive ? 'bold' : 'normal',
                    }}
                  >
                    {name}
                  </span>
                  <span aria-hidden>{icon}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>{activeMarkerConfigurationMenu}</div>
    </div>
  );
}
