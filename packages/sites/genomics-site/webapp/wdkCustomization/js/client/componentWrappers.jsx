import { isEqual } from 'lodash';
import React, { cloneElement } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { RecoilRoot } from 'recoil';
import QueryString from 'querystring';
import { emptyAction } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';
import { projectId } from '@veupathdb/web-common/lib/config';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { useProjectUrls } from '@veupathdb/web-common/lib/hooks/projectUrls';
import { submitAsForm } from '@veupathdb/wdk-client/lib/Utils/FormSubmitter';
import { makeDynamicWrapper, findComponent } from './components/records';
import * as Gbrowse from './components/common/Gbrowse';
import Sequence from '@veupathdb/web-common/lib/components/records/Sequence';
import RecordTableContainer from './components/common/RecordTableContainer';
import { loadPathwayGeneDynamicCols } from './actioncreators/RecordViewActionCreators';
import ApiSiteHeader from './components/SiteHeader';
import OrganismFilter from './components/OrganismFilter';
import { useScrollUpOnRouteChange } from '@veupathdb/wdk-client/lib/Hooks/Page';
import { getSingleRecordAnswerSpec } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { BinaryOperationsContext } from '@veupathdb/wdk-client/lib/Utils/Operations';
import { apiBinaryOperations } from './components/strategies/ApiBinaryOperations';
import { StepDetailsActionContext } from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetailsDialog';
import { apiActions } from './components/strategies/ApiStepDetailsActions';

import { VEuPathDBHomePage } from './components/homepage/VEuPathDBHomePage';
import { BlockRecordAttributeSection } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';

import './record-page-new-feature.scss';

import UIThemeProvider from '@veupathdb/coreui/dist/components/theming/UIThemeProvider';
import { colors } from '@veupathdb/coreui';

export const SiteHeader = () => ApiSiteHeader;

const stopPropagation = (event) => event.stopPropagation();

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
  const enhance = connect((state) => ({ globalData: state.globalData }), {
    loadPathwayGeneDynamicCols,
  });
  class ApiRecordController extends WdkRecordController {
    getRecordRequestOptions(recordClass, categoryTree) {
      // as necessary, append tables to initial request options
      // TODO We should be explicit here and not rely on what super returns
      const requestOptions = super.getRecordRequestOptions(
        recordClass,
        categoryTree
      );
      if (
        recordClass.urlSegment !== 'gene' &&
        recordClass.urlSegment !== 'dataset'
      )
        return requestOptions;

      // Dataset records
      if (recordClass.urlSegment === 'dataset') {
        return [
          {
            attributes: requestOptions[0].attributes,
            tables: requestOptions[0].tables.concat(['Version']),
          },
        ];
      }

      // Gene records
      return [
        {
          attributes: requestOptions[0].attributes,
          tables: requestOptions[0].tables
            .concat(['MetaTable'])
            .concat(
              'TranscriptionSummary' in recordClass.tablesMap
                ? ['TranscriptionSummary']
                : []
            )
            .concat(
              'ExpressionGraphs' in recordClass.tablesMap
                ? ['ExpressionGraphs']
                : []
            )
            .concat(
              'PhenotypeGraphs' in recordClass.tablesMap
                ? ['PhenotypeGraphs']
                : []
            )
            .concat(
              'CrisprPhenotypeGraphs' in recordClass.tablesMap
                ? ['CrisprPhenotypeGraphs']
                : []
            )
            .concat(
              'FungiVBOrgLinkoutsTable' in recordClass.tablesMap
                ? ['FungiVBOrgLinkoutsTable']
                : []
            ),
        },
      ];
    }
    loadData(prevProps) {
      super.loadData(prevProps);
      // special loading for Pathways- if gene step ID (i.e. the step passed to
      // a genes->pathways transform that produced a result that contained this
      // record) is present, load dynamic attributes of that step for all genes
      // relevant to this pathway that were also in that result
      let { recordClass, primaryKey } = this.props.ownProps;
      if (
        recordClass == 'pathway' &&
        !isEqual(this.props.ownProps, prevProps && prevProps.ownProps)
      ) {
        let [pathwaySource, pathwayId] = primaryKey.split('/');
        let geneStepId = QueryString.parse(
          this.props.globalData.location.search.slice(1)
        ).geneStepId;
        let exactMatchOnly = QueryString.parse(
          this.props.globalData.location.search.slice(1)
        ).exact_match_only;
        let excludeIncompleteEc = QueryString.parse(
          this.props.globalData.location.search.slice(1)
        ).exclude_incomplete_ec;
        this.props.loadPathwayGeneDynamicCols(
          geneStepId,
          pathwaySource,
          pathwayId,
          exactMatchOnly,
          excludeIncompleteEc
        );
      }
    }
  }
  return enhance(ApiRecordController);
}

function EnhancedRecordUIContainer(props) {
  return cloneElement(props.children, { bottomOffset: 100 });
}

