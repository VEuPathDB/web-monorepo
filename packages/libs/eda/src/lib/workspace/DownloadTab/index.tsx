import { useEffect, useMemo, useState } from 'react';
import { Column } from 'react-table';

import {
  H5,
  Paragraph,
  colors,
  DataGrid,
  Download,
} from '@veupathdb/core-components';

import { useUITheme } from '@veupathdb/core-components/dist/components/theming';
import {
  gray,
  mutedCyan,
} from '@veupathdb/core-components/dist/definitions/colors';
import {
  AnalysisState,
  useConfiguredDownloadClient,
  useStudyMetadata,
} from '../../core';
import { EntityCounts } from '../../core/hooks/entityCounts';
import { useStudyEntities } from '../../core/hooks/study';

import MySubset from './MySubset';

type DownloadsTabProps = {
  analysisState: AnalysisState;
  totalCounts: EntityCounts | undefined;
  filteredCounts: EntityCounts | undefined;
};

export default function DownloadTab({
  analysisState,
  totalCounts,
  filteredCounts,
}: DownloadsTabProps) {
  const theme = useUITheme();
  const [studyReleases, setStudyReleases] = useState<Array<string>>([]);

  const downloadClient = useConfiguredDownloadClient('/eda-user-service');

  const studyMetadata = useStudyMetadata();
  const entities = useStudyEntities(studyMetadata.rootEntity);

  // Consolidate entity data into a user-friendly structure.
  const consolidatedEntityData = useMemo(() => {
    const filteredCountsAsArray = Object.entries(filteredCounts ?? {});
    const totalCountsAsArray = Object.entries(totalCounts ?? {});

    if (!filteredCounts || !totalCounts) return [];

    return entities.map((entity) => ({
      ...entity,
      filteredCount: filteredCountsAsArray.find(
        ([entityID]) => entityID === entity.id
      )?.[1],
      totalCount: totalCountsAsArray.find(
        ([entityID]) => entityID === entity.id
      )?.[1],
    }));
  }, [entities, filteredCounts, totalCounts]);

  // Get a list of all available study releases.
  useEffect(() => {
    downloadClient
      .getStudyReleases(studyMetadata.id)
      .then((result) => setStudyReleases(result));
  }, [downloadClient, studyMetadata]);

  // useEffect(() => {
  //   studyReleases.length &&
  //     downloadClient
  //       .getStudyReleaseFiles(studyMetadata.id, studyReleases[0])
  //       .then((result) => console.log(result));
  // }, [studyReleases]);

  const exampleGridColumns: Array<Column> = [
    {
      Header: 'File Description',
      accessor: 'file_id',
      Cell: ({ value }) => (
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          role="button"
        >
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
        <MySubset entities={consolidatedEntityData} theme={theme} />
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
