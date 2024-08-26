import { isEqual } from 'lodash';
import React from 'react';
import { httpGet } from '../util/http';
import {
  CollapsibleSection,
  Loading,
  Link,
} from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import ExternalResource from './ExternalResource';
import { JbrowseIframe } from './JbrowseIframe';

/**
 * Renders an Dataset graph with the provided rowData.
 * rowData comes from an ExpressionTable record table.
 *
 * rowData will include the available gene ids (graph_ids), but the available
 * graphs for the dataset (visible_parts) has to be fetched from dataPlotter.pl.
 * This means that when we get new rowData, we first have to make a request for
 * the available graphs, and then we can update the state of the Component. This
 * flow will ensure that we have a consistent state when rendering.
 */
export default class DatasetGraph extends React.PureComponent {
  constructor(...args) {
    super(...args);
    let graphIds = this.props.rowData.graph_ids.split(/\s*,\s*/);
    this.state = {
      loading: true,
      imgError: false,
      // array of graph info: [{width:200, height:300, visible_part: "somepart"}, ...]
      graphs: null,
      // array of indexes of graphs to display
      visibleGraphs: [],
      descriptionCollapsed: true,
      dataTableCollapsed: true,
      coverageCollapsed: true,
      wgcnaCollapsed: true,
      showLogScale: this.props.rowData.assay_type == 'RNA-Seq' ? false : true,
      showSpecialGraph: this.props.rowData.has_special_jbrowse,
      graphId: graphIds[0],
      contXAxis: 'na',
      facet: 'na',
    };

    this.handleDescriptionCollapseChange = (descriptionCollapsed) => {
      this.setState({ descriptionCollapsed });
    };
    this.handleDataTableCollapseChange = (dataTableCollapsed) => {
      this.setState({ dataTableCollapsed });
    };
    this.handleCoverageCollapseChange = (coverageCollapsed) => {
      this.setState({ coverageCollapsed });
    };
    this.handleWGCNACollapseChange = (wgcnaCollapsed) => {
      this.setState({ wgcnaCollapsed });
    };
  }

  componentDidMount() {
    this.getGraphParts(this.props);
  }

