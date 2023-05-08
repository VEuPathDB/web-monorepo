import { H6 } from '@veupathdb/coreui';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import { MarkerConfiguration } from '.';

export interface MarkerConfigurationOption {
  displayName: string;
  icon?: JSX.Element;
  renderConfigurationMenu: JSX.Element;
  type: MarkerConfiguration['type'];
}

interface Props {
  activeMarkerConfigurationType: MarkerConfiguration['type'];
  markerConfigurations: MarkerConfigurationOption[];
  setActiveMarkerConfigurationType: (type: MarkerConfiguration['type']) => void;
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

export function MarkerConfigurationSelector({
  activeMarkerConfigurationType,
  markerConfigurations,
  setActiveMarkerConfigurationType,
}: Props) {
  const theme = useUITheme();
  const activeMarkerConfigurationMenu = markerConfigurations.find(
    ({ type }) => type === activeMarkerConfigurationType
  )?.renderConfigurationMenu;

  return (
    <div style={{ display: 'flex', paddingRight: '10px' }}>
      <div>
        <H6
          additionalStyles={{
            margin: '1em 0.75em',
          }}
        >
          Choose marker type:
        </H6>
        <ul style={{ listStyle: 'none', margin: 0 }}>
          {markerConfigurations.map(({ displayName: name, icon, type }) => {
            const isActive = activeMarkerConfigurationType === type;

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
                  onClick={() => setActiveMarkerConfigurationType(type)}
                >
                  <span
                    style={{
                      fontFamily: theme?.typography?.paragraphs?.fontFamily,
                      fontSize: 16,
                      fontWeight: isActive ? 'bold' : 'normal',
                      marginRight: 5,
                    }}
                  >
                    {name}
                  </span>
                  {icon}
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
