import React from 'react';
import { Mesa, MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';

import { isVdiCompatibleWdkService } from '../Service';
import { DatasetFileType, ZipFileType } from '../Utils/types';

interface ZipFileRow {
  name: string;
  size?: number;
  download?: React.ReactNode;
}

export interface UserDatasetFilesProps {
  datasetId: string;
  files: {
    upload?: {
      zipSize: number;
      contents: Array<{ fileName: string; fileSize: number }>;
    };
    install?: {
      zipSize: number;
      contents: Array<{ fileName: string; fileSize: number }>;
    };
    documents?: Array<{ fileName: string; fileSize: number }>;
    datasetProperties?: Array<{ fileName: string; fileSize: number }>;
  };
  projectId?: string;
  installStatus?: string;
  dataNoun?: { singular: string; plural: string };
}

export function UserDatasetFiles(props: UserDatasetFilesProps) {
  const {
    datasetId,
    files,
    projectId,
    installStatus = 'complete',
    dataNoun = { singular: 'dataset', plural: 'datasets' },
  } = props;

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const getFileTableColumns = (
    fileType: DatasetFileType
  ): MesaColumn<ZipFileRow>[] => {
    const isZipFile = fileType === 'upload' || fileType === 'install';
    const zipFileType = isZipFile ? (fileType as ZipFileType) : null;

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
            {files[zipFileType]!.contents.map((file, index) => (
              <li key={`${file.fileName}-${index}`}>
                {file.fileName} <span>({bytesToHuman(file.fileSize)})</span>
              </li>
            ))}
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

          const downloadServiceAvailable = isZipFile
            ? 'getUserDatasetFiles' in wdkService
            : isDocument
            ? 'getUserDatasetDocument' in wdkService
            : isPropertiesFile
            ? 'getUserDatasetPropertiesFile' in wdkService
            : false;

          const enableDownload = isZipFile
            ? fileType === 'upload'
              ? true
              : installStatus === 'complete'
            : true; // Individual files can always be downloaded if service is available

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
                    wdkService.getUserDatasetFiles(datasetId, zipFileType);
                  } else if (isDocument) {
                    wdkService.getUserDatasetDocument(datasetId, row.name);
                  } else if (isPropertiesFile) {
                    wdkService.getUserDatasetPropertiesFile(
                      datasetId,
                      row.name
                    );
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

  const hasDocuments = files.documents && files.documents.length > 0;
  const documentsFileState = hasDocuments
    ? MesaState.create({
        columns: getFileTableColumns('documents'),
        rows: files.documents!.map((file) => ({
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
        rows: files.datasetProperties!.map((file) => ({
          name: file.fileName,
          size: file.fileSize,
        })),
      })
    : null;

  return (
    <section id="dataset-files">
      <h2 style={{ padding: 0, fontSize: '1.65em', color: 'black' }}>
        Data Files
      </h2>
      <h3
        style={{
          padding: 0,
          fontSize: '1.3em',
          marginTop: '1.1em',
          marginBottom: '0.5em',
        }}
      >
        <Icon fa="files-o" style={{ color: '#0B5EA1', marginRight: '10px' }} />
        Uploaded Files in {dataNoun.singular}
      </h3>
      <div className="UserDatasetFiles-MesaWrapper">
        <Mesa state={uploadZipFileState} />
      </div>
      <h3
        style={{
          padding: 0,
          fontSize: '1.3em',
          marginTop: '1.1em',
          marginBottom: '0.5em',
        }}
      >
        <Icon fa="files-o" style={{ color: '#0B5EA1', marginRight: '10px' }} />
        Processed Files in {dataNoun.singular}
      </h3>
      <div className="UserDatasetFiles-MesaWrapper">
        <Mesa state={processedZipFileState} />
      </div>
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
            Documents
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
            Dataset Properties
          </h3>
          <div className="UserDatasetFiles-MesaWrapper">
            <Mesa state={datasetPropertiesFileState} />
          </div>
        </>
      )}
      <style>{`
        .UserDatasetFiles-MesaWrapper .MesaComponent .DataTable table {
          width: auto !important;
        }
      `}</style>
    </section>
  );
}