export const RecordHeading = makeDynamicWrapper('RecordHeading');
export const RecordUI = makeDynamicWrapper(
  'RecordUI',
  EnhancedRecordUIContainer
);
export const RecordMainSection = makeDynamicWrapper('RecordMainSection');
export const RecordTable = makeDynamicWrapper(
  'RecordTable',
  RecordTableContainer
);
export const RecordTableDescription = makeDynamicWrapper(
  'RecordTableDescription'
);
export const ResultTable = makeDynamicWrapper('ResultTable');
export const ResultPanelHeader = makeDynamicWrapper('ResultPanelHeader');

const RecordClassSpecificRecordlink = makeDynamicWrapper('RecordLink');

/** Remove project_id from record links */
export function RecordLink(WdkRecordLink) {
  const isPortal = projectId === 'EuPathDB';
  const ResolvedRecordLink = RecordClassSpecificRecordlink(
    makePortalRecordLink(WdkRecordLink)
  );
  return function ApiRecordLink(props) {
    let recordId = isPortal
      ? props.recordId
      : props.recordId.filter((p) => p.name !== 'project_id');
    return <ResolvedRecordLink {...props} recordId={recordId} />;
  };
}

function makePortalRecordLink(WdkRecordLink) {
  if (projectId !== 'EuPathDB') return WdkRecordLink;
  return function PortalRecordLink(props) {
    const { recordId, recordClass } = props;
    const projectIdPart = recordId.find((part) => part.name === 'project_id');
    const projectUrls = useProjectUrls();

    if (
      projectUrls == null ||
      projectIdPart == null ||
      projectIdPart.value === 'EuPathDB' ||
      projectUrls[projectIdPart.value] == null
    )
      return <WdkRecordLink {...props} />;

    const baseUrl = projectUrls[projectIdPart.value];
    const pkValues = recordId
      .filter((p) => p.name !== 'project_id')
      .map((p) => p.value)
      .join('/');
    const url = new URL(
      `app/record/${recordClass.urlSegment}/${pkValues}`,
      baseUrl
    );
    return (
      <a href={url} target="_blank">
        {props.children}
      </a>
    );
  };
}

function downloadRecordTable(record, tableName) {
  return ({ wdkService }) => {
    let answerSpec = getSingleRecordAnswerSpec(record);
    let formatting = {
      format: 'tableTabular',
      formatConfig: {
        tables: [tableName],
        includeHeader: true,
        attachmentType: 'text',
      },
    };
    wdkService.downloadAnswer({ answerSpec, formatting });
    return emptyAction;
  };
}

export function RecordTableSection(DefaultComponent) {
  return connect(null, { downloadRecordTable })(
    class ApiRecordTableSection extends React.PureComponent {
      render() {
        if (
          this.props.recordClass.fullName ===
          'DatasetRecordClasses.DatasetRecordClass'
        ) {
          return <DefaultComponent {...this.props} />;
        }

        let { table, record, downloadRecordTable, ontologyProperties } =
          this.props;
        let customName = `Data Sets used to generate ${String.fromCharCode(
          8220
        )}${table.displayName.replace('/', '-')}${String.fromCharCode(8221)}`;
        let callDownloadTable = (event) => {
          event.stopPropagation();
          downloadRecordTable(record, table.name);
        };

        // FIXME Revise this since we now lazy load tables...
        let showDownload =
          record.tables[table.name] &&
          record.tables[table.name].length > 0 &&
          ontologyProperties.scope.includes('download');

        let hideDatasetLinkFromProperty =
          record.tables[table.name] &&
          table.properties.hideDatasetLink &&
          table.properties.hideDatasetLink[0].toLowerCase() == 'true';

        let showDatasetsLink =
          record.tables[table.name] &&
          !table.name.startsWith('UserDatasets') &&
          !hideDatasetLinkFromProperty;

        var hasTaxonId = 0;
        if (
          record.recordClassName == 'GeneRecordClasses.GeneRecordClass' ||
          record.recordClassName ==
            'SequenceRecordClasses.SequenceRecordClass' ||
          record.recordClassName == 'OrganismRecordClasses.OrganismRecordClass'
        ) {
          hasTaxonId = 1;
        }

        const title = (
          <span>
            {table.displayName}{' '}
            {showDownload && (
              <span
                style={{
                  fontSize: '.8em',
                  fontWeight: 'normal',
                  marginLeft: '1em',
                }}
              >
                <button
                  type="button"
                  className="wdk-Link"
                  onClick={callDownloadTable}
                >
                  <i className="fa fa-download" /> Download
                </button>
              </span>
            )}
            {hasTaxonId == 0 && showDatasetsLink && (
              <Link
                style={{
                  fontSize: '.8em',
                  fontWeight: 'normal',
                  marginLeft: '1em',
                }}
                onClick={stopPropagation}
                to={{
                  pathname: `/search/dataset/DatasetsByReferenceNameNoTaxon:${customName}/result`,
                  search: QueryString.stringify({
                    'param.record_class': record.recordClassName,
                    'param.reference_name': table.name,
                  }),
                }}
              >
                <i className="fa fa-database" /> Data Sets
              </Link>
            )}
            {hasTaxonId == 1 && showDatasetsLink && (
              <Link
                style={{
                  fontSize: '.8em',
                  fontWeight: 'normal',
                  marginLeft: '1em',
                }}
                onClick={stopPropagation}
                to={{
                  pathname: `/search/dataset/DatasetsByReferenceName:${customName}/result`,
                  search: QueryString.stringify({
                    'param.record_class': record.recordClassName,
                    'param.reference_name': table.name,
                    'param.taxon': record.attributes.organism_full,
                  }),
                }}
              >
                <i className="fa fa-database" /> Data sets
              </Link>
            )}
          </span>
        );

        return <DefaultComponent {...this.props} title={title} />;
      }
    }
  );
}

