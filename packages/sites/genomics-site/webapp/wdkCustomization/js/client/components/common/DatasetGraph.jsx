import { httpGet } from '../../util/http';
import { adjustScrollOnLoad } from '../../util/domUtils';
import { CollapsibleSection, Loading } from 'wdk-client/Components';
import { PureComponent, safeHtml } from 'wdk-client/ComponentUtils';

/**
 * Renders an Dataset graph with the provided rowData.
 * rowData comes from an ExpressionTable record table.
 *
 * rowData will include the available gene ids (graph_ids), but the available
 * graphs for the dataset (visible_parts) has to be fetched from dataPlotter.pl.
 * This means that when we get new rowData, we first have to make a request for
 * the available parts, and then we can update the state of the Component. This
 * flow will ensure that we have a consistent state when rendering.
 */
export default class DatasetGraph extends PureComponent {

  constructor(...args) {
    super(...args);
    let graphIds = this.props.rowData.graph_ids.split(/\s*,\s*/);
    this.state = {
      loading: true,
      imgError: false,
      parts: null,
      visibleParts: null,
      descriptionCollapsed: true,
      dataTableCollapsed: true,
      coverageCollapsed: true,
      showLogScale: (this.props.rowData.assay_type == 'RNA-seq')? false:true,
      graphId: graphIds[0],
      contXAxis: 'none',
      facet: 'none'
    };

    this.handleDescriptionCollapseChange = descriptionCollapsed => {
      this.setState({ descriptionCollapsed });
    };
    this.handleDataTableCollapseChange = dataTableCollapsed => {
      this.setState({ dataTableCollapsed });
    };
    this.handleCoverageCollapseChange = coverageCollapsed => {
      this.setState({ coverageCollapsed });
    };
  }

  componentDidMount() {
    this.getGraphParts(this.props);
  }

