import { useCallback, useEffect, useState } from 'react';
import Select, { ActionMeta, ValueType } from 'react-select';
import { useDownloadReportCallback } from '../hooks/api';

import { IoBlastFormat } from '../utils/ServiceTypes';

import './ReportSelect.scss';

interface Props {
  jobId: string;
}

interface ReportOption {
  value: IoBlastFormat;
  label: string;
}

const reportOptions: ReportOption[] = [
  {
    value: 'pairwise',
    label: 'Text',
  },
  {
    value: 'xml',
    label: 'XML',
  },
  {
    value: 'archive-asn-1',
    label: 'ASN.1',
  },
  {
    value: 'seqalign-json',
    label: 'JSON Seq-align',
  },
  {
    value: 'tabular',
    label: 'Hit Table (text)',
  },
  {
    value: 'csv',
    label: 'Hit Table (csv)',
  },
  {
    value: 'multi-file-xml2',
    label: 'Multiple-file XML2',
  },
  {
    value: 'single-file-xml2',
    label: 'Single-file XML2',
  },
  {
    value: 'multi-file-json',
    label: 'Multiple-file JSON',
  },
  {
    value: 'single-file-json',
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
          await downloadReportCallback(jobId, selectedReportOption.value);
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
