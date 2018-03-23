import React from 'react';
import QueryString from 'querystring';
import { emptyAction } from 'wdk-client/ActionCreatorUtils';
import { CollapsibleSection, Link } from 'wdk-client/Components';
import { getSingleRecordAnswerSpec } from 'wdk-client/WdkModel';
// import { loadBasketCounts } from 'ebrc-client/actioncreators/GlobalActionCreators';
import { withActions } from 'ebrc-client/util/component';
import { projectId } from './config';
import { makeDynamicWrapper, findComponent } from './components/records';
import * as Gbrowse from './components/common/Gbrowse';
import Sequence from './components/common/Sequence';
import ApiApplicationSpecificProperties from './components/ApiApplicationSpecificProperties';
import RecordTableContainer from './components/common/RecordTableContainer';
import { loadPathwayGeneDynamicCols } from './actioncreators/RecordViewActionCreators';

const stopPropagation = event => event.stopPropagation();

// Project id is not needed for these record classes.
// Matches urlSegment.
const RECORD_CLASSES_WITHOUT_PROJECT_ID = [ 'dataset', 'genomic-sequence', 'sample' ];

const projectRegExp = new RegExp('/' + projectId + '$');

/**
 * Adds projectId primary key record to primaryKey of props for pages referencing
 * a single record.  If recordclass of that record does not include the
 * projectId as a PK value, props are returned unchanged.
 */
function addProjectIdPkValue(props) {
  let { primaryKey, recordClass } = props.match.params;

  // These record classes do not need the project id as a part of the primary key
  // so we just render with the url params as-is.
  if (RECORD_CLASSES_WITHOUT_PROJECT_ID.includes(recordClass)) {
    return props;
  }

  // Append project id to request
  let params = Object.assign({}, props.match.params, {
    primaryKey: `${primaryKey}/${projectId}`
  });

  // Create new match object with updated primaryKey segment
  let match = Object.assign({}, props.match, { params });

  // reassign props to modified props object
  return Object.assign({}, props, { match });
}

/**
 * ViewController mixin that adds the primary key to the url if omitted.
 */
function addProjectIdPkValueWrapper(InnerComponent) {
  return class ProjectIdFixer extends React.Component {
    componentDidMount() {
      this.removeProjectId(this.props);
    }
    componentWillReceiveProps(nextProps) {
      this.removeProjectId(nextProps);
    }
    removeProjectId(props) {
      if (projectRegExp.test(props.location.pathname)) {
        // Remove projectId from the url. This is like a redirect.
        props.history.replace(props.location.pathname.replace(projectRegExp, ''));
      }
    }
    render() {
      // Add projectId back to props and call super's loadData
      const props = projectRegExp.test(this.props.location.pathname) ?
        this.props : addProjectIdPkValue(this.props);
      return (
        <InnerComponent {...props} />
      )
    }
  }
}

/**
 * In ./routes.js, we redirect urls to the record page that have the project ID
 * included such that the project ID is removed. In this component, we add it
 * back for record classes that use project ID as a part of the primary key.
 * The objective is to hide the project ID from the URL whenever possible.
 *
 * `primaryKey` refers to a wildcard dynamic url segment
 * as defined by the record route. The value of primaryKey is essentially primary key
 * values separated by a '/'.
 */
