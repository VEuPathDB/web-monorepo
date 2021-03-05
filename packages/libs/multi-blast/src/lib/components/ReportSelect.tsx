import { useCallback, useEffect, useState } from 'react';
import Select, { ActionMeta, ValueType } from 'react-select';

import { useDownloadReportCallback } from '../hooks/api';
import { IoBlastFormat } from '../utils/ServiceTypes';

import './ReportSelect.scss';

interface Props {
  jobId: string;
}

interface ReportOption {
  value: { format: IoBlastFormat; shouldZip: boolean };
  label: string;
}

const reportOptions: ReportOption[] = [
  {
    value: { format: 'pairwise', shouldZip: false },
    label: 'Text',
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
    value: { format: 'tabular', shouldZip: false },
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

export function ReportSelect({ jobId }: Props) {
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

  const downloadReportCallback = useDownloadReportCallback();

  useEffect(() => {
    let canceled = false;

    (async () => {
      if (downloadReportCallback != null && selectedReportOption != null) {
        try {
          await downloadReportCallback(
            jobId,
            selectedReportOption.value.format,
            selectedReportOption.value.shouldZip
          );
        } finally {
          if (!canceled) {
            setSelectedReportOption(undefined);
          }
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [downloadReportCallback, jobId, selectedReportOption]);

  return (
    <Select
      className="ReportSelectContainer"
      classNamePrefix="ReportSelect"
      placeholder={
        selectedReportOption == null
          ? 'Download report'
          : 'Downloading report...'
      }
      isDisabled={selectedReportOption != null}
      value={selectedReportOption}
      controlShouldRenderValue={false}
      onChange={onChangeReport}
      options={reportOptions}
    />
  );
}
