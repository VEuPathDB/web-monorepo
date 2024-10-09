import { LongJobResponse } from '../utils/ServiceTypes';
import { useBlastApi } from '../hooks/api';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { blastWorkspaceCx } from './BlastWorkspace';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { upperFirst, zip } from 'lodash';
import Mesa from '@veupathdb/coreui/lib/components/Mesa/Ui/Mesa';
import { create as createMesaState } from '@veupathdb/coreui/lib/components/Mesa/Utils/MesaState';
import { FilledButton } from '@veupathdb/coreui';

const ROW_LIMIT = 100;

interface Props {
  job: LongJobResponse;
  query: string;
  workspaceShortName?: string;
}

export function DiamondResultContainer(props: Props) {
  const { job } = props;

  const blastApi = useBlastApi();

  const headerRow = job.config.outFormat?.fields?.flatMap((field) =>
    field === 'subject-title' || field === 'stitle'
      ? ['Subject sequence id', 'OrthoMCL group id', 'Description']
      : [upperFirst(field.replaceAll('-', ' '))]
  );

  const reportMetadataResult = usePromise(
    () => blastApi.fetchReport(job.id),
    [blastApi, job.id]
  );

  const reportResult = usePromise(
    async () =>
      reportMetadataResult.value?.status !== 'ok'
        ? undefined
        : blastApi.fetchSingleFileReport(
            reportMetadataResult.value.value.reportID,
            reportMetadataResult.value.value.files?.[0]!,
            headerRow,
            `1-${ROW_LIMIT}`
          ),
    [blastApi, reportMetadataResult.value]
  );

  const { rows, columns } = useDiamondData(
    reportResult.value && reportResult.value.status === 'ok'
      ? (reportResult.value.value as string)
      : undefined
  );

  return (
    <div className={blastWorkspaceCx('Result', 'Complete')}>
      <h1>{props.workspaceShortName ?? 'DIAMOND'} Job - result</h1>
      <Link className="BackToAllJobs" to="../all">
        &lt;&lt; All my {props.workspaceShortName ?? 'DIAMOND'} Jobs
      </Link>
      <div className="ConfigDetailsContainer">
        <div className="ConfigDetails">
          <span className="InlineHeader">Job Id:</span>
          <span className="JobId">{job.id}</span>
          {job.description != null && (
            <>
              <span className="InlineHeader">Description:</span>
              <span>{job.description}</span>
            </>
          )}
          <span className="InlineHeader">Program:</span>
          <span>{job.config.tool}</span>
        </div>
      </div>
      <div className="ResultContainer">
        {reportMetadataResult.value == null ? (
          <Loading>
            <div className="wdk-LoadingData">Loading data...</div>
          </Loading>
        ) : reportMetadataResult.value.status === 'error' ? (
          <div>
            Unable to load results:{' '}
            {JSON.stringify(reportMetadataResult.value.details)}
          </div>
        ) : reportResult.value == null || rows == null || columns == null ? (
          <Loading>
            <div className="wdk-LoadingData">Loading data...</div>
          </Loading>
        ) : reportResult.value.status === 'error' ? (
          <div>Unable to load results: {reportResult.value.details.status}</div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
              }}
            >
              <h2>
                {rows.length < ROW_LIMIT
                  ? `Showing all ${rows.length} sequences in your query file.`
                  : `Showing the first ${ROW_LIMIT} sequences in your query file.`}
              </h2>
              <form
                method="get"
                action={blastApi.getSingleFileReportUrl(
                  reportMetadataResult.value.value.reportID,
                  reportMetadataResult.value.value.files?.[0]!
                )}
              >
                <input
                  type="hidden"
                  name="headers"
                  value={headerRow?.join(',')}
                />
                <FilledButton
                  onPress={() => {
                    /* This prop is required, but is not needed when submitting a form */
                  }}
                  additionalAriaProperties={{
                    type: 'submit',
                  }}
                  text="Download as a tsv file"
                  themeRole="primary"
                />
              </form>
            </div>
            <DiamondResultTable rows={rows} columns={columns} />
          </>
        )}
      </div>
    </div>
  );
}

interface DiamondResultTableProps {
  rows: object[];
  columns: { key: string; name: string }[];
}

function DiamondResultTable(props: DiamondResultTableProps) {
  const { rows, columns } = props;
  const tableState = useMemo(() => {
    return createMesaState({
      columns,
      rows,
    });
  }, [rows, columns]);

  return <Mesa state={tableState} />;
}

function useDiamondData(rawResult: string | undefined) {
  return useMemo(() => {
    if (rawResult == null) return {};
    const [fields, ...rawRows] = rawResult
      .trim()
      .split(/\n/g)
      .map((row) => row.split(/\t/g));
    const columns = fields.map((field) => ({
      key: field,
      name: upperFirst(field.replaceAll('-', ' ')),
    }));
    const rows = rawRows.map((row) =>
      Object.fromEntries(zip(fields, row))
    ) as object[];
    return { columns, rows };
  }, [rawResult]);
}
