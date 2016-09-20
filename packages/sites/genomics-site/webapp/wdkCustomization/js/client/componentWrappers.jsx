import React from 'react';
import { projectId } from './config';
import { CollapsibleSection, RecordAttribute as WdkRecordAttribute, Link } from 'wdk-client/Components';
import {renderWithCustomElements} from './components/customElements';
import { findComponent } from './components/records';
import * as Gbrowse from './components/common/Gbrowse';
import Sequence from './components/common/Sequence';
import { selectReporterComponent } from './util/reporterSelector';
import ApiApplicationSpecificProperties from './components/ApiApplicationSpecificProperties';
import ApiUserIdentity from './components/ApiUserIdentity';
import ApiHeader from './components/Header';
import ApiFooter from './components/Footer';
import RecordTableContainer from './components/common/RecordTableContainer';
import { loadBasketCounts } from './actioncreators/GlobalActionCreators';

export let Header = () => ApiHeader;
export let Footer = () => ApiFooter;

const stopPropagation = event => event.stopPropagation();

/** Remove project_id from record links */
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
 * Adds projectId primary key record to splat of props for pages referencing
 * a single record.  If recordclass of that record does not include the
 * projectId as a PK value, props are returned unchanged.
 */
function addProjectIdPkValue(props) {
  let { splat, recordClass } = props.params;

  // These record classes do not need the project id as a part of the primary key
  // so we just render with the url params as-is.
  if (RECORD_CLASSES_WITHOUT_PROJECT_ID.includes(recordClass)) {
    return props;
  }

  // Append project id to request
  let params = Object.assign({}, props.params, {
    splat: `${splat}/${projectId}`
  });
  // reassign props to modified props object
  return Object.assign({}, props, { params });
}

/**
 * In ./routes.js, we redirect urls to the record page that have the project ID
 * included such that the project ID is removed. In this component, we add it
 * back for record classes that use project ID as a part of the primary key.
 * The objective is to hide the project ID from the URL whenever possible.
 *
 * `splat` refers to a wildcard dynamic url segment
 * as defined by the record route. The value of splat is essentially primary key
 * values separated by a '/'.
 */
export function RecordController(WdkRecordController) {
  return class ApiRecordController extends WdkRecordController {

    getActionCreators() {
      let wdkActionCreators = super.getActionCreators();
      return Object.assign({}, wdkActionCreators, {
        updateBasketStatus: (...args) => (dispatch) => {
          dispatch(wdkActionCreators.updateBasketStatus(...args))
          .then(dispatch(loadBasketCounts()));
        }
      })
    }

    loadData(state, props, previousProps) {
      let newProps = addProjectIdPkValue(props);
      super.loadData(state, newProps, previousProps);
    }
  };
}

export function DownloadFormController(WdkDownloadFormController) {
  return class ApiDownloadFormController extends WdkDownloadFormController {
    loadData(state, props, previousProps) {
      let newProps = addProjectIdPkValue(props);
      super.loadData(state, newProps, previousProps);
    }
  }
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
    return (
      <div>
        <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
        <RecordOverview {...props}/>
      </div>
    );
  };
}

export function RecordMainSection(DefaultComponent) {
  return function ApiRecord(props) {
    let ResolvedComponent =
      findComponent('RecordMainSection', props.recordClass.name) || DefaultComponent;
    return (
      <div>
        <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
        {props.depth === 1 && <RecordAttributionSection {...props}/>}
      </div>
    );
  };
}

function RecordAttributionSection(props) {
  if ('attribution' in props.record.attributes) {
    return (
      <div>
        <h3>Record Attribution</h3>
        <WdkRecordAttribute
          attribute={props.recordClass.attributesMap.attribution}
          record={props.record}
          recordClass={props.recordClass}
        />
      </div>
    )
  }
  return null;
}

function RecordOverview(props) {
  let Wrapper = findComponent('RecordOverview', props.recordClass.name) || 'div';
  return (
    <Wrapper {...props}>
      {renderWithCustomElements(props.record.attributes.record_overview)}
    </Wrapper>
  );
}

// Customize DownloadForm to show the appropriate form based on the
//   selected reporter and record class
export function DownloadForm() {
  return function ApiDownloadForm(props) {
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
    let ResolvedComponent =
      findComponent('RecordTable', props.recordClass.name) || DefaultComponent;
    return (
      <RecordTableContainer {...props}>
        <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
      </RecordTableContainer>
    );
  };
}

export function RecordTableSection(DefaultComponent) {
  return function ApiRecordTableSection(props) {
    return (
      <DefaultComponent {...props} table={Object.assign({}, props.table, {
        displayName: (
          <span>
            {props.table.displayName}
            <Link
              style={{
                fontSize: '.8em',
                fontWeight: 'normal',
                marginLeft: '1em'
              }}
              onClick={stopPropagation}
              to={{
                pathname: 'search/dataset/DatasetsByReferenceName/result',
                query: {
                  record_class: props.record.recordClassName,
                  reference_name: props.table.name
                }
              }}
            ><i className="fa fa-database"/> Data sets</Link>
          </span>
        )
      })}/>
    );
  }
}

export function RecordAttribute(DefaultComponent) {
  return function ApiRecordAttribute(props) {
    let { attribute, record } = props;
    if (record.attributes[attribute.name] == null) return <DefaultComponent {...props}/>;
    let ResolvedComponent =
      findComponent('RecordAttribute', props.recordClass.name) || DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
  };
}

export function RecordAttributeSection(DefaultComponent) {
  return function ApiRecordAttributeSection(props) {
    let { attribute, record } = props;

    // render attribute as a GbrowseContext if attribute name is in Gbrowse.contextx
    let context = Gbrowse.contexts.find(context => context.gbrowse_url === attribute.name);
    if (context != null) {
      return (
        <CollapsibleSection
          id={attribute.name}
          className="eupathdb-GbrowseContext"
          style={{display: 'block', width: '100%' }}
          headerContent={attribute.displayName}
          isCollapsed={props.isCollapsed}
          onCollapsedChange={props.onCollapsedChange}
        >
          <Gbrowse.GbrowseContext {...props} context={context} />
        </CollapsibleSection>
      );
    }

    // Render attribute as a Sequence if attribute name ends with "sequence".
    let sequenceRE = /sequence$/;
    if (sequenceRE.test(attribute.name)) {
      return ( <Sequence sequence={record.attributes[attribute.name]}/> );
    }

    // use standard record class overriding
    let ResolvedComponent =
      findComponent('RecordAttributeSection', props.recordClass.name) || DefaultComponent;
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
export function PrimaryKeySpan() {
  return function(props) {
    let pkValues = props.primaryKeyString.split(',');
    let newPkString = pkValues[0];
    for (let i = 1; i < pkValues.length - 1; i++) {
      newPkString += ", " + pkValues[i];
    }
    return ( <span>{newPkString}</span> );
  };
}
