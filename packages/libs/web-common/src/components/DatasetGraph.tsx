import React, { useState, useEffect, useRef, useCallback } from 'react';
import { httpGet } from '../util/http';
import {
  CollapsibleSection,
  Loading,
  Link,
} from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  RecordInstance,
  RecordClass,
  TableField,
  TableValue,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import ExternalResource from './ExternalResource';
import { JbrowseIframe } from './JbrowseIframe';
import { EdaScatterPlot } from './eda/EdaScatterPlot';

// TypeScript interfaces
interface Graph {
  width: number;
  height: number;
  visible_part: string;
}

interface RecordTableProps {
  className?: string;
  record: RecordInstance;
  recordClass: RecordClass;
  table: TableField;
  value: TableValue;
}

interface RowData {
  source_id: string;
  assay_type: string;
  module: string;
  paralog_number: number;
  graph_ids: string;
  dataset_id: string;
  dataset_name: string;
  description: string;
  project_id: string;
  project_id_url?: string;
  x_axis: string;
  y_axis: string;
  is_graph_custom: string;
  has_special_jbrowse: string;
}

interface DataTable {
  DefaultComponent: React.ComponentType<RecordTableProps>;
  record: RecordInstance;
  recordClass: RecordClass;
  table: TableField;
  value: TableValue;
}

interface MetadataTable {
  value: Array<{
    dataset_id: string;
    property_id: string;
    property: string;
  }>;
}

