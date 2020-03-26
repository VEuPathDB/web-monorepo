import * as React from 'react';
import { Link } from 'wdk-client/Components';
import { Props } from 'wdk-client/Controllers/WebServicesHelpController';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import DownloadFormContainer from 'wdk-client/Views/ReporterForm/DownloadFormContainer';

import 'wdk-client/Components/WebServicesHelp/WebServicesHelp.scss';

const cx = makeClassNameHelper('wdk-WebServicesHelp');

const STANDARD_REPORT_NAME = 'standard';

export default function(props: Props) {
  let step = props.resultType?.type === 'step' ? props.resultType.step : undefined;
  let searchName = step?.searchName;
  let parameters = step?.searchConfig.parameters || {};
  let recordClassUrlSegment = props.recordClass?.urlSegment;
  let reportName = STANDARD_REPORT_NAME;
  let reportConfig = props.formState || "Not yet configured"
  let l = window.location;
  let webapp = l.pathname.substring(0, l.pathname.indexOf("/", 1));
  let urlBase = l.protocol + "//" + l.host + webapp;
  let url = urlBase +
    '/service/record-types/' + recordClassUrlSegment +
    '/searches/' + searchName +
    '/reports/' + reportName;
  let searchConfig = step?.searchConfig;
  let queryParams = Object.keys(parameters)
    .map((name, index) => (index === 0 ? "?" : "&") + name + "=" + encodeURIComponent(parameters[name]));
  let reportConfigQueryParam = (queryParams.length === 0 ? "?" : "&") + "reportConfig=";
  let getUrlPieces = [ url, ...queryParams ];
  let getUrlLink = getUrlPieces.join("") + reportConfigQueryParam + encodeURIComponent(JSON.stringify(reportConfig));
  let getUrlDisplay = (
    <span>
      {getUrlPieces.map(piece =>
        <React.Fragment key={piece}>{piece}<br/></React.Fragment>)}
      {reportConfigQueryParam + JSON.stringify(reportConfig)}
    </span>
  );
  let requestJson = JSON.stringify({ searchConfig, reportConfig }, null, 2);

  let goBackUrl = `/search/${props.recordClass?.urlSegment}/${props.question?.urlSegment}` +
    `?${Object.entries(parameters).map(([ key, value ]) => `param.${key}=${value}`).join('&')}`;

  return (
    props.resultType?.type !== 'step' ||
    !props.ontology ||
    !props.question ||
    !props.recordClass
  )
    ? <div>This page cannot be rendered with the passed query parameters.</div>
    : <div className={cx()}>
        <h1>Build A Web Services Requestion</h1>
        <div className={cx('--Steps')}>
          <div className={cx('--StepHeader')}>
            Build the <em>search</em> component of the GET/POST
          </div>
          <div className={cx('--InputPartInstructions')}>
            <p>
              You are building a web services URL based on the input you provided in the
              {' '}
              {props.recordClass.displayNamePlural} by {props.question.displayName} search page.
              {' '}
              (To revise, <Link to={goBackUrl}>go back to that page</Link>.)
            </p>
          </div>
          <div className={cx('--StepHeader')}>
            Build the <em>report</em> component of the GET/POST
          </div>
          <div className={cx('--ReportPartInstructions')}>
            <p>In the URLs below, we have pre-selected some default columns and a JSON reporter for your report.</p>
            <details>
              <summary>
                Modify your report configuration
              </summary>
              <DownloadFormContainer {...props} />
            </details>
            <GeneratedRequests
              getUrlLink={getUrlLink}
              getUrlDisplay={getUrlDisplay}
              url={url}
              requestJson={requestJson}
            />
          </div>
        </div>
      </div>;
}

interface GeneratedRequestsProps {
  getUrlLink: string;
  getUrlDisplay: React.ReactNode;
  url: string;
  requestJson: string;
}

function GeneratedRequests({
  getUrlLink,
  getUrlDisplay,
  url,
  requestJson
}: GeneratedRequestsProps) {
  return (
    <React.Fragment>
      <div>
        <h2>HTTP GET: The following url contains your search, parameters, and report settings</h2>
        <p className={cx('--BuiltUrl')}>
          <a target="_blank" href={getUrlLink}>{getUrlDisplay}</a>
        </p>
      </div>
      <div>
        <h2>HTTP POST: Send the JSON below to the following URL</h2>
        <p className={cx('--BuiltUrl')}>
          <a target="_blank" href={url}>{url}</a>
          <pre>
            {requestJson}
          </pre>
        </p>
      </div>
    </React.Fragment>
  );
}