  componentWillUnmount() {
    this.request.abort();
    console.trace('DatasetGraph is unmounting');
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.rowData !== nextProps.rowData) {
      this.request.abort();
      this.getGraphParts(nextProps);
    }
  }

  makeBaseUrl({ rowData }) {
    let graphIds = rowData.graph_ids.split(/\s*,\s*/);
    let graphId = this.state.graphId || graphIds[0];
    return (
      '/cgi-bin/dataPlotter.pl?' +
      'type=' + rowData.module + '&' +
      'project_id=' + rowData.project_id + '&' +
      'datasetId=' + rowData.dataset_id + '&' +
      'template=' + (rowData.is_graph_custom === 'false' ? 1 : 0) + '&' +
      'id=' + graphId
    );
  }

  getGraphParts(props) {
    let baseUrl = this.makeBaseUrl(props);
    this.setState({ loading: true });
    this.request = httpGet(baseUrl + '&declareParts=1');
    this.request.promise().then(partsString => {
      let parts = partsString.split(/\s*,\s*/);
      let visibleParts = parts.slice(0, 1);
      this.setState({ parts, visibleParts, loading: false })
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
      this.setState({loading: true, 
		     facet: myfacet});
    }
  }  

  setContXAxis(myXAxis) {
    if (this.state.contXAxis !== myXAxis) {
      this.setState({loading: true,
      		     contXAxis: myXAxis});
    }
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <Loading radius={4} className="eupathdb-DatasetGraphLoading"/>
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
    let { dataTable, facetMetadataTable, contXAxisMetadataTable, rowData: {
      assay_type,
      graph_ids,
      dataset_id,
      dataset_name,
      description,
      x_axis,
      y_axis
    } } = this.props;

    let graphIds = graph_ids.split(/\s*,\s*/);
    let { parts, visibleParts, showLogScale, graphId, facet, contXAxis } = this.state;

    let baseUrl = this.makeBaseUrl(this.props);
    let baseUrlWithState = `${baseUrl}&id=${graphId}&vp=${visibleParts}&wl=${showLogScale ? '1' : '0'}`;
    let baseUrlWithMetadata = `${baseUrlWithState}&facet=${facet}&contXAxis=${contXAxis}`;
    let imgUrl = baseUrlWithMetadata + '&fmt=svg';
    let pngUrl = baseUrlWithMetadata + '&fmt=png';
    let covImgUrl = dataTable && dataTable.record.attributes.CoverageGbrowseUrl + '%1E' + dataset_name + 'CoverageUnlogged';

    return (
      <div className="eupathdb-DatasetGraphContainer">

        {this.renderLoading()}

        <div className="eupathdb-DatasetGraph">
          {visibleParts && (
            <object
              ref={adjustScrollOnLoad}
              data={imgUrl}
	      type='image/svg+xml'
              onLoad={() => {
                this.setState({loading: false});
              }}
              onError={() => this.setState({ loading: false, imgError: true })}>
              <img src={pngUrl}/>
            </object>)}
          {this.renderImgError()}

	   
	  <h4 hidden={this.props.contXAxisMetadataTable ? false : true}>
	    Choose metadata category for X-axis:  
	  </h4>
           <select value={this.state.contXAxis} hidden={this.props.contXAxisMetadataTable ? false : true} onChange={event => this.setContXAxis(event.target.value)}>
	     <option value='none'>None</option>
             {this.props.contXAxisMetadataTable &&
                contXAxisMetadataTable.value.filter(dat => dat.dataset_id == dataset_id).map(xAxisRow => {
                  return (
                    <option value={xAxisRow.property_id}>{xAxisRow.property}</option>
                  );
                })
            }
           </select>

	   <h4 hidden={this.props.facetMetadataTable ? false : true}>
	     Choose metadata category to facet graph on:
	   </h4>
	   <select value={this.state.facet} hidden={this.props.facetMetadataTable ? false : true} onChange={event => this.setFacet(event.target.value)}>
	     <option value='none'>None</option>
	     {this.props.facetMetadataTable &&
		facetMetadataTable.value.filter(dat => dat.dataset_id == dataset_id).map(facetRow => {
		  return (
		    <option value={facetRow.property_id}>{facetRow.property}</option>
		  ); 
		})
            }
	   </select>


          {assay_type == 'RNA-seq' && covImgUrl ?
            <CollapsibleSection
              id={dataset_name + "Coverage"}
              className="eupathdb-GbrowseContext"
              headerContent="Coverage"
              isCollapsed={this.state.coverageCollapsed}
              onCollapsedChange={this.handleCoverageCollapseChange}>
              <div>
                <a href={covImgUrl.replace('/gbrowse_img/', '/gbrowse/')}>
                  View in genome browser
                </a>
              </div>

              <img width="450" src={covImgUrl}/>
            </CollapsibleSection>
          : null}


        </div>
        <div className="eupathdb-DatasetGraphDetails">

          {this.props.dataTable &&
            <CollapsibleSection
              className={"eupathdb-" + this.props.dataTable.table.name + "Container"}
              headerContent="Data table"
              headerComponent='h4'
              isCollapsed={this.state.dataTableCollapsed}
              onCollapsedChange={this.handleDataTableCollapseChange}>
              <dataTable.DefaultComponent
                record={dataTable.record}
                recordClass={dataTable.recordClass}
                table={dataTable.table}
                value={dataTable.value.filter(dat => dat.dataset_id == dataset_id)}
              />
            </CollapsibleSection> }

          <CollapsibleSection
            className={"eupathdb-DatasetGraphDescription"}
            headerContent="Description"
            headerComponent="h4"
            isCollapsed={this.state.descriptionCollapsed}
            onCollapsedChange={this.handleDescriptionCollapseChange}>
            {safeHtml(description, {}, 'div')}
          </CollapsibleSection>

          <h4>X-axis</h4>
          {safeHtml(x_axis, {}, 'div')}

          <h4>Y-axis</h4>
          {safeHtml(y_axis, {}, 'div')}

          <h4>Choose gene for which to display graph</h4>
          {graphIds.map(graphId => {
            return (
              <label key={graphId}>
                <input
                  type="radio"
                  checked={graphId === this.state.graphId}
                  onChange={() => this.setGraphId(graphId)}
                /> {graphId} </label>
            );
          })}

          <h4>Choose graph(s) to display</h4>
          {parts && visibleParts && parts.map(part => {
            return (
              <label key={part}>
                <input
                  type="checkbox"
                  checked={visibleParts.indexOf(part) > -1}
                  onChange={e => this.setState({
                    loading: true,
                    visibleParts: e.target.checked
                      ? visibleParts.concat(part)
                      : visibleParts.filter(p => p !== part)
                  })}
                /> {part} </label>
            );
          })}

          <h4>Graph options</h4>
          <div>
            <label>
              <input
                type="checkbox"
                checked={showLogScale}
                onChange={e => this.setState({ loading: true, showLogScale: e.target.checked })}
              /> Show log Scale (not applicable for log(ratio) graphs, percentile graphs or data tables)
            </label>
          </div>

        </div>
      </div>
    );
  }
}
