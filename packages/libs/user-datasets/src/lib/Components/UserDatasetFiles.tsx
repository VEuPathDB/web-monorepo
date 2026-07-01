import React, { useEffect, useState } from 'react';
import { Mesa, MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

import {
  DatasetZipType,
  DatasetGetResponseBody,
  DatasetFileDetails,
  useVdiService,
} from '../Service';
import { DatasetFileType } from '../Utils/types';

import './UserDatasetFiles.scss';
import { formatFileSize } from '../Utils/formatting';
import { isEmpty } from 'lodash';

interface ZipFileRow extends DatasetFileDetails {
  download?: React.ReactNode;
}

export interface UserDatasetFilesProps {
  readonly datasetId: string;
  readonly showHeader?: boolean;

  readonly dataset?: DatasetGetResponseBody;
}

export function UserDatasetFiles(props: UserDatasetFilesProps) {
  const { datasetId, showHeader = true } = props;

  const [ datasetFiles, setDatasetFiles ] = useState(props.dataset?.files);
  const [ error, setError ] = useState<string>();

  const vdi = useVdiService();

  useEffect(() => {
    if (vdi != null && datasetFiles == null)
      vdi.getDatasetFileList(datasetId)
        .then(setDatasetFiles)
        .catch(_ => setError('Failed to load dataset files. Please try again later.'));
  }, [ datasetId, vdi, datasetFiles ]);

  // If VDI is not configured, render nothing
  if (!vdi) {
    return null;
  }

  if (!datasetFiles) {
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
  if (error) {
    return (
      <div>
        {showHeader && (
          <h2 style={{ padding: 0, fontSize: '1.65em', color: 'black' }}>
            Dataset Files
          </h2>
        )}
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // No need for this section if there are no data files at all
  // (e.g. upload failure)
  if (datasetFiles.upload == null) {
    return null;
  }

  const getFileTableColumns = (
    fileType: DatasetFileType
  ): MesaColumn<ZipFileRow>[] => {
    const isZipFile = fileType === 'upload' || fileType === 'install';
    const zipFileType = isZipFile ? (fileType as DatasetZipType) : null;

    const fileListElement = isZipFile &&
      zipFileType &&
      datasetFiles[zipFileType]?.contents?.length && (
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
            {datasetFiles[zipFileType]!.contents.map(
              (file: DatasetFileDetails, index: number) => (
                <li key={`${file.fileName}-${index}`}>
                  {file.fileName} <span>({formatFileSize(file.fileSize)})</span>
                </li>
              )
            )}
          </ol>
        </details>
      );

    const columns: Array<MesaColumn<ZipFileRow> | null> = [
      {
        key: 'fileName',
        name: 'File Name',
        renderCell({ row }) {
          return (
            <>
              <code>{row.fileName}</code>
              {fileListElement}
            </>
          );
        },
      },
      {
        key: 'fileSize',
        name: 'File Size',
        renderCell({ row }) {
          return formatFileSize(row.fileSize);
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

          const enableDownload = true;

          return (
            <button
              className="btn btn-info"
              disabled={!enableDownload}
              title={
                enableDownload
                  ? 'Download this file'
                  : 'This download is unavailable. Please contact us if this problem persists.'
              }
              onClick={(e) => {
                e.preventDefault();
                if (isZipFile && zipFileType) {
                  // noinspection JSIgnoredPromiseFromCall
                  vdi.getDatasetRootFile(datasetId, zipFileType);
                } else if (isDocument) {
                  // noinspection JSIgnoredPromiseFromCall
                  vdi.getDatasetDocumentFile(datasetId, row.fileName);
                } else if (isPropertiesFile) {
                  // noinspection JSIgnoredPromiseFromCall
                  vdi.getDatasetVarPropsFile(datasetId, row.fileName);
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
    rows: [{ fileName: 'upload.zip', fileSize: datasetFiles?.upload?.zipSize }],
  });

  const hasDocuments = !isEmpty(datasetFiles.documents);
  const documentsFileState = hasDocuments
    ? MesaState.create({
        columns: getFileTableColumns('documents'),
        rows: datasetFiles.documents!,
      })
    : null;

  const hasDatasetProperties = !isEmpty(datasetFiles.datasetProperties)
  const datasetPropertiesFileState = hasDatasetProperties
    ? MesaState.create({
        columns: getFileTableColumns('datasetProperties'),
        rows: datasetFiles.datasetProperties!,
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
