import * as React from 'react';
import { Link } from '../../Components';
import { Props } from '../../Controllers/WebServicesHelpController';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import DownloadFormContainer from '../../Views/ReporterForm/DownloadFormContainer';

import '../../Components/WebServicesHelp/WebServicesHelp.scss';

const cx = makeClassNameHelper('wdk-WebServicesHelp');

export default function (props: Props) {
  let step =
    props.resultType?.type === 'step' ? props.resultType.step : undefined;
  let searchName = step?.searchName;
  let parameters = step?.searchConfig.parameters || {};
  let recordClassUrlSegment = props.recordClass?.urlSegment;
  let reportName = props.selectedReporter;
  let reportConfig = props.formState || 'Not yet configured';
  let l = window.location;
  let webapp = l.pathname.substring(0, l.pathname.indexOf('/', 1));
  let urlBase = l.protocol + '//' + l.host + webapp;
  let url =
    urlBase +
    '/service/record-types/' +
    recordClassUrlSegment +
    '/searches/' +
    searchName +
    '/reports/' +
    reportName;
  let searchConfig = step?.searchConfig;
  let queryParams = Object.keys(parameters).map(
    (name, index) =>
      (index === 0 ? '?' : '&') +
      name +
      '=' +
      encodeURIComponent(parameters[name])
  );
  let reportConfigQueryParam =
    (queryParams.length === 0 ? '?' : '&') + 'reportConfig=';
  let getUrlPieces = [url, ...queryParams];
  let getUrlLink =
    getUrlPieces.join('') +
    reportConfigQueryParam +
    encodeURIComponent(JSON.stringify(reportConfig));
  let getUrlDisplay = (
    <span>
      {getUrlPieces.map((piece) => (
        <React.Fragment key={piece}>
          {piece}
          <br />
        </React.Fragment>
      ))}
      {reportConfigQueryParam + JSON.stringify(reportConfig)}
    </span>
  );
  let requestJson = JSON.stringify({ searchConfig, reportConfig }, null, 2);

  let goBackUrl =
    `/search/${props.recordClass?.urlSegment}/${props.question?.urlSegment}` +
    `?${Object.entries(parameters)
      .map(([key, value]) => `param.${key}=${value}`)
      .join('&')}`;

  return props.resultType?.type !== 'step' ||
    !props.ontology ||
    !props.question ||
    !props.recordClass ? (
    <div>This page cannot be rendered with the passed query parameters.</div>
  ) : (
    <div className={cx()}>
      <h1>Build A Web Services Request</h1>
      <div className={cx('--Content')}>
        <div className={cx('--Steps')}>
          <div className={cx('--StepHeader')}>
            Build the <em>search</em> component of a GET or POST request
          </div>
          <div className={cx('--SearchPartInstructions')}>
            <p>
              The <em>search</em> parameters in the requests to the right use
              your input from the{' '}
              <em>
                {props.recordClass.displayNamePlural} by{' '}
                {props.question.displayName}
              </em>{' '}
              search page. To revise them,{' '}
              <Link to={goBackUrl}>go back to that page</Link>.
            </p>
          </div>
          <div className={cx('--StepHeader')}>
            Build the <em>report</em> component of the GET or POST request
          </div>
          <div className={cx('--ReportPartInstructions')}>
            <DownloadFormContainer {...props} />
          </div>
        </div>
        <GeneratedRequests
          getUrlLink={getUrlLink}
          getUrlDisplay={getUrlDisplay}
          url={url}
          requestJson={requestJson}
        />
      </div>
    </div>
  );
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
  requestJson,
}: GeneratedRequestsProps) {
  return (
    <div className={cx('--GeneratedRequestsContainer')}>
      <div className={cx('--StepHeader')}>Here is your GET or POST</div>
      <div className={cx('--GeneratedRequests')}>
        <div className={cx('--GeneratedGetRequest')}>
          <h2>GET</h2>
          <div className={cx('--RequestContent')}>
            <a target="_blank" href={getUrlLink}>
              {getUrlDisplay}
            </a>
          </div>
        </div>
        <div className={cx('--GeneratedPostRequest')}>
          <h2>POST</h2>
          <div className={cx('--RequestContent')}>
            <a target="_blank" href={url}>
              {url}
            </a>
            <pre>{requestJson}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
