import React from 'react';
import { projectId } from './config';
import { CollapsibleSection, Link } from 'wdk-client/Components';
import { makeDynamicWrapper, findComponent } from './components/records';
import * as Gbrowse from './components/common/Gbrowse';
import Sequence from './components/common/Sequence';
import ApiApplicationSpecificProperties from './components/ApiApplicationSpecificProperties';
import RecordTableContainer from './components/common/RecordTableContainer';
import { loadBasketCounts } from 'eupathdb/wdkCustomization/js/client/actioncreators/GlobalActionCreators';

const stopPropagation = event => event.stopPropagation();

// Project id is not needed for these record classes.
// Matches urlSegment.
const RECORD_CLASSES_WITHOUT_PROJECT_ID = [ 'dataset', 'genomic-sequence', 'sample' ];

const projectRegExp = new RegExp('/' + projectId + '$');

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
 * ViewController mixin that adds the primary key to the url if omitted.
 */
function addProjectIdPkValueMixin(BaseController) {
  return class ProjectIdFixer extends BaseController {
    loadData(actionCreators, state, props, previousProps) {
      if (projectRegExp.test(props.location.pathname)) {
        // Remove projectId from the url. This is like a redirect.
        props.router.replace(props.location.pathname.replace(projectRegExp, ''));
      }
      else {
        // Add projectId back to props and call super's loadData
        let newProps = addProjectIdPkValue(props);
        super.loadData(actionCreators, state, newProps, previousProps);
      }
    }
  }
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
  return class ApiRecordController extends addProjectIdPkValueMixin(WdkRecordController) {
    getActionCreators() {
      let wdkActionCreators = super.getActionCreators();
      return Object.assign({}, wdkActionCreators, {
        updateBasketStatus: (...args) => (dispatch) => {
          dispatch(wdkActionCreators.updateBasketStatus(...args))
            .then(() => dispatch(loadBasketCounts()));
        }
      })
    }
  };
}

export const DownloadFormController = addProjectIdPkValueMixin;
export const RecordHeading = makeDynamicWrapper('RecordHeading');
export const RecordUI = makeDynamicWrapper('RecordUI');
export const RecordMainSection = makeDynamicWrapper('RecordMainSection');
export const RecordTable = makeDynamicWrapper('RecordTable', RecordTableContainer);

/** Remove project_id from record links */
export function RecordLink(WdkRecordLink) {
  return function ApiRecordLink(props) {
    let recordId = props.recordId.filter(p => p.name !== 'project_id');
    return (
      <WdkRecordLink {...props} recordId={recordId}/>
    );
  };
}

export function RecordTableSection(DefaultComponent) {
  return function ApiRecordTableSection(props) {
    if (props.recordClass.name === 'DatasetRecordClasses.DatasetRecordClass') {
      return (
        <DefaultComponent {...props}/>
      );
    }

    let customName = `Data sets used by ${String.fromCharCode(8220)}${props.table.displayName.replace('/','-')}${String.fromCharCode(8221)}`
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
                pathname: `search/dataset/DatasetsByReferenceName:${customName}/result`,
                query: {
                  record_class: props.record.recordClassName,
                  reference_name: props.table.name,
                  taxon: props.record.attributes.organism_full
                }
              }}
            ><i className="fa fa-database"/> Data sets</Link>
          </span>
        )
      })}/>
    );
  }
}

export const RecordAttribute = makeDynamicWrapper('RecordAttribute',
  function MaybeDyamicWrapper(props) {
    let { attribute, record, DefaultComponent } = props;
    return record.attributes[attribute.name] == null
      ? <DefaultComponent {...props} />
      : props.children;
  }
);

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
