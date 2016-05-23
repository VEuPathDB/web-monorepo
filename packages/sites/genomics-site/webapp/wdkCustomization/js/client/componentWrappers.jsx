import lodash from 'lodash';
import { Components, ComponentUtils } from 'wdk-client';
import { findComponent } from './components/records';
import * as Gbrowse from './components/common/Gbrowse';
import Sequence from './components/common/Sequence';
import { selectReporterComponent } from './util/reporterSelector';
import ApiApplicationSpecificProperties from './components/ApiApplicationSpecificProperties';
import ApiUserIdentity from './components/ApiUserIdentity';

// Remove project_id from record links
export function RecordLink(WdkRecordLink) {
  return function ApiRecordLink(props) {
    let recordId = props.recordId.filter(p => p.name !== 'project_id');
    return (
      <WdkRecordLink {...props} recordId={recordId}/>
    );
  };
}

// Project id is not needed for these record classes.
// Matches urlSegment.
const RECORD_CLASSES_WITHOUT_PROJECT_ID = [ 'dataset', 'genomic-sequence' ];


/**
 * Munge url so that we can hide pieces of primary key we don't want users to see.
 *
 * The general operation that is happening below is that we are intercepting the
 * props sent to the WDK RecordController component and adding the project id
 * when it is needed.
 *
 * Conceptually, this could also be done at the action creator level. If WDK
 * provided a way to customize a view controller's action creator, we could
 * just append the project id when needed.
 *
 * Note that we are doing a few other things here, which is to say this override
 * is a bit of a jumble at the moment.
 *
 * `splat` refers to a wildcard dynamic url segment
 * as defined by the record route. The value of splat is essentially primary key
 * values separated by a '/'.
 */
export function RecordController(WdkRecordController) {
  return function ApiRecordController(props) {
    let { splat, recordClass } = props.params;
    let projectIdUrl = '/' + wdk.MODEL_NAME;
    let hasProjectId = splat.endsWith(projectIdUrl);

    if (hasProjectId) {
      setTimeout(function() {
        props.history.replace(props.location.pathname.replace(projectIdUrl, ''));
      }, 0);
      return <Components.Loading/>;
    }

    // These record classes do not need the project id as a part of the primary key
    // so we just render with the url params as-is.
    if (RECORD_CLASSES_WITHOUT_PROJECT_ID.indexOf(recordClass) > -1) {
      return ( <WdkRecordController {...props} /> );
    }

    // Append project id to request
    let params = Object.assign({}, props.params, {
      splat: `${splat}/${wdk.MODEL_NAME}`
    });

    return (
      <WdkRecordController {...props} params={params}/>
    );
  };
}

// Customize the Record Component
export function RecordUI(DefaultComponent) {
  return function ApiRecordUI(props) {
    let ResolvedComponent =
      findComponent('RecordUI', props.recordClass.name) || DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
  };
}

// Customize the Record Component
export function RecordHeading(DefaultComponent) {
  return function ApiRecordHeading(props) {
    let ResolvedComponent =
      findComponent('RecordHeading', props.recordClass.name) || DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
  };
}

export function Record(DefaultComponent) {
  return function ApiRecord(props) {
    let ResolvedComponent =
      findComponent('Record', props.recordClass.name) || DefaultComponent;
    return (
      <div>
        <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
        <RecordAttributionSection {...props}/>
      </div>
    );
  };
}

function RecordAttributionSection(props) {
  if ('attribution' in props.record.attributes) {
    return (
      <div>
        <h3>Record Attribution</h3>
        {ComponentUtils.renderAttributeValue(props.record.attributes.attribution)}
      </div>
    )
  }
  return <noscript/>
}

export function RecordOverview(DefaultComponent) {
  return function ApiRecordOverview(props) {
    let ResolvedComponent =
      findComponent('RecordOverview', props.recordClass.name) || DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
  };
}

// Customize StepDownloadForm to show the appropriate form based on the
//   selected reporter and record class
export function StepDownloadForm(WdkStepDownloadForm) {
  return function ApiStepDownloadForm(props) {
    let Reporter = selectReporterComponent(props.selectedReporter, props.recordClass.name);
    return (
      <div>
        <hr/>
        <Reporter {...props}/>
      </div>
    );
  }
}

export function RecordTable(DefaultComponent) {
  return function ApiRecordTable(props) {
    if (lodash.isEmpty(props.value)) return <DefaultComponent {...props}/>;
    let ResolvedComponent =
      findComponent('RecordTable', props.recordClass.name) || DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
  };
}

export function RecordAttribute(DefaultComponent) {
  return function ApiRecordAttribute(props) {
    let context = Gbrowse.contexts.find(context => context.gbrowse_url === props.name);
    if (context != null) {
        return ( <Gbrowse.GbrowseContext {...props} context={context} /> );
    }

      let sequenceRE = /sequence$/;
      if (sequenceRE.test(props.name)) {
          return ( <Sequence sequence={props.value}/> );
      }


    let ResolvedComponent =
      findComponent('RecordAttribute', props.recordClass.name) || DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
  };
}

/**
 * Overrides the Identification fieldset on the User Profile/Account form from the WDK.  ApiDB
 * does not use all the fields that the WDK provides
 * @returns {function()} - React component overriding the original WDK component
 * @constructor
 */
export function UserIdentity() {
  return ApiUserIdentity;
}

/**
 * Overrides the Contact fieldset on the User Profile/Account form from the WDK.  ApiDB
 * does not collect contact information.  Consequently, the WDK UserContact component is
 * replaced with an empty React component
 * @returns {Function} - Empty React component
 * @constructor
 */
export function UserContact() {
  return function() { return <noscript /> };
}

/**
 * Overrides the Preferences fieldset on the User Profile/Account form from the WDK.  The WDK
 * has no application specific properties although it provides for that possibility.  The empty
 * React component placeholder is overriden with an ApiDB specific component.
 * @returns {*} - Application specific properties component
 * @constructor
 */
export function ApplicationSpecificProperties() {
  return ApiApplicationSpecificProperties;
}

/**
 * Trims PROJECT_ID off the tail end of a comma-delimited list of primary key value parts
 */
export function PrimaryKeySpan(DefaultComponent) {
  return function(props) {
    let pkValues = props.primaryKeyString.split(',');
    let newPkString = pkValues[0];
    for (let i = 1; i < pkValues.length - 1; i++) {
      newPkString += ", " + pkValues[i];
    }
    return ( <span>{newPkString}</span> );
  };
}