  componentWillUnmount() {
    this.request.abort();
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.rowData, nextProps.rowData)) {
      this.request.abort();
      this.getGraphParts(nextProps);
    }
  }

  makeBaseUrl({ rowData }) {
    let graphIds = rowData.graph_ids.split(/\s*,\s*/);
    let graphId = this.state.graphId || graphIds[0];
    let project_id_url = rowData.project_id_url || rowData.project_id;
    return (
      '/cgi-bin/dataPlotter.pl?' +
      'type=' +
      rowData.module +
      '&' +
      'project_id=' +
      project_id_url +
      '&' +
      'datasetId=' +
      rowData.dataset_id +
      '&' +
      'template=' +
      (rowData.is_graph_custom === 'false' ? 1 : 0) +
      '&' +
      'id=' +
      graphId
    );
  }

  makeDatasetUrl({ rowData }, isUserDataset) {
    if (isUserDataset) {
      return '/a/app/workspace/datasets/' + rowData.dataset_id;
    }
    return '../dataset/' + rowData.dataset_id;
  }

  makeTutorialUrl(/* { rowData } */) {
    return '../../../../documents/FromCoverageNonuniqueReads.pdf';
  }

  getGraphParts(props) {
    let baseUrl = this.makeBaseUrl(props);
    this.setState({ loading: true });
    this.request = httpGet(baseUrl + '&declareParts=1');
    this.request.promise().then((graphs) => {
      if (graphs) {
        this.setState({ graphs, visibleGraphs: [0], loading: false });
      }
    });
  }

  setGraphId(graphId) {
    if (this.state.graphId !== graphId) {
      this.setState({ graphId });
      this.getGraphParts(this.props);
    }
  }

  setFacet(myfacet) {
    if (this.state.facet !== myfacet) {
      this.setState({ facet: myfacet });
    }
  }

  setContXAxis(myXAxis) {
    if (this.state.contXAxis !== myXAxis) {
      this.setState({ contXAxis: myXAxis });
    }
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <div>
          <Loading radius={4} />
        </div>
      );
    }
  }

  renderImgError() {
    if (this.state.imgError) {
      return (
        <div className="eupathdb-ExpressGraphErrorMessage">
          The requested graph could not be loaded.
        </div>
      );
    }
  }

  render() {
    let {
      dataTable,
      facetMetadataTable,
      contXAxisMetadataTable,
      rowData: {
        source_id,
        assay_type,
        module,
        paralog_number,
        graph_ids,
        dataset_id,
        dataset_name,
        description,
        project_id,
        project_id_url,
        x_axis,
        y_axis,
      },
    } = this.props;

    let graphIds = graph_ids.split(/\s*,\s*/);
    let {
      graphs,
      visibleGraphs,
      showLogScale,
      graphId,
      facet,
      contXAxis,
      showSpecialGraph,
    } = this.state;

    let baseUrl = this.makeBaseUrl(this.props);
    let baseUrlWithState = `${baseUrl}&id=${graphId}&wl=${
      showLogScale ? '1' : '0'
    }`;
    let baseUrlWithMetadata = `${baseUrlWithState}&facet=${facet}&contXAxis=${contXAxis}`;
    let imgUrl = baseUrlWithMetadata + '&fmt=svg';
    // let pngUrl = baseUrlWithMetadata + '&fmt=png';
    let covImgUrl =
      dataTable &&
      dataTable.record.attributes.CoverageJbrowseIntUrl +
        '%2C' +
        dataset_name +
        '%20Density%20-%20Unique%20Only' +
        '%2C' +
        dataset_name +
        '%20XYPlot%20-%20Unique%20Only';
    let covImgJbrowseUrl =
      dataTable &&
      dataTable.record.attributes.CoverageJbrowseUrl +
        '%2C' +
        dataset_name +
        '%20Density%20-%20Unique%20Only' +
        '%2C' +
        dataset_name +
        '%20XYPlot%20-%20Unique%20Only';

    let specialImgUrl =
      dataTable && dataTable.record.attributes.specialJbrowseUrl;

    let isUserDataset = module.startsWith('UserDatasets');

    let dataset_link = this.makeDatasetUrl(this.props, isUserDataset);
    let tutorial_link = this.makeTutorialUrl(this.props);

    return (
      <div className="eupathdb-DatasetGraphContainer2">
        <div className="eupathdb-DatasetGraphContainer">
          <div className="eupathdb-DatasetGraph">
            {visibleGraphs.map((index) => {
              let { height, width, visible_part } = graphs[index];
              let fullUrl = `${imgUrl}&vp=${visible_part}`;
              return (
                <ExternalResource key={index}>
                  <object
                    style={{ height, width }}
                    data={fullUrl}
                    type="image/svg+xml"
                  />
                </ExternalResource>
              );
            })}
            {this.renderLoading()}
            {this.renderImgError()}

            {/*
hook: HostResponseGraphs
*/}
            <h4 hidden={this.props.contXAxisMetadataTable ? false : true}>
              Choose metadata category for X-axis:
            </h4>
            <select
              value={this.state.contXAxis}
              hidden={this.props.contXAxisMetadataTable ? false : true}
              onChange={(event) => this.setContXAxis(event.target.value)}
            >
              <option value="na">Select here to change from default</option>
              <option value="none">None</option>
              {this.props.contXAxisMetadataTable &&
                contXAxisMetadataTable.value
                  .filter((dat) => dat.dataset_id == dataset_id)
                  .map((xAxisRow) => {
                    return (
                      <option
                        key={xAxisRow.property_id}
                        value={xAxisRow.property_id}
                      >
                        {xAxisRow.property}
                      </option>
                    );
                  })}
            </select>

            <h4 hidden={this.props.facetMetadataTable ? false : true}>
              Choose metadata category to facet graph on:
            </h4>
            <select
              value={this.state.facet}
              hidden={this.props.facetMetadataTable ? false : true}
              onChange={(event) => this.setFacet(event.target.value)}
            >
              <option value="na">Select here to change from default</option>
              <option value="none">None</option>
              {this.props.facetMetadataTable &&
                facetMetadataTable.value
                  .filter((dat) => dat.dataset_id == dataset_id)
                  .map((facetRow) => {
                    return (
                      <option
                        key={facetRow.property_id}
                        value={facetRow.property_id}
                      >
                        {facetRow.property}
                      </option>
                    );
                  })}
            </select>

            <h4>
              <a href={dataset_link}>Full Dataset Description</a>
            </h4>

            {graphId !== source_id ? (
              <div>
                <b>
                  <font color="firebrick">WARNING</font>
                </b>
                : This Gene ({source_id} ) does not have data for this
                experiment. Instead, we are showing data for this same gene(s)
                from the reference strain for this species. This may or may NOT
                accurately represent the gene you are interested in.{' '}
              </div>
            ) : null}

            <div>
              {assay_type == 'RNA-Seq' &&
              module !== 'SpliceSites' &&
              covImgUrl &&
              !isUserDataset ? (
                <h4>
                  <a
                    href={covImgJbrowseUrl.replace(
                      '/rnaseqTracks/',
                      '/tracks/'
                    )}
                  >
                    View in genome browser
                  </a>
                </h4>
              ) : null}
            </div>

            {assay_type == 'RNA-Seq' &&
            paralog_number > 0 &&
            module !== 'SpliceSites' &&
            covImgUrl &&
            !isUserDataset ? (
              <div>
                <b>
                  <font color="firebrick">
                    Warning: This gene has {safeHtml(paralog_number, {}, 'b')}{' '}
                    paralogs!
                  </font>
                </b>
                <br></br>Please consider non-unique aligned reads in the
                expression graph and coverage plots in the genome browser (
                <a href={tutorial_link}>
                  <b>tutorial</b>
                </a>
                ).
              </div>
            ) : null}

            {assay_type == 'RNA-Seq' &&
            module !== 'SpliceSites' &&
            !isUserDataset &&
            covImgUrl ? (
              <CollapsibleSection
                id={dataset_name + 'Coverage'}
                className="eupathdb-GbrowseContext"
                headerContent="Coverage"
                headerComponent="h4"
                isCollapsed={this.state.coverageCollapsed}
                onCollapsedChange={this.handleCoverageCollapseChange}
              >
                <div>
                  Non-unique mapping may be examined in the genome browser (
                  <a href={tutorial_link}>
                    <b>tutorial</b>
                  </a>
                  )<br></br>
                  <br></br>
                </div>
                <div>
                  <JbrowseIframe jbrowseUrl={covImgUrl} height="200" />
                </div>
              </CollapsibleSection>
            ) : null}

            {assay_type == 'RNA-Seq' &&
            module !== 'SpliceSites' &&
            !isUserDataset &&
            project_id_url == 'EuPathDB' &&
            dataset_name == 'pfal3D7_Lee_Gambian_rnaSeq_RSRC' &&
            covImgUrl ? (
              <CollapsibleSection
                id={dataset_name + 'WGCNA'}
                className="eupathdb-WGCNA"
                headerContent="WGCNA search"
                headerComponent="h4"
                isCollapsed={this.state.wgcnaCollapsed}
                onCollapsedChange={this.handleWGCNACollapseChange}
              >
                <div>
                  {
                    <Link
                      target="_new"
                      to={
                        '/search/transcript/GenesByRNASeqEvidence?param.wgcna_prrofileGeneId=' +
                        source_id +
                        '#GenesByRNASeqWGCNA' +
                        dataset_name
                      }
                    >
                      Search other genes in the same module
                    </Link>
                  }
                  <br />
                  <br />
                </div>
              </CollapsibleSection>
            ) : null}

            {assay_type == 'Phenotype' &&
            showSpecialGraph == 'true' &&
            specialImgUrl ? (
              <CollapsibleSection
                id={'Special'}
                className="eupathdb-GbrowseContext"
                headerContent="View in JBrowse"
                isCollapsed={this.state.coverageCollapsed}
                onCollapsedChange={this.handleCoverageCollapseChange}
              >
                <div>
                  <a
                    href={specialImgUrl.replace(
                      '/phenotypeTracks/',
                      '/tracks/'
                    )}
                  >
                    View in genome browser
                  </a>
                </div>
                <ExternalResource>
                  <JbrowseIframe
                    jbrowseUrl={specialImgUrl.replace(
                      '/app/jbrowse',
                      '/jbrowse/index.html'
                    )}
                    height="185"
                  />
                </ExternalResource>
                <br></br>
                <br></br>
              </CollapsibleSection>
            ) : null}
          </div>

          <div className="eupathdb-DatasetGraphDetails">
            {this.props.dataTable && (
              <CollapsibleSection
                className={
                  'eupathdb-' + this.props.dataTable.table.name + 'Container'
                }
                headerContent="Data table"
                headerComponent="h4"
                isCollapsed={this.state.dataTableCollapsed}
                onCollapsedChange={this.handleDataTableCollapseChange}
              >
                <dataTable.DefaultComponent
                  record={dataTable.record}
                  recordClass={dataTable.recordClass}
                  table={dataTable.table}
                  value={dataTable.value.filter(
                    (dat) => dat.dataset_id == dataset_id
                  )}
                />
              </CollapsibleSection>
            )}

            {!isUserDataset ? (
              <CollapsibleSection
                className={'eupathdb-DatasetGraphDescription'}
                headerContent="Description"
                headerComponent="h4"
                isCollapsed={this.state.descriptionCollapsed}
                onCollapsedChange={this.handleDescriptionCollapseChange}
              >
                {safeHtml(description, {}, 'div')}
              </CollapsibleSection>
            ) : null}

            <h4>X-axis</h4>
            {safeHtml(x_axis, {}, 'div')}

            <h4>Y-axis</h4>
            {safeHtml(y_axis, {}, 'div')}

            <h4>Choose gene for which to display graph</h4>
            {graphIds.map((graphId) => {
              return (
                <label key={graphId}>
                  <input
                    type="radio"
                    checked={graphId === this.state.graphId}
                    onChange={() => this.setGraphId(graphId)}
                  />{' '}
                  {graphId}{' '}
                </label>
              );
            })}

            <h4>Choose graph(s) to display</h4>
            {graphs &&
              visibleGraphs &&
              graphs.map((graph, index) => {
                return (
                  <label key={graph.visible_part}>
                    <input
                      type="checkbox"
                      checked={visibleGraphs.includes(index)}
                      onChange={(e) =>
                        this.setState({
                          visibleGraphs: e.target.checked
                            ? visibleGraphs.concat(index)
                            : visibleGraphs.filter((i) => i !== index),
                        })
                      }
                    />{' '}
                    {graph.visible_part}{' '}
                  </label>
                );
              })}

            <h4>Graph options</h4>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showLogScale}
                  onChange={(e) =>
                    this.setState({ showLogScale: e.target.checked })
                  }
                />{' '}
                Show log Scale (not applicable for log(ratio) graphs, percentile
                graphs or data tables)
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
