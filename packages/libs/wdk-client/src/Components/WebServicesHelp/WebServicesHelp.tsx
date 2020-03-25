import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Props } from 'wdk-client/Controllers/WebServicesHelpController';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import DownloadFormContainer from 'wdk-client/Views/ReporterForm/DownloadFormContainer';

import 'wdk-client/Components/WebServicesHelp/WebServicesHelp.scss';

const cx = makeClassNameHelper('wdk-WebServicesHelp');

const STANDARD_REPORT_NAME = 'standard';

export default function(props: Props) {
  let history = useHistory();

  let goBack = React.useCallback(() => {
    history.goBack();
  }, [ history ]);

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
  let linkStyle = { cursor: "pointer" };
  return (
    props.resultType?.type !== 'step' ||
    !props.ontology ||
    !props.question ||
    !props.recordClass
  )
    ? <div>This page cannot be rendered with the passed query parameters.</div>
    : <div className={cx()}>
        <h1>Build A Web Services URL</h1>
        <div className={cx('--Steps')}>
          <div className={cx('--StepHeader')}>
            Build the input part of the URL
          </div>
          <div className={cx('--InputPartInstructions')}>
            <p>
              You are building a web services URL based on the input you just provided in the
              {' '}
              {props.recordClass.displayNamePlural} by {props.question.displayName} search page.
              {' '}
              (To revise, <a href="#" onClick={goBack}>go back to that page</a>.)
            </p>
          </div>
          <div className={cx('--StepHeader')}>
            Build the report part of the URL
          </div>
          <div className={cx('--Report')}>
            <DownloadFormContainer {...props} />
          </div>
          <h2 style={{ padding: "0", margin: "20px 0 10px 0"}}>Sample Requests</h2>
          <div style={{ margin: "10px"}}>
            <h3 style={{ padding: "0", margin: "20px 0 10px 0" }}>HTTP GET: Create a URL containing your search, parameters, and report settings</h3>
            <div style={{ marginLeft: "20px" }}>
              <a target="_blank" href={getUrlLink}>{getUrlDisplay}</a>
            </div>
          </div>
          <div style={{ margin: "10px"}}>
            <h3 style={{ padding: "0", margin: "20px 0 10px 0" }}>HTTP POST: Send the JSON below to the following URL</h3>
            <div style={{ marginLeft: "20px" }}>
              <a target="_blank" href={url}>{url}</a>
              <pre>
                {requestJson}
              </pre>
            </div>
          </div>
        </div>
      </div>;
}
