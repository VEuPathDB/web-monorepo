import { isEqual } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import Cookies from 'js-cookie';
import QueryString from 'querystring';
import { emptyAction } from 'wdk-client/Core/WdkMiddleware';
import { projectId } from 'ebrc-client/config';
import { CollapsibleSection, Link } from 'wdk-client/Components';
import { useProjectUrls } from 'ebrc-client/hooks/projectUrls';
import { submitAsForm } from 'wdk-client/Utils/FormSubmitter';
import { makeDynamicWrapper, findComponent } from './components/records';
import * as Gbrowse from './components/common/Gbrowse';
import Sequence from './components/common/Sequence';
import ApiApplicationSpecificProperties from './components/ApiApplicationSpecificProperties';
import RecordTableContainer from './components/common/RecordTableContainer';
import { loadPathwayGeneDynamicCols } from './actioncreators/RecordViewActionCreators';
import ApiSiteHeader from './components/SiteHeader';
import OrganismFilter from './components/OrganismFilter';
import newFeatureImage from 'wdk-client/Core/Style/images/new-feature.png';
import { useScrollUpOnRouteChange } from 'wdk-client/Hooks/Page';
import { getSingleRecordAnswerSpec } from 'wdk-client/Utils/WdkModel';

import { BinaryOperationsContext } from 'wdk-client/Utils/Operations';
import { apiBinaryOperations } from './components/strategies/ApiBinaryOperations';
import { StepDetailsActionContext } from 'wdk-client/Views/Strategy/StepDetailsDialog';
import { apiActions } from './components/strategies/ApiStepDetailsActions';

import { VEuPathDBHomePage } from './components/homepage/VEuPathDBHomePage';

export const SiteHeader = () => ApiSiteHeader;

const stopPropagation = event => event.stopPropagation();

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
  const enhance = connect(
    state => ({ globalData: state.globalData }),
    { loadPathwayGeneDynamicCols }
  );
  class ApiRecordController extends WdkRecordController {
    getRecordRequestOptions(recordClass, categoryTree) {
      // append MetaTable to initial request options
      const requestOptions = super.getRecordRequestOptions(recordClass, categoryTree);
      if (recordClass.urlSegment !== 'gene') return requestOptions;
      // TODO We should be explicit here and not rely on what super returns
      return [
        {
          attributes: requestOptions[0].attributes,
          tables: requestOptions[0].tables
            .concat(['MetaTable'])
            .concat('TranscriptionSummary' in recordClass.tablesMap ? ['TranscriptionSummary'] : [])
            .concat('PhenotypeGraphs' in recordClass.tablesMap ? ['PhenotypeGraphs'] : [])
            .concat('CrisprPhenotypeGraphs' in recordClass.tablesMap ? ['CrisprPhenotypeGraphs'] : [])
            .concat('FungiOrgLinkoutsTable' in recordClass.attributesMap ? ['FungiOrgLinkoutsTable'] : [])
        }
      ]
    }
    loadData(prevProps) {
      super.loadData(prevProps);
      // special loading for Pathways- if gene step ID (i.e. the step passed to
      // a genes->pathways transform that produced a result that contained this
      // record) is present, load dynamic attributes of that step for all genes
      // relevant to this pathway that were also in that result
      let { recordClass, primaryKey } = this.props.ownProps;
      if (recordClass == 'pathway' && !isEqual(this.props.ownProps, prevProps && prevProps.ownProps)) {
        let [ pathwaySource, pathwayId ] = primaryKey.split('/');
        let geneStepId = QueryString.parse(this.props.globalData.location.search.slice(1)).geneStepId;
        let exactMatchOnly = QueryString.parse(this.props.globalData.location.search.slice(1)).exact_match_only;
        let excludeIncompleteEc = QueryString.parse(this.props.globalData.location.search.slice(1)).exclude_incomplete_ec;
        this.props.loadPathwayGeneDynamicCols(geneStepId, pathwaySource, pathwayId, exactMatchOnly, excludeIncompleteEc);
      }
    }
  }
  return enhance(ApiRecordController);
}

