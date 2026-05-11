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
import { ZipFileType } from '../Utils/types';

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
    fileType: ZipFileType
  ): MesaColumn<ZipFileRow>[] => {
    const fileListElement = files[fileType]?.contents?.length && (
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
          {files[fileType]!.contents.map((file, index) => (
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
        renderCell() {
          const downloadServiceAvailable = 'getUserDatasetFiles' in wdkService;
          const enableDownload =
            fileType === 'upload' ? true : installStatus === 'complete';

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
                if (isVdiCompatibleWdkService(wdkService))
                  wdkService.getUserDatasetFiles(datasetId, fileType);
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
      <style>{`
        .UserDatasetFiles-MesaWrapper .MesaComponent .DataTable table {
          width: auto !important;
        }
      `}</style>
    </section>
  );
}
