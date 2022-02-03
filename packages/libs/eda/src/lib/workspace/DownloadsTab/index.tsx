import {
  H5,
  Paragraph,
  colors,
  FloatingButton,
  TableDownload,
} from '@veupathdb/core-components';
import { SwissArmyButtonVariantProps } from '@veupathdb/core-components/dist/components/buttons';
import { useUITheme } from '@veupathdb/core-components/dist/components/theming';

export default function DownloadsTab() {
  const theme = useUITheme();

  const floatingButtonProps: Pick<
    SwissArmyButtonVariantProps,
    'icon' | 'textTransform' | 'themeRole' | 'styleOverrides'
  > = {
    icon: TableDownload,
    textTransform: 'none',
    themeRole: 'primary',
    styleOverrides: {
      container: { marginBottom: 10 },
      default: {
        color: theme?.palette.primary.hue[100],
        textColor: theme?.palette.primary.hue[500],
      },
      hover: { color: theme?.palette.primary.hue[200] },
    },
  };

  return (
    <div style={{ display: 'flex', paddingTop: 20 }}>
      <div key="Column One" style={{ marginRight: 75 }}>
        <div key="My Subset" style={{ marginBottom: 30 }}>
          <H5 text="My Subset" additionalStyles={{ margin: 0 }} />
          <Paragraph
            color={colors.gray[600]}
            styleOverrides={{ margin: '0px 0px 10px 0px' }}
            textSize="small"
          >
            Configure and download one or more tabular views
          </Paragraph>
          <FloatingButton
            text={'6,266 of 12,547 Communities'}
            onPress={() => console.log('Open Modal')}
            {...floatingButtonProps}
          />
          <FloatingButton
            text={'6,266 of 12,547 Communities'}
            onPress={() => console.log('Open Modal')}
            {...floatingButtonProps}
          />
          <FloatingButton
            text={'6,266 of 12,547 Communities'}
            onPress={() => console.log('Open Modal')}
            {...floatingButtonProps}
          />
          <FloatingButton
            text={'6,266 of 12,547 Communities'}
            onPress={() => console.log('Open Modal')}
            {...floatingButtonProps}
          />
          <FloatingButton
            text={'6,266 of 12,547 Communities'}
            onPress={() => console.log('Open Modal')}
            {...floatingButtonProps}
          />
        </div>
      </div>
      <div key="Column Two">
        <div key="Current Release Dataset">
          <H5
            text="Full Dataset (Release ??)"
            additionalStyles={{ margin: 0 }}
          />
          <Paragraph
            color={colors.gray[600]}
            styleOverrides={{ margin: 0 }}
            textSize="small"
          >
            <span style={{ fontWeight: 500 }}>Change Log: </span> Information
            controlled by presenters prop had a bug.
          </Paragraph>

          <Paragraph
            color={colors.gray[600]}
            styleOverrides={{ margin: 0 }}
            textSize="small"
          >
            <span style={{ fontWeight: 500 }}>Date: </span>2022-02-15
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