interface DatasetGraphProps {
  rowData: RowData;
  dataTable?: DataTable;
  facetMetadataTable?: MetadataTable;
  contXAxisMetadataTable?: MetadataTable;
}

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
const DatasetGraph: React.FC<DatasetGraphProps> = ({
  rowData,
  dataTable,
  facetMetadataTable,
  contXAxisMetadataTable,
}) => {
  const requestRef =
    useRef<{ abort: () => void; promise: () => Promise<any> } | null>(null);

  const graphIds = rowData.graph_ids.split(/\s*,\s*/);

  const [state, setState] = useState({
    loading: true,
    imgError: false,
    graphs: null as Graph[] | null,
    visibleGraphs: [] as number[],
    descriptionCollapsed: true,
    dataTableCollapsed: true,
    coverageCollapsed: true,
    wgcnaCollapsed: true,
    showLogScale: rowData.assay_type === 'RNA-Seq' ? false : true,
    showSpecialGraph: rowData.has_special_jbrowse,
    graphId: graphIds[0],
    contXAxis: 'na',
    facet: 'na',
  });

  const makeBaseUrl = useCallback(
    (currentRowData: RowData, currentGraphId: string) => {
      const currentGraphIds = currentRowData.graph_ids.split(/\s*,\s*/);
      const graphId = currentGraphId || currentGraphIds[0];
      const project_id_url =
        currentRowData.project_id_url || currentRowData.project_id;
      return (
        '/cgi-bin/dataPlotter.pl?' +
        'type=' +
        currentRowData.module +
        '&' +
        'project_id=' +
        project_id_url +
        '&' +
        'datasetId=' +
        currentRowData.dataset_id +
        '&' +
        'template=' +
        (currentRowData.is_graph_custom === 'false' ? 1 : 0) +
        '&' +
        'id=' +
        graphId
      );
    },
    []
  );

  const makeDatasetUrl = useCallback(
    (currentRowData: RowData, isUserDataset: boolean) => {
      if (isUserDataset) {
        return '/a/app/workspace/datasets/' + currentRowData.dataset_id;
      }
      return '../dataset/' + currentRowData.dataset_id;
    },
    []
  );

  const makeTutorialUrl = useCallback(() => {
    return '../../../../documents/FromCoverageNonuniqueReads.pdf';
  }, []);

  const getGraphParts = useCallback(
    (currentRowData: RowData, currentGraphId: string) => {
      const baseUrl = makeBaseUrl(currentRowData, currentGraphId);
      setState((prev) => ({ ...prev, loading: true }));

      if (requestRef.current) {
        requestRef.current.abort();
      }

      requestRef.current = httpGet(baseUrl + '&declareParts=1');
      requestRef.current.promise().then((graphs: any) => {
        let visibleGraphs = [0];
        if (typeof graphs === 'string') {
          // indicates an error from the server; log
          const error = 'Error from dataPlotter: ' + graphs;
          // FIXME: eventually we want to do:
          // useWdkService( (wdkService) => wdkService.submitError(error) );
          console.error(error);
          // graphs not available; don't break the page
          graphs = [];
          visibleGraphs = [];
        }
        setState((prev) => ({
          ...prev,
          graphs,
          visibleGraphs,
          loading: false,
        }));
      });
    },
    [makeBaseUrl]
  );

  const setGraphId = useCallback(
    (graphId: string) => {
      if (state.graphId !== graphId) {
        setState((prev) => ({ ...prev, graphId }));
        getGraphParts(rowData, graphId);
      }
    },
    [state.graphId, getGraphParts, rowData]
  );

  const setFacet = useCallback(
    (facet: string) => {
      if (state.facet !== facet) {
        setState((prev) => ({ ...prev, facet }));
      }
    },
    [state.facet]
  );

  const setContXAxis = useCallback(
    (contXAxis: string) => {
      if (state.contXAxis !== contXAxis) {
        setState((prev) => ({ ...prev, contXAxis }));
      }
    },
    [state.contXAxis]
  );

  const handleDescriptionCollapseChange = useCallback(
    (descriptionCollapsed: boolean) => {
      setState((prev) => ({ ...prev, descriptionCollapsed }));
    },
    []
  );

  const handleDataTableCollapseChange = useCallback(
    (dataTableCollapsed: boolean) => {
      setState((prev) => ({ ...prev, dataTableCollapsed }));
    },
    []
  );

  const handleCoverageCollapseChange = useCallback(
    (coverageCollapsed: boolean) => {
      setState((prev) => ({ ...prev, coverageCollapsed }));
    },
    []
  );

  const handleWGCNACollapseChange = useCallback((wgcnaCollapsed: boolean) => {
    setState((prev) => ({ ...prev, wgcnaCollapsed }));
  }, []);

  const handleVisibleGraphsChange = useCallback(
    (index: number, checked: boolean) => {
      setState((prev) => ({
        ...prev,
        visibleGraphs: checked
          ? prev.visibleGraphs.concat(index)
          : prev.visibleGraphs.filter((i) => i !== index),
      }));
    },
    []
  );

  const handleLogScaleChange = useCallback((showLogScale: boolean) => {
    setState((prev) => ({ ...prev, showLogScale }));
  }, []);

  useEffect(() => {
    getGraphParts(rowData, state.graphId);

    return () => {
      if (requestRef.current) {
        requestRef.current.abort();
      }
    };
  }, [rowData, getGraphParts, state.graphId]);

  const renderLoading = () => {
    if (state.loading) {
      return (
        <div>
          <Loading radius={4} />
        </div>
      );
    }
    return null;
  };

  const renderImgError = () => {
    if (state.imgError) {
      return (
        <div className="eupathdb-ExpressGraphErrorMessage">
          The requested graph could not be loaded.
        </div>
      );
    }
    return null;
  };

  const {
    source_id,
    assay_type,
    module,
    paralog_number,
    // unused: graph_ids,
    dataset_id,
    dataset_name,
    description,
    // unused: project_id,
    project_id_url,
    x_axis,
    y_axis,
  } = rowData;

  const {
    graphs,
    visibleGraphs,
    showLogScale,
    graphId,
    facet,
    contXAxis,
    showSpecialGraph,
  } = state;

  const baseUrl = makeBaseUrl(rowData, graphId);
  const baseUrlWithState = `${baseUrl}&id=${graphId}&wl=${
    showLogScale ? '1' : '0'
  }`;
  const baseUrlWithMetadata = `${baseUrlWithState}&facet=${facet}&contXAxis=${contXAxis}`;
  const imgUrl = baseUrlWithMetadata + '&fmt=svg';

  const covImgUrl =
    dataTable &&
    dataTable.record.attributes.CoverageJbrowseIntUrl +
      '%2C' +
      dataset_name +
      '%20Density%20-%20Unique%20Only' +
      '%2C' +
      dataset_name +
      '%20XYPlot%20-%20Unique%20Only';

  const covImgJbrowseUrl =
    dataTable &&
    dataTable.record.attributes.CoverageJbrowseUrl +
      '%2C' +
      dataset_name +
      '%20Density%20-%20Unique%20Only' +
      '%2C' +
      dataset_name +
      '%20XYPlot%20-%20Unique%20Only';

  const specialImgUrl =
    dataTable && dataTable.record.attributes.specialJbrowseUrl;

  const isUserDataset = module.startsWith('UserDatasets');

  const dataset_link = makeDatasetUrl(rowData, isUserDataset);
  const tutorial_link = makeTutorialUrl();

  return (
    <div className="eupathdb-DatasetGraphContainer2">
      <div className="eupathdb-DatasetGraphContainer">
        <div className="eupathdb-DatasetGraph">
          {visibleGraphs.map((index) => {
            // Hardcoded to render an EDA Scatterplot
            // TODO Replace hardcoded values with rowData attributes.
            if (dataset_id === 'DS_d4745ea297') {
              return (
                <EdaScatterPlot
                  key={index}
                  datasetId={dataset_id}
                  xAxisVariable={{
                    entityId: 'genePhenotypeData',
                    // Phenotype rank
                    variableId: 'VAR_9f0d6627',
                  }}
                  yAxisVariable={{
                    entityId: 'genePhenotypeData',
                    // Mean Phenotype score
                    variableId: 'VAR_40829b7e',
                  }}
                />
              );
            }
            if (!graphs || !graphs[index]) return null;

            const { height, width, visible_part } = graphs[index];
            const fullUrl = `${imgUrl}&vp=${visible_part}`;
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
          {renderLoading()}
          {renderImgError()}

          {/*
hook: HostResponseGraphs
*/}
          <h4 hidden={!contXAxisMetadataTable}>
            Choose metadata category for X-axis:
          </h4>
          <select
            value={state.contXAxis}
            hidden={!contXAxisMetadataTable}
            onChange={(event) => setContXAxis(event.target.value)}
          >
            <option value="na">Select here to change from default</option>
            <option value="none">None</option>
            {contXAxisMetadataTable &&
              contXAxisMetadataTable.value
                .filter((dat) => dat.dataset_id === dataset_id)
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

          <h4 hidden={!facetMetadataTable}>
            Choose metadata category to facet graph on:
          </h4>
          <select
            value={state.facet}
            hidden={!facetMetadataTable}
            onChange={(event) => setFacet(event.target.value)}
          >
            <option value="na">Select here to change from default</option>
            <option value="none">None</option>
            {facetMetadataTable &&
              facetMetadataTable.value
                .filter((dat) => dat.dataset_id === dataset_id)
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
                <span style={{ color: 'firebrick' }}>WARNING</span>
              </b>
              : This Gene ({source_id} ) does not have data for this experiment.
              Instead, we are showing data for this same gene(s) from the
              reference strain for this species. This may or may NOT accurately
              represent the gene you are interested in.{' '}
            </div>
          ) : null}

          <div>
            {assay_type === 'RNA-Seq' &&
            module !== 'SpliceSites' &&
            covImgUrl &&
            !isUserDataset ? (
              <h4>
                <a
                  href={covImgJbrowseUrl?.replace('/rnaseqTracks/', '/tracks/')}
                >
                  View in genome browser
                </a>
              </h4>
            ) : null}
          </div>

          {assay_type === 'RNA-Seq' &&
          paralog_number > 0 &&
          module !== 'SpliceSites' &&
          covImgUrl &&
          !isUserDataset ? (
            <div>
              <b>
                <span style={{ color: 'firebrick' }}>
                  Warning: This gene has{' '}
                  {safeHtml(String(paralog_number), {}, 'b')} paralogs!
                </span>
              </b>
              <br></br>Please consider non-unique aligned reads in the
              expression graph and coverage plots in the genome browser (
              <a href={tutorial_link}>
                <b>tutorial</b>
              </a>
              ).
            </div>
          ) : null}

          {assay_type === 'RNA-Seq' &&
          module !== 'SpliceSites' &&
          !isUserDataset &&
          covImgUrl ? (
            <CollapsibleSection
              id={dataset_name + 'Coverage'}
              className="eupathdb-GbrowseContext"
              headerContent="Coverage"
              headerComponent="h4"
              isCollapsed={state.coverageCollapsed}
              onCollapsedChange={handleCoverageCollapseChange}
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

          {assay_type === 'RNA-Seq' &&
          module !== 'SpliceSites' &&
          !isUserDataset &&
          project_id_url === 'EuPathDB' &&
          dataset_name === 'pfal3D7_Lee_Gambian_rnaSeq_RSRC' &&
          covImgUrl ? (
            <CollapsibleSection
              id={dataset_name + 'WGCNA'}
              className="eupathdb-WGCNA"
              headerContent="WGCNA search"
              headerComponent="h4"
              isCollapsed={state.wgcnaCollapsed}
              onCollapsedChange={handleWGCNACollapseChange}
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

          {assay_type === 'Phenotype' &&
          showSpecialGraph === 'true' &&
          specialImgUrl ? (
            <CollapsibleSection
              id={'Special'}
              className="eupathdb-GbrowseContext"
              headerContent="View in JBrowse"
              isCollapsed={state.coverageCollapsed}
              onCollapsedChange={handleCoverageCollapseChange}
            >
              <div>
                <a
                  href={String(specialImgUrl).replace(
                    '/phenotypeTracks/',
                    '/tracks/'
                  )}
                >
                  View in genome browser
                </a>
              </div>
              <ExternalResource>
                <JbrowseIframe
                  jbrowseUrl={String(specialImgUrl).replace(
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
          {dataTable && (
            <CollapsibleSection
              className={'eupathdb-' + dataTable.table.name + 'Container'}
              headerContent="Data table"
              headerComponent="h4"
              isCollapsed={state.dataTableCollapsed}
              onCollapsedChange={handleDataTableCollapseChange}
            >
              <dataTable.DefaultComponent
                record={dataTable.record}
                recordClass={dataTable.recordClass}
                table={dataTable.table}
                value={dataTable.value.filter(
                  (dat) => dat.dataset_id === dataset_id
                )}
              />
            </CollapsibleSection>
          )}

          {!isUserDataset ? (
            <CollapsibleSection
              className={'eupathdb-DatasetGraphDescription'}
              headerContent="Description"
              headerComponent="h4"
              isCollapsed={state.descriptionCollapsed}
              onCollapsedChange={handleDescriptionCollapseChange}
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
                  checked={graphId === state.graphId}
                  onChange={() => setGraphId(graphId)}
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
                      handleVisibleGraphsChange(index, e.target.checked)
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
                onChange={(e) => handleLogScaleChange(e.target.checked)}
              />{' '}
              Show log Scale (not applicable for log(ratio) graphs, percentile
              graphs or data tables)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetGraph;
