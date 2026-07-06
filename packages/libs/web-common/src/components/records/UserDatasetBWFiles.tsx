import React from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { isVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service/utils/compatibility';

export interface UserDatasetBWFilesProps {
  record: RecordInstance;
  datasetId: string;
  showHeader?: boolean;
}

export function UserDatasetBWFiles(props: UserDatasetBWFilesProps) {
  const { record, datasetId, showHeader = true } = props;

  // Extract values from record attributes
  const genome = typeof record.attributes.ref_genome_filename === 'string'
    ? record.attributes.ref_genome_filename
    : record.attributes.ref_genome_filename?.displayText || '';

  const datasetName = record.displayName || '';

  // Obtain sequenceId by running search: LongestSeqForAnOrganism
  const sequenceIdResult = useWdkService(
    async (wdkService) => {
      if (!genome) return null;

      try {
        const res = await wdkService.getAnswerJson(
          {
            searchName: 'LongestSeqForAnOrganism',
            searchConfig: {
              parameters: {
                organismNameForFiles: genome,
              },
            },
          },
          {}
        );
        return res.records && res.records.length > 0 ? res.records[0].displayName : null;
      } catch (error) {
          console.error('Failed to fetch sequence ID:', error);
        return null;
      }
    },
    [genome]
  );

  // With User Dataset Id datasetId, obtain its .bw file names
  const filesResult = useWdkService(
    async (wdkService) => {
      if (!isVdiCompatibleWdkService(wdkService)) {
        return null;
      }
      try {
        const files = await wdkService.vdi.getDatasetFileList(datasetId);
        // Filter for .bw files
        const bwFiles = files?.install?.contents?.filter(
          (file: any) => file.fileName.endsWith('.bw')
        ) || [];
        return bwFiles;
      } catch (error) {
        console.error('Failed to fetch user dataset files:', error);
        return null;
      }
    },
    [datasetId]
  );

  const sequenceId = sequenceIdResult;
  const bwFiles = filesResult;

  // Don't render if no files or required data missing
  if (!bwFiles || bwFiles.length === 0 || !sequenceId || !genome) {
    return null;
  }

  // Generate JBrowse URL for a given .bw filename
  const getJBrowseUrl = (bwFilename: string) => {
    return `/a/jbrowse/index.html?data=/a/service/jbrowse/tracks/${genome}&tracks=gene,${encodeURIComponent(datasetName)} ${encodeURIComponent(bwFilename)}&highlight=&loc=${sequenceId}`;
  };

  return (
    <div>
      {showHeader && (
        <h3>
          <Icon fa="bar-chart" />
          Genome Browser Tracks
        </h3>
      )}
      <ul>
        {bwFiles.map((file: any) => (
          <li key={file.fileName}>
            <code>{file.fileName}</code> -{' '}
            <a href={getJBrowseUrl(file.fileName)} target="_blank" rel="noreferrer">
              View in Genome Browser <Icon fa="external-link" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

