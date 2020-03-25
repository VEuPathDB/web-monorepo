import * as React from 'react';
import { noop } from 'lodash';
import { Props } from 'wdk-client/Controllers/WebServicesHelpController';
import WdkServiceJsonReporterForm from 'wdk-client/Views/ReporterForm/WdkServiceJsonReporterForm';

const STANDARD_REPORT_NAME = 'standard';

export default function(props: Props) {
  let [ formStates, setFormStates ] = React.useState(WdkServiceJsonReporterForm.getInitialState(props));
  let [ formHasBeenExpanded, setFormHasBeenExpanded ] = React.useState(false);
  let [ isFormExpanded, setIsFormExpanded ] = React.useState(false);

  let step = props.resultType?.type === 'step' ? props.resultType.step : undefined;
  let searchName = step?.searchName;
  let parameters = step?.searchConfig.parameters || {};
  let recordClassUrlSegment = props.recordClass?.urlSegment;
  let reportName = STANDARD_REPORT_NAME;
  let reportConfig = formStates.formState || "Not yet configured"
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
    : <div style={{ fontSize: "1.2em" }}>
        <h1>Working with Web Services</h1>
        <div style={{ margin: "10px"}}>
          Search results are available programmatically in a variety of formats (e.g. JSON, tab-delimited),
          delivered through an assortment of reports.  Configuration of a report consists of your search's
          parameter values and report-specific settings.  Reports can be requested via an HTTP POST (with
          JSON payload), or HTTP GET (which can sometimes be more convenient, but you must URL encode values).
        </div>
        <div style={{ margin: "10px"}}>
          { (!formHasBeenExpanded) &&
            <span>
              A default report has been selected to illustrate how you can access these endpoints. To choose a
              different report or change settings, <a style={linkStyle} onClick={() => { setFormHasBeenExpanded(true); setIsFormExpanded(true); }}>click here</a>.
            </span>
          }
          { formHasBeenExpanded &&
            <span>
              <a style={linkStyle} onClick={() => { setIsFormExpanded(!isFormExpanded); }}>
                {isFormExpanded ? "Hide" : "Show"} report selection and settings.
              </a>
            </span>
          }
        </div>
        { (isFormExpanded === true) &&
          <div style={{ border: "1px solid blue", borderRadius: "10px", marginLeft: "30px" }}>
            <WdkServiceJsonReporterForm<
              ReturnType<typeof WdkServiceJsonReporterForm.getInitialState>['formState'],
              ReturnType<typeof WdkServiceJsonReporterForm.getInitialState>['formUiState']
            >
              formState={formStates.formState}
              formUiState={formStates.formUiState}
              updateFormState={newFormStateValues => {
                const newFormState = {
                  ...formStates.formState,
                  ...newFormStateValues
                };

                setFormStates({
                  ...formStates,
                  formState: newFormState
                });

                return newFormState;
              }}
              updateFormUiState={newFormUiStateValues => {
                const newFormUiState = {
                  ...formStates.formState,
                  ...newFormUiStateValues
                };

                setFormStates({
                  ...formStates,
                  formUiState: newFormUiState
                });

                return newFormUiState;
              }}
              question={props.question}
              recordClass={props.recordClass}
              ontology={props.ontology}
              scope="result"
              summaryView="?"
              onSubmit={noop}
              includeSubmit={false}
            />
          </div>
        }
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
      </div>;
}
