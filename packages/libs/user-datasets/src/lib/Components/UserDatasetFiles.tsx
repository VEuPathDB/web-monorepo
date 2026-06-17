import React from 'react';
import { Mesa, MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';

import {
  isVdiCompatibleWdkService,
  DatasetZipType,
  DatasetFileDetails,
} from '../Service';
import { DatasetFileType } from '../Utils/types';

import './UserDatasetFiles.scss';

interface ZipFileRow {
  name: string;
  size?: number;
  download?: React.ReactNode;
}

export interface UserDatasetFilesProps {
  datasetId: string;
  showHeader?: boolean;
}

export function UserDatasetFiles(props: UserDatasetFilesProps) {
  const { datasetId, showHeader = true } = props;

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  // Fetch user dataset files
  const userDatasetFilesResult = useWdkService(
    async (wdkService) => {
      if (!isVdiCompatibleWdkService(wdkService)) {
        // Return null data when VDI is not configured - don't show error to user
        return { data: null, error: null };
      }

      try {
        const files = await wdkService.vdi.getDatasetFileList(datasetId);
        return { data: files, error: null };
      } catch (error) {
        console.error('Failed to fetch user dataset files:', error);
        return {
          data: null,
          error: 'Failed to load dataset files. Please try again later.',
        };
      }
    },
    [datasetId]
  );

  // Show loading state
  if (userDatasetFilesResult === undefined) {
    return (
      <div>
        {showHeader && (
          <h2 style={{ padding: 0, fontSize: '1.65em', color: 'black' }}>
            Dataset Files
          </h2>
        )}
        <Loading />
      </div>
    );
  }

  // Show error state
  if (userDatasetFilesResult?.error) {
    return (
      <div>
        {showHeader && (
          <h2 style={{ padding: 0, fontSize: '1.65em', color: 'black' }}>
            Dataset Files
          </h2>
        )}
        <div className="error-message">
          <p>{userDatasetFilesResult.error}</p>
        </div>
      </div>
    );
  }

  // If VDI is not configured, render nothing
  if (!userDatasetFilesResult?.data) {
    return null;
  }

  const files = userDatasetFilesResult.data;

  // No need for this section if there are no data files at all
  // (e.g. upload failure)
  const hasUpload = files.upload != null;
  if (!hasUpload) return null;

  const getFileTableColumns = (
    fileType: DatasetFileType
  ): MesaColumn<ZipFileRow>[] => {
    const isZipFile = fileType === 'upload' || fileType === 'install';
    const zipFileType = isZipFile ? (fileType as DatasetZipType) : null;

    const fileListElement = isZipFile &&
      zipFileType &&
      files[zipFileType]?.contents?.length && (
        <details style={{ margin: '1em 0 0 0.25em' }}>
          <summary>
            List of {fileType === 'upload' ? 'uploaded' : 'processed'} files:
          </summary>
          <ol
            style={{
              margin: '0.25em 0 0 0',
              lineHeight: '1.5em',
              padding: '0 0 0 2em',
            }}
          >
            {files[zipFileType]!.contents.map(
              (file: DatasetFileDetails, index: number) => (
                <li key={`${file.fileName}-${index}`}>
                  {file.fileName} <span>({bytesToHuman(file.fileSize)})</span>
                </li>
              )
            )}
          </ol>
        </details>
      );

    const columns: Array<MesaColumn<ZipFileRow> | null> = [
      {
        key: 'name',
        name: 'File Name',
        renderCell({ row }) {
          const { name } = row;
          return (
            <>
              <code>{name}</code>
              {fileListElement}
            </>
          );
        },
      },
      {
        key: 'size',
        name: 'File Size',
        renderCell({ row }) {
          const { size } = row;
          return size ? bytesToHuman(size) : '';
        },
      },
      {
        key: 'download',
        name: 'Download',
        width: '130px',
        headingStyle: { textAlign: 'center' },
        renderCell({ row }) {
          const isDocument = fileType === 'documents';
          const isPropertiesFile = fileType === 'datasetProperties';

          const downloadServiceAvailable =
            isVdiCompatibleWdkService(wdkService);

          const enableDownload = true;

          return (
            <button
              className="btn btn-info"
              disabled={!downloadServiceAvailable || !enableDownload}
              title={
                downloadServiceAvailable && enableDownload
                  ? 'Download this file'
                  : 'This download is unavailable. Please contact us if this problem persists.'
              }
              onClick={(e) => {
                e.preventDefault();
                if (isVdiCompatibleWdkService(wdkService)) {
                  if (isZipFile && zipFileType) {
                    wdkService.vdi.getDatasetRootFile(datasetId, zipFileType);
                  } else if (isDocument) {
                    wdkService.vdi.getDatasetDocumentFile(datasetId, row.name);
                  } else if (isPropertiesFile) {
                    wdkService.vdi.getDatasetVarPropsFile(datasetId, row.name);
                  }
                }
              }}
            >
              <Icon fa="save" className="left-side" /> Download
            </button>
          );
        },
      },
    ];

    return columns.filter(
      (column): column is MesaColumn<ZipFileRow> => !!column
    );
  };

  const uploadZipFileState: MesaStateProps<ZipFileRow> = MesaState.create({
    columns: getFileTableColumns('upload'),
    rows: [{ name: 'upload.zip', size: files?.upload?.zipSize }],
  });

  const processedZipFileState: MesaStateProps<ZipFileRow> = MesaState.create({
    columns: getFileTableColumns('install'),
    rows: [{ name: 'install.zip', size: files?.install?.zipSize }],
  });

  const hasInstall = files.install != null;

  const hasDocuments = files.documents && files.documents.length > 0;
  const documentsFileState = hasDocuments
    ? MesaState.create({
        columns: getFileTableColumns('documents'),
        rows: files.documents!.map((file: DatasetFileDetails) => ({
          name: file.fileName,
          size: file.fileSize,
        })),
      })
    : null;

  const hasDatasetProperties =
    files.datasetProperties && files.datasetProperties.length > 0;
  const datasetPropertiesFileState = hasDatasetProperties
    ? MesaState.create({
        columns: getFileTableColumns('datasetProperties'),
        rows: files.datasetProperties!.map((file: DatasetFileDetails) => ({
          name: file.fileName,
          size: file.fileSize,
        })),
      })
    : null;

  return (
    <section id="dataset-files">
      {showHeader && (
        <h2 style={{ padding: 0, fontSize: '1.65em', color: 'black' }}>
          Dataset Files
        </h2>
      )}
      <h3
        style={{
          padding: 0,
          fontSize: '1.3em',
          marginTop: '1.1em',
          marginBottom: '0.5em',
        }}
      >
        <Icon fa="files-o" style={{ color: '#0B5EA1', marginRight: '10px' }} />
        Uploaded data files
      </h3>
      <div className="UserDatasetFiles-MesaWrapper">
        <Mesa state={uploadZipFileState} />
      </div>
     {/* {hasInstall && (
        <>
          <h3
            style={{
              padding: 0,
              fontSize: '1.3em',
              marginTop: '1.1em',
              marginBottom: '0.5em',
            }}
          >
            <Icon
              fa="files-o"
              style={{ color: '#0B5EA1', marginRight: '10px' }}
            />
            Processed data files
          </h3>
          <div className="UserDatasetFiles-MesaWrapper">
            <Mesa state={processedZipFileState} />
          </div>
        </>
      )} */}
      {hasDocuments && (
        <>
          <h3
            style={{
              padding: 0,
              fontSize: '1.3em',
              marginTop: '1.1em',
              marginBottom: '0.5em',
            }}
          >
            <Icon
              fa="file-text-o"
              style={{ color: '#0B5EA1', marginRight: '10px' }}
            />
            Uploaded documentation files
          </h3>
          <div className="UserDatasetFiles-MesaWrapper">
            <Mesa state={documentsFileState} />
          </div>
        </>
      )}
      {hasDatasetProperties && (
        <>
          <h3
            style={{
              padding: 0,
              fontSize: '1.3em',
              marginTop: '1.1em',
              marginBottom: '0.5em',
            }}
          >
            <Icon
              fa="list-alt"
              style={{ color: '#0B5EA1', marginRight: '10px' }}
            />
            Uploaded annotation files
          </h3>
          <div className="UserDatasetFiles-MesaWrapper">
            <Mesa state={datasetPropertiesFileState} />
          </div>
        </>
      )}
    </section>
  );
}
