import {
  H5,
  Paragraph,
  colors,
  FloatingButton,
  TableDownload,
  DataGrid,
  Download,
} from '@veupathdb/core-components';
import { SwissArmyButtonVariantProps } from '@veupathdb/core-components/dist/components/buttons';
import { useUITheme } from '@veupathdb/core-components/dist/components/theming';
import {
  gray,
  mutedCyan,
} from '@veupathdb/core-components/dist/definitions/colors';
import { Column } from 'react-table';

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

  const exampleGridColumns: Array<Column> = [
    {
      Header: 'File Description',
      accessor: 'file_id',
      Cell: ({ value }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Download fill={mutedCyan[500]} fontSize={20} />
          <span
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              letterSpacing: 0.1,
              color: mutedCyan[500],
              marginLeft: 8,
              marginRight: 25,
            }}
          >
            {value}
          </span>
        </div>
      ),
    },
    {
      Header: 'Type',
      accessor: 'file_type',
    },
    {
      Header: 'Size',
      accessor: 'file_size',
    },
  ];

  const exampleGridRows = [
    {
      file_id: 'Merged Data (Inclusive)',
      file_type: '.txt.zip',
      file_size: '1.4 MB',
    },
    {
      file_id: '6,266 Communities',
      file_type: '.txt.zip',
      file_size: '0.4 MB',
    },
    {
      file_id: '6,459 Households',
      file_type: '.txt.zip',
      file_size: '0.4 MB',
    },
    {
      file_id: '21,736 Household Repeated Measures',
      file_type: '.txt.zip',
      file_size: '0.4 MB',
    },
    {
      file_id: '15,627 Participant Repeated Measures',
      file_type: '.txt.zip',
      file_size: '0.4 MB',
    },
  ];

  return (
    <div style={{ display: 'flex', paddingTop: 20 }}>
      <div key="Column One" style={{ marginRight: 75 }}>
        <div key="My Subset" style={{ marginBottom: 35 }}>
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
        <div key="Current Release Dataset">
          <div style={{ marginBottom: 15 }}>
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
          <DataGrid
            columns={exampleGridColumns}
            data={exampleGridRows}
            styleOverrides={{
              table: {
                borderColor: gray[200],
                borderStyle: 'solid',
                primaryRowColor: 'white',
                secondaryRowColor: 'white',
                borderWidth: 1,
              },
              headerCells: {
                color: gray[600],
                fontWeight: 700,
                borderColor: gray[200],
                borderWidth: 1,
                borderStyle: 'solid',
                fontSize: 12,
                fontFamily: 'Inter',
              },
              dataCells: {
                color: gray[600],
                fontWeight: 400,
                fontSize: 11,
                fontFamily: 'Inter',
                borderColor: gray[200],
                borderWidth: 1,
                borderStyle: 'solid',
                padding: 5,
                verticalAlign: 'center',
              },
            }}
          />
        </div>
      </div>
      <div key="Column Two">
        {/* In a future release, the items in Column One will be moved here
        and new items will be put into Column One. */}
      </div>
    </div>
  );
}