function getGbrowseContext(attributeName) {
  return Gbrowse.contexts.find(
    (context) => context.gbrowse_url === attributeName
  );
}

export const RecordAttribute = makeDynamicWrapper(
  'RecordAttribute',
  function MaybeDyamicWrapper(props) {
    const { attribute, record } = props;

    const context = getGbrowseContext(attribute.name);

    if (context) {
      return <Gbrowse.GbrowseContext {...props} context={context} />;
    }

    // Render attribute as a Sequence if attribute name ends with "sequence".
    let sequenceRE = /sequence$/;
    if (sequenceRE.test(attribute.name)) {
      return <Sequence sequence={record.attributes[attribute.name]} />;
    }

    return props.children;
  }
);

export function RecordAttributeSection(DefaultComponent) {
  return function ApiRecordAttributeSection(props) {
    const { attribute, record } = props;
    const context = getGbrowseContext(attribute.name);

    if (context) {
      return <BlockRecordAttributeSection {...props} />;
    }

    // use standard record class overriding
    let ResolvedComponent =
      findComponent('RecordAttributeSection', props.recordClass.fullName) ||
      DefaultComponent;
    return <ResolvedComponent {...props} DefaultComponent={DefaultComponent} />;
  };
}

/**
 * Trims PROJECT_ID off the tail end of a comma-delimited list of primary key value parts
 */
export function PrimaryKeySpan() {
  return function (props) {
    let pkValues = props.primaryKeyString.split(',');
    let newPkString = pkValues[0];
    for (let i = 1; i < pkValues.length - 1; i++) {
      newPkString += ', ' + pkValues[i];
    }
    return <span>{newPkString}</span>;
  };
}

/**
 * Action creator to create temporary result, then send result URL to galaxy
 */
function sendToGalaxy(props) {
  return ({ wdkService }) => {
    let { galaxyUrl, resultType, selectedReporter, formState } = props;
    wdkService
      .getTemporaryResultPath(resultType.step, selectedReporter, formState)
      .then((path) => {
        const url = new URL(wdkService.serviceUrl + path, window.location);
        submitAsForm({
          target: '_new',
          action: galaxyUrl,
          inputs: { URL: url.toString() },
        });
      });
    return emptyAction;
  };
}

function SendToGalaxyButton(props) {
  const [galaxyUrl, setGalaxyUrl] = React.useState(null);
  React.useEffect(() => {
    setGalaxyUrl(sessionStorage.getItem('galaxyUrl'));
  });
  return !galaxyUrl ? null : (
    <button
      className="btn"
      type="button"
      onClick={() => {
        props.sendToGalaxy({ ...props, galaxyUrl });
      }}
    >
      Send {props.recordClass.displayNamePlural} to Galaxy
    </button>
  );
}

export function TabularReporterFormSubmitButtons(
  ApiTabularReporterFormSubmitButtons
) {
  return connect(
    (state) =>
      Object.assign({}, state.downloadForm, {
        webAppUrl: state.globalData.siteConfig.webAppUrl,
      }),
    { sendToGalaxy }
  )((props) => (
    <div>
      <ApiTabularReporterFormSubmitButtons {...props} />
      <SendToGalaxyButton {...props} />
    </div>
  ));
}

export function ResultTabs(DefaultComponent) {
  return function ApiResultTabs(props) {
    return (
      <div
        style={{ display: 'flex', paddingTop: '1em', alignItems: 'stretch' }}
      >
        <OrganismFilter {...props} />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <DefaultComponent {...props} />
        </div>
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
  };
}

export function Page() {
  return function VuPathDBPage(props) {
    useScrollUpOnRouteChange();

    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const params = new URLSearchParams(location.search);
    const galaxyUrl = params.get('galaxy_url');

    React.useEffect(() => {
      if (galaxyUrl != null) sessionStorage.setItem('galaxyUrl', galaxyUrl);
    }, [galaxyUrl]);

    return (
      <RecoilRoot>
        <UIThemeProvider
          theme={{
            palette: {
              primary: { hue: colors.gray, level: 100 },
              secondary: { hue: colors.mutedRed, level: 500 },
            },
          }}
        >
          <VEuPathDBHomePage {...props} isHomePage={isHomePage} />
        </UIThemeProvider>
      </RecoilRoot>
    );
  };
}

export { SiteSearchInput } from './component-wrappers/SiteSearchInput';

export { AnswerController } from './component-wrappers/AnswerController';
