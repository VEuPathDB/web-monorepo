import React, { ReactElement, useState } from 'react';
import { DatasetGetResponseBody } from '../../../../Service/Model';
import { MesaColumn, MesaStateProps } from '@veupathdb/coreui/lib/components/Mesa/types';
import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import BigwigGBrowseUploader from '../../../../Components/Management/BigwigGBrowseUploader';
import { projectId } from '../../../../config';
import { isNonEmptyString, Nullable } from '../../../../Utils';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { makeClassifier } from '../../../../Components/UserDatasetUtils';

export type TracksProps = {
  readonly dataset: DatasetGetResponseBody;
  readonly isInstalled: boolean;
};

const classify = makeClassifier('DatasetManagement', 'BigwigDatasetDetail');

export const Tracks = ({
  dataset,
  isInstalled,
}: TracksProps): Nullable<ReactElement> => {
  const [sequenceId, setSequenceId] = useState<string>();

  const genome = dataset.dependencies
    .map(it => it.resourceIdentifier.match(new RegExp('-' + it.resourceVersion + '_(.*)_Genome'))?.[1])
    .find(it => it != null)

  const installFiles = dataset.files.install?.contents
    ?.filter((file) => file.fileName.endsWith('.bw'))
    ?? [];

  useWdkService(
    (wdk) =>
      isInstalled && installFiles.length > 0 && isNonEmptyString(genome)
        ? wdk.getAnswerJson(
          {
            searchName: 'LongestSeqForAnOrganism',
            searchConfig: {
              parameters: {
                organismNameForFiles: genome
              }
            }
          },
          {}
        ).then(it => setSequenceId(it.records[0].displayName))
        : Promise.resolve(),
    [installFiles, genome, setSequenceId]
  );

  if (!sequenceId || !genome) {
    return null;
  }

  if (installFiles.length < 1 || !isInstalled) {
    return (
      <section>
        This dataset isn't installed to {projectId} or contains no files.
      </section>
    );
  }

  const tableState: MesaStateProps<ColumnType> = {
    rows: installFiles,
    columns: tableColumns(dataset, genome, sequenceId),
  }

  return (
    <section>
      <h3 className={classify('SectionTitle')}>
        <Icon fa="bar-chart" />
        Genome Browser Tracks
      </h3>
      <div className="TracksTable">
        <Mesa state={tableState} />
      </div>
    </section>
  );
};

type ColumnType = {
  readonly fileName: string,
  readonly main?: any;
};

const tableColumns = (
  { datasetId, name }: DatasetGetResponseBody,
  genome: string,
  sequenceId: string,
): Array<MesaColumn<ColumnType>> => [
  {
    key: 'fileName',
    name: 'Filename',
    renderCell: ({ row }) => <code>{row.fileName}</code>,
  },
  {
    key: 'main',
    name: 'Genome Browser Link',
    renderCell: ({ row }) => (
      <BigwigGBrowseUploader
        sequenceId={sequenceId}
        dataFileName={row.fileName}
        datasetId={datasetId}
        projectId={projectId}
        genome={genome}
        datasetName={name}
      />
    ),
  },
];