export const RecordHeading = makeDynamicWrapper('RecordHeading');
export const RecordUI = makeDynamicWrapper('RecordUI');
export const RecordMainSection = makeDynamicWrapper('RecordMainSection');
export const RecordTable = makeDynamicWrapper('RecordTable', RecordTableContainer);
export const RecordTableDescription = makeDynamicWrapper('RecordTableDescription');
export const ResultTable = makeDynamicWrapper('ResultTable');
export const ResultPanelHeader = makeDynamicWrapper('ResultPanelHeader');

const RecordClassSpecificRecordlink = makeDynamicWrapper('RecordLink');

/** Remove project_id from record links */
export function RecordLink(WdkRecordLink) {
  const isPortal = projectId === 'EuPathDB';
  const ResolvedRecordLink = RecordClassSpecificRecordlink(makePortalRecordLink(WdkRecordLink));
  return function ApiRecordLink(props) {
    let recordId = isPortal ? props.recordId : props.recordId.filter(p => p.name !== 'project_id');
    return (
      <ResolvedRecordLink {...props} recordId={recordId}/>
    );
  };
}

function makePortalRecordLink(WdkRecordLink) {
  if (projectId !== 'EuPathDB') return WdkRecordLink;
  return function PortalRecordLink(props) {
    const { recordId, recordClass } = props;
    const projectIdPart = recordId.find(part => part.name === 'project_id');
    const projectUrls = useProjectUrls();

    if (projectUrls == null || projectIdPart == null || projectIdPart.value === 'EuPathDB' || projectUrls[projectIdPart.value] == null ) return <WdkRecordLink {...props}/>;

    const baseUrl = projectUrls[projectIdPart.value];
    const pkValues = recordId.filter(p => p.name !== 'project_id').map(p => p.value).join('/');
    const url = new URL(`app/record/${recordClass.urlSegment}/${pkValues}`, baseUrl);
    return (
      <a href={url} target="_blank">{props.children}</a>
    );
  }
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
  return connect(null, { downloadRecordTable })(class ApiRecordTableSection extends React.PureComponent {
    render () {
      if (this.props.recordClass.fullName === 'DatasetRecordClasses.DatasetRecordClass') {
        return (
          <DefaultComponent {...this.props}/>
        );
      }

      let { table, record, downloadRecordTable, ontologyProperties } = this.props;
      let customName = `Data Sets used to generate ${String.fromCharCode(8220)}${table.displayName.replace('/','-')}${String.fromCharCode(8221)}`
      let callDownloadTable = event => {
        event.stopPropagation();
        downloadRecordTable(record, table.name);
      };

      // FIXME Revise this since we now lazy load tables...
      let showDownload = (
        record.tables[table.name] &&
        record.tables[table.name].length > 0 &&
        ontologyProperties.scope.includes('download')
      );


        let hideDatasetLinkFromProperty = (
            record.tables[table.name] &&
            table.properties.hideDatasetLink &&
            table.properties.hideDatasetLink[0].toLowerCase() == 'true'
        );

      let showNewFeature = (
	record.tables[table.name] &&
	table.name == 'TranscriptionSummary'
      );

      let showDatasetsLink = (
        record.tables[table.name] &&
        !table.name.startsWith("UserDatasets") &&
        !hideDatasetLinkFromProperty
      );


      var hasTaxonId = 0;
      if (record.recordClassName == 'GeneRecordClasses.GeneRecordClass' ||
          record.recordClassName == 'SequenceRecordClasses.SequenceRecordClass' ||
          record.recordClassName == 'OrganismRecordClasses.OrganismRecordClass')
      {
        hasTaxonId = 1;
      }

      return (
        <DefaultComponent {...this.props} table={Object.assign({}, table, {
          displayName: (
            <span>
              {table.displayName}
	      {showNewFeature &&
	        <img src={newFeatureImage}/>
	      }
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
              { hasTaxonId == 0 && showDatasetsLink &&
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
                    'param.record_class': record.recordClassName,
                    'param.reference_name': table.name,
                  })
                }}
              ><i className="fa fa-database"/> Data Sets</Link>}
              { hasTaxonId == 1 && showDatasetsLink &&
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
                    'param.record_class': record.recordClassName,
                    'param.reference_name': table.name,
                    'param.taxon': record.attributes.organism_full
                  })
                }}
              ><i className="fa fa-database"/> Data sets</Link>}

            </span>
          )
        })}/>
      );
    }
  });
}