export function RecordController(WdkRecordController) {
  class ApiRecordController extends WdkRecordController {
    getActionCreators() {
      let wdkActionCreators = super.getActionCreators();
      return Object.assign({}, wdkActionCreators, {

        // FIXME Move to epic
        // updateBasketStatus: (...args) => (dispatch) => {
        //   dispatch(wdkActionCreators.updateBasketStatus(...args))
        //     .then(() => dispatch(loadBasketCounts()));
        // },

        loadPathwayGeneDynamicCols: (geneStepId, pathwaySource, pathwayId) =>
          ({ wdkService }) => loadPathwayGeneDynamicCols(geneStepId, pathwaySource, pathwayId, wdkService)
      });
    }
    loadData(prevProps) {
       super.loadData(prevProps);
       // special loading for Pathways- if gene step ID (i.e. the step passed to
       // a genes->pathways transform that produced a result that contained this
       // record) is present, load dynamic attributes of that step for all genes
       // relevant to this pathway that were also in that result
       let { recordClass, primaryKey } = this.props.match.params;
       if (recordClass == 'pathway') {
         let [ pathwaySource, pathwayId ] = primaryKey.split('/');
         let geneStepId = QueryString.parse(this.state.globalData.location.search.slice(1)).geneStepId;
         this.eventHandlers.loadPathwayGeneDynamicCols(geneStepId, pathwaySource, pathwayId);
       }
    }
  }
  return addProjectIdPkValueWrapper(ApiRecordController);
}

export const DownloadFormController = addProjectIdPkValueWrapper;
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

function downloadRecordTable(record, tableName) {
  return ({ wdkService }) => {
    let answerSpec = getSingleRecordAnswerSpec(record);
    let formatting = {
      format: 'tableTabular',
      formatConfig: {
        tables: [ tableName ],
        includeHeader: true,
        attachmentType: "text"
      }
    };
    wdkService.downloadAnswer({ answerSpec, formatting });
    return emptyAction;
  };
}

export function RecordTableSection(DefaultComponent) {
  return withActions({ downloadRecordTable })(function ApiRecordTableSection(props) {
    if (props.recordClass.name === 'DatasetRecordClasses.DatasetRecordClass') {
      return (
        <DefaultComponent {...props}/>
      );
    }

    let { table, record, downloadRecordTable, ontologyProperties } = props;
    let customName = `Data sets used by ${String.fromCharCode(8220)}${table.displayName.replace('/','-')}${String.fromCharCode(8221)}`
    let callDownloadTable = event => {
      event.stopPropagation();
      downloadRecordTable(record, table.name);
    };

    let showDownload = (
      record.tables[table.name] &&
      record.tables[table.name].length > 0 &&
      ontologyProperties.scope.includes('download')
    );

    var hasTaxonId = 0; 
    if (record.recordClassName == 'GeneRecordClasses.GeneRecordClass' ||
        record.recordClassName == 'SequenceRecordClasses.SequenceRecordClass' ||
        record.recordClassName == 'OrganismRecordClasses.OrganismRecordClass')
    {
      hasTaxonId = 1;
    }

    return (
      <DefaultComponent {...props} table={Object.assign({}, table, {
        displayName: (
          <span>
            {table.displayName}
            {showDownload &&
              <span
                style={{
                  fontSize: '.8em',
                  fontWeight: 'normal',
                  marginLeft: '1em'
                }}>
                <button type="button"
                  className="wdk-Link"
                  onClick={callDownloadTable}>
                  <i className="fa fa-download"/> Download
                </button>
              </span>
            }
            { hasTaxonId == 0 &&
            <Link
              style={{
                fontSize: '.8em',
                fontWeight: 'normal',
                marginLeft: '1em'
              }}
              onClick={stopPropagation}
              to={{
                pathname: `/search/dataset/DatasetsByReferenceNameNoTaxon:${customName}/result`,
                search: QueryString.stringify({
                  record_class: record.recordClassName,
                  reference_name: table.name,
                })
              }}
            ><i className="fa fa-database"/> Data sets</Link>}
            { hasTaxonId == 1 &&
            <Link
              style={{
                fontSize: '.8em',
                fontWeight: 'normal',
                marginLeft: '1em'
              }}
              onClick={stopPropagation}
              to={{
                pathname: `/search/dataset/DatasetsByReferenceName:${customName}/result`,
                search: QueryString.stringify({
                  record_class: record.recordClassName,
                  reference_name: table.name,
                  taxon: record.attributes.organism_full
                })
              }}
            ><i className="fa fa-database"/> Data sets</Link>}

          </span>
        )
      })}/>
    );
  });
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
          className="wdk-RecordAttributeSectionItem"
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
