import { startCase } from 'lodash';

// Components
import {
  FloatingButton,
  H5,
  Paragraph,
  TableDownload,
  colors,
} from '@veupathdb/core-components';

// Hooks
import { useUITheme } from '@veupathdb/core-components/dist/components/theming';

// Definitions
import { EnhancedEntityData } from './hooks/useEnhancedEntityData';

type MySubsetProps = {
  entities: EnhancedEntityData;
};

export default function MySubset({ entities }: MySubsetProps) {
  const theme = useUITheme();

  return (
    <div key="My Subset" style={{ marginBottom: 35 }}>
      <H5 text="My Subset" additionalStyles={{ margin: 0 }} />
      <Paragraph
        color={colors.gray[600]}
        styleOverrides={{ margin: '0px 0px 10px 0px' }}
        textSize="small"
      >
        Configure and download one or more tabular views
      </Paragraph>
      {Object.entries(entities).map(([entityID, data], index) => (
        <FloatingButton
          key={index}
          text={`${data.filteredCount?.toLocaleString()} of ${data.totalCount?.toLocaleString()} ${startCase(
            data.displayNamePlural
          )}`}
          onPress={() => console.log('Open Modal')}
          icon={TableDownload}
          textTransform="none"
          themeRole="primary"
          styleOverrides={{
            container: { marginBottom: 10 },
            default: {
              color: theme?.palette.primary.hue[100],
              textColor: theme?.palette.primary.hue[500],
            },
            hover: { color: theme?.palette.primary.hue[200] },
          }}
        />
      ))}
    </div>
  );
}
