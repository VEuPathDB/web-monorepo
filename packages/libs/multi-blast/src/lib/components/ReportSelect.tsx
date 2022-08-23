import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import Select, { ActionMeta, OptionsType, ValueType } from 'react-select';

import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { Props as CombinedResultProps } from '../components/CombinedResult';
import { BlastServiceUrl, useBlastApi } from '../hooks/api';
import { IoBlastFormat } from '../utils/ServiceTypes';
import { downloadJobContent } from '../utils/api';

import {
  ReportPollingState,
  makeReportPollingPromise,
} from './BlastWorkspaceResult';

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
  const [reportState, setReportState] = useState<ReportPollingState>();

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

  useEffect(() => {
    if (
      selectedReportOption == null ||
      selectedReportOption.value === 'combined-result-table'
    ) {
      return;
    }

    const format = selectedReportOption.value.format;

    return Task.fromPromise(() =>
      makeReportPollingPromise(blastApi, jobId, format)
    ).run(setReportState);
  }, [blastApi, jobId, selectedReportOption]);

  useEffect(() => {
    if (
      selectedReportOption == null ||
      selectedReportOption.value === 'combined-result-table' ||
      reportState == null ||
      reportState.status === 'report-running'
    ) {
      return;
    }

    const { format, shouldZip } = selectedReportOption.value;

    return Task.fromPromise(async () =>
      downloadJobContent(
        blastServiceUrl,
        await wdkService.getCurrentUser(),
        reportState,
        shouldZip,
        `${jobId}-${format}-report`
      )
    ).run(
      () => {
        setSelectedReportOption(undefined);
        setReportState(undefined);
      },
      () => {
        setSelectedReportOption(undefined);
        setReportState(undefined);
      }
    );
  }, [blastServiceUrl, wdkService, reportState, jobId, selectedReportOption]);

  useEffect(() => {
    if (
      selectedReportOption?.value !== 'combined-result-table' ||
      combinedResultTableDownloadConfig?.offer !== true
    ) {
      return;
    }

    return Task.fromPromise(async () =>
      combinedResultTableDownloadConfig.onClickDownloadTable()
    ).run(
      () => {
        setSelectedReportOption(undefined);
        setReportState(undefined);
      },
      () => {
        setSelectedReportOption(undefined);
        setReportState(undefined);
      }
    );
  }, [combinedResultTableDownloadConfig, selectedReportOption]);

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
