import path from 'path';
import { LongJobResponse } from '../utils/ServiceTypes';
import { useBlastApi } from '../hooks/api';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import { blastWorkspaceCx } from './BlastWorkspace';
import { Link } from 'react-router-dom';
import { blastConfigToParamValues } from '../utils/params';
import { useMemo } from 'react';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { upperFirst, zip } from 'lodash';
import Mesa from '@veupathdb/coreui/lib/components/Mesa/Ui/Mesa';
import { create as createMesaState } from '@veupathdb/coreui/lib/components/Mesa/Utils/MesaState';
import { FilledButton } from '@veupathdb/coreui';

interface Props {
  job: LongJobResponse;
  query: string;
}

export function DiamondResultContainer(props: Props) {
  const { job, query } = props;

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
            '1-100'
          ),
    [blastApi, reportMetadataResult.value]
  );

  const parameterValues = useMemo(() => {
    return blastConfigToParamValues(job.config);
  }, [job]);

  return (
    <div className={blastWorkspaceCx('Result', 'Complete')}>
      <h1>Diamond Job - result</h1>
      <Link className="BackToAllJobs" to="../all">
        &lt;&lt; All my Diamond Jobs
      </Link>
      <div className="ConfigDetailsContainer">
        <div className="ConfigDetails">
          <span className="InlineHeader">Job Id:</span>
          <span className="JobId">
            {job.id}
            {parameterValues && (
              <Link
                className="EditJob"
                to={(location) => ({
                  // When providing a location object, relative
                  // paths are relative to the application root
                  // and not the current location. So, we need
                  // to get a handle on the current location to
                  // create a path relative to it. Furthermore,
                  // we need to use path.join to normalize the
                  // path (remove the .. parts) so that
                  // react-router recognizes it.
                  pathname: path.join(location.pathname, './../../new'),
                  state: {
                    parameterValues,
                  },
                })}
              >
                Revise and rerun
              </Link>
            )}
          </span>
          {job.description != null && (
            <>
              <span className="InlineHeader">Description:</span>
              <span>{job.description}</span>
            </>
          )}
          <span className="InlineHeader">Program:</span>
          <span>{job.config.tool}</span>
          {/* <span className="InlineHeader">Target Type:</span>
          <span>{hitTypeDisplayName}</span> */}
          {/* <span className="InlineHeader">
            {databases.length > 1 ? 'Databases' : 'Database'}:
          </span>
          <span>
            {databasesStr.length > MAX_DATABASE_STRING_LENGTH ? (
              <CollapsibleSection
                isCollapsed={!showMore}
                onCollapsedChange={() => setShowMore(!showMore)}
                headerContent={
                  <>
                    {!showMore ? (
                      <span>
                        {databasesStr.slice(0, MAX_DATABASE_STRING_LENGTH)}...{' '}
                        <span className="link">Show more</span>
                      </span>
                    ) : (
                      <div
                        style={{
                          height: '2em',
                        }}
                      >
                        <span className="link">Show less</span>
                      </div>
                    )}
                  </>
                }
                children={databasesStr}
              />
            ) : (
              databasesStr
            )}
          </span> */}
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
        ) : reportResult.value == null ? (
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
              <h2>Mapped proteins</h2>
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
            <DiamondResultTable
              rawResult={reportResult.value.value as string}
              fields={job.config.outFormat?.fields!}
            ></DiamondResultTable>
          </>
        )}
      </div>
    </div>
  );
}

interface DiamondResultTableProps {
  rawResult: string;
  fields: string[];
}
function DiamondResultTable(props: DiamondResultTableProps) {
  const { rawResult } = props;
  const tableState = useMemo(() => {
    const [fields, ...rawRows] = rawResult
      .trim()
      .split(/\n/g)
      .map((row) => row.split(/\t/g));
    const columns = fields.map((field) => ({
      key: field,
      name: upperFirst(field.replaceAll('-', ' ')),
    }));
    const rows = rawRows.map((row) => Object.fromEntries(zip(fields, row)));
    return createMesaState({
      columns,
      rows,
    });
  }, [rawResult]);

  return <Mesa state={tableState} />;
}
