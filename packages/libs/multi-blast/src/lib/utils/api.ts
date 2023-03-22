import { ReportJobPollingState } from '../components/BlastWorkspaceResult';
import { BlastReportClient } from './api/BlastReportClient';

// FIXME: Update FetchClientWithCredentials to accommodate responses
// with "attachment" Content-Disposition
export async function downloadJobContent(
  reportAPI: BlastReportClient,
  reportResponse: ReportJobPollingState,
  shouldZip: boolean
): Promise<void> {
  if (reportResponse.status === 'report-pending') {
    throw new Error('Tried to download a report which has not yet finished.');
  }

  if (reportResponse.status === 'queueing-error') {
    throw new Error('We were unable to queue your report.');
  }

  if (reportResponse.status === 'request-error') {
    throw new Error(
      `An error occurred while trying to create your report: ${JSON.stringify(
        reportResponse.details
      )}`
    );
  }

  const reportJobID = reportResponse.report.reportJobID;
  const filesResponse = await reportAPI.listJobFiles(
    reportResponse.report.reportJobID
  );

  if (filesResponse.status === 'error') {
    throw new Error(
      'An error occurred while attempting to fetch the results of your report: ' +
        JSON.stringify(filesResponse.details)
    );
  }

  const nonZippedReportFiles = filesResponse.value
    .filter((entry) => !entry.name.endsWith('.zip'))
    .map((entry) => entry.name);

  const reportFile =
    shouldZip || nonZippedReportFiles[0] == null
      ? 'report.zip'
      : nonZippedReportFiles[0];

  const downloadResponse = await reportAPI.downloadJobFile(
    reportJobID,
    reportFile
  );

  if (downloadResponse.status !== 'ok') {
    throw new Error('An error occurred while trying to download your report.');
  }
}