export const RecordAttribute = makeDynamicWrapper('RecordAttribute',
  function MaybeDyamicWrapper(props) {
    let { attribute, record } = props;

    // Render attribute as a Sequence if attribute name ends with "sequence".
    let sequenceRE = /sequence$/;
    if (sequenceRE.test(attribute.name)) {
      return ( <Sequence sequence={record.attributes[attribute.name]}/> );
    }

    return props.children;
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

    // use standard record class overriding
    let ResolvedComponent =
      findComponent('RecordAttributeSection', props.recordClass.fullName) || DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent}/>
  };
}

/**
 * Overrides the Preferences fieldset on the User Profile/Account form from the WDK.  The WDK
 * has no application specific properties although it provides for that possibility.  The empty
 * React component placeholder is overridden with an ApiDB specific component.
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

/**
 * Action creator to create temporary result, then send result URL to galaxy
 */
function sendToGalaxy(props) {
  return ({ wdkService }) => {
    let { galaxyUrl, step, selectedReporter, formState, globalData } = props;
    Cookies.remove('GALAXY_URL', { path: globalData.siteConfig.webAppUrl });
    let formatting = {
      format: selectedReporter,
      formatConfig: formState
    };
    wdkService.getTemporaryResultUrl(step.answerSpec, formatting)
      .then(url => {
        submitAsForm({
          action: galaxyUrl,
          inputs: { URL: url }
        });
      });
    return emptyAction;
  };
}

function SendToGalaxyButton(props) {
  let galaxyUrl = Cookies.get('GALAXY_URL');
  return (!galaxyUrl ? null :
    <button className="btn" type="button" onClick={() => { props.sendToGalaxy({...props, galaxyUrl}); }}>
      Send {props.recordClass.displayNamePlural} to Galaxy
    </button>
  );
}

export function TabularReporterFormSubmitButtons(ApiTabularReporterFormSubmitButtons) {
  return connect(state => state.downloadForm, { sendToGalaxy })(
    props => (
      <div>
        <ApiTabularReporterFormSubmitButtons {...props} />
        <SendToGalaxyButton {...props} />
      </div>
    )
  );
}

export function ResultTabs(DefaultComponent) {
  return function ApiResultTabs(props) {
    return (
      <div style={{ display: "flex", paddingTop: "1em", alignItems: "stretch" }}>
        <OrganismFilter {...props}/>
        <div style={{ flex: 1, overflow: 'auto' }}><DefaultComponent {...props}/></div>
      </div>
    );
  };
}

export function StrategyWorkspaceController(DefaultComponent) {
  return function ApiStrategyWorkspaceController(props) {
    return (
      <BinaryOperationsContext.Provider value={apiBinaryOperations}>
        <StepDetailsActionContext.Provider value={apiActions}>
          <DefaultComponent {...props} />
        </StepDetailsActionContext.Provider>
      </BinaryOperationsContext.Provider>
    );
  }
}

export function Page() {
  return function VuPathDBPage(props) {
    useScrollUpOnRouteChange();

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return <VEuPathDBHomePage {...props} isHomePage={isHomePage} />;
  };
}
