import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import Select, { ActionMeta, OptionsType, ValueType } from 'react-select';

import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { Props as CombinedResultProps } from '../components/CombinedResult';
import { BlastServiceUrl, useBlastApi } from '../hooks/api';
import { IoBlastFormat } from '../utils/ServiceTypes';
import { downloadJobContent } from '../utils/api';

import './ReportSelect.scss';

interface Props {
  combinedResultTableDownloadConfig?: CombinedResultProps['downloadTableOptions'];
  jobId: string;
  placeholder: string;
}

interface ReportOption {
  value:
    | 'combined-result-table'
    | { format: IoBlastFormat; shouldZip: boolean };
  label: string;
}

const baseReportOptions: ReportOption[] = [
  {
    value: { format: 'pairwise', shouldZip: false },
    label: 'Text (pairwise)',
  },
  {
    value: { format: 'xml', shouldZip: false },
    label: 'XML',
  },
  {
    value: { format: 'archive-asn-1', shouldZip: false },
    label: 'ASN.1',
  },
  {
    value: { format: 'seqalign-json', shouldZip: false },
    label: 'JSON Seq-align',
  },
  {
    value: { format: 'tabular-with-comments', shouldZip: false },
    label: 'Hit Table (text)',
  },
  {
    value: { format: 'csv', shouldZip: false },
    label: 'Hit Table (csv)',
  },
  {
    value: { format: 'multi-file-xml2', shouldZip: true },
    label: 'Multiple-file XML2',
  },
  {
    value: { format: 'single-file-xml2', shouldZip: false },
    label: 'Single-file XML2',
  },
  {
    value: { format: 'multi-file-json', shouldZip: true },
    label: 'Multiple-file JSON',
  },
  {
    value: { format: 'single-file-json', shouldZip: false },
    label: 'Single-file JSON',
  },
];

export function ReportSelect({
  combinedResultTableDownloadConfig,
  jobId,
  placeholder,
}: Props) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const blastServiceUrl = useContext(BlastServiceUrl);
  const blastApi = useBlastApi();

  const [selectedReportOption, setSelectedReportOption] = useState<
    ReportOption | undefined
  >(undefined);

  const onChangeReport = useCallback(
    (
      option: ValueType<ReportOption, false>,
      { action }: ActionMeta<ReportOption>
    ) => {
      if (action === 'select-option') {
        setSelectedReportOption(option == null ? undefined : option);
      }
    },
    []
  );

  useEffect(
    () =>
      Task.fromPromise(async () => {
        if (selectedReportOption != null) {
          if (selectedReportOption.value === 'combined-result-table') {
            if (combinedResultTableDownloadConfig?.offer) {
              await combinedResultTableDownloadConfig.onClickDownloadTable();
            }
          } else {
            const { format, shouldZip } = selectedReportOption.value;

            await downloadJobContent(
              blastApi,
              blastServiceUrl,
              await wdkService.getCurrentUser(),
              jobId,
              format,
              shouldZip,
              `${jobId}-${format}-report`
            );
          }
        }
      }).run(
        () => setSelectedReportOption(undefined),
        () => setSelectedReportOption(undefined)
      ),
    [
      blastApi,
      blastServiceUrl,
      wdkService,
      combinedResultTableDownloadConfig,
      jobId,
      selectedReportOption,
    ]
  );

  const options = useMemo(
    () =>
      (!combinedResultTableDownloadConfig?.offer
        ? [
            {
              label: 'NCBI Formats',
              options: baseReportOptions,
            },
          ]
        : [
            {
              value: 'combined-result-table',
              label: 'This Table (csv)',
            },
            {
              label: 'NCBI Formats',
              options: baseReportOptions,
            },
          ]) as OptionsType<ReportOption>,
    [combinedResultTableDownloadConfig]
  );

  return (
    <Select
      className="ReportSelectContainer"
      classNamePrefix="ReportSelect"
      placeholder={
        selectedReportOption == null ? placeholder : 'Downloading...'
      }
      isDisabled={selectedReportOption != null}
      value={selectedReportOption}
      controlShouldRenderValue={false}
      onChange={onChangeReport}
      options={options}
    />
  );
}
