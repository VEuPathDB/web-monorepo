import $ from 'jquery';
import { Components, ComponentUtils } from 'wdk-client';

let { CollapsibleSection } = Components;

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
export default class DatasetGraph extends ComponentUtils.PureComponent {

  constructor(...args) {
    super(...args);
    this.state = {
      loading: true,
      imgError: false,
      details: null,
      graphId: null,
      visibleParts: null,
      descriptionCollapsed: true,
      dataTableCollapsed: true,
      coverageCollapsed: true
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
    this.setStateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
      if (this.props.rowData !== nextProps.rowData) {
          this.setStateFromProps(nextProps);
      }
  }

  // TODO Better name
  setStateFromProps(props) {
    this.setState({ loading: true });

    let { rowData, dataTable  } = props;
    let graphIds = rowData.graph_ids.split(/\s*,\s*/);
    let graphId = this.state.graphId || graphIds[0];
    let baseUrl = '/cgi-bin/dataPlotter.pl?' +
      'type=' + rowData.module + '&' +
      'project_id=' + rowData.project_id + '&' +
      'datasetId=' + rowData.dataset_id + '&' +
      'template=' + (rowData.is_graph_custom === 'false' ? 1 : '') + '&' +
      'id=' + graphId;


    $.get(baseUrl + '&declareParts=1').then(partsString => {
      let parts = partsString.split(/\s*,\s*/);
      let visibleParts = parts.slice(0, 1);
      this.setState({
        imgError: false,
        visibleParts,
        graphId,
        details: {
          assay_type: rowData.assay_type,
          baseUrl,
          parts,
          graphIds,
          description: rowData.description,
          x_axis: rowData.x_axis,
          y_axis: rowData.y_axis
        },
          datasetId: rowData.dataset_id,
          dataTable: dataTable,
          dataset_name: rowData.dataset_name
      })
    });
  }

  setGraphId(graphId) {
    if (this.state.graphId !== graphId) {
      this.setState({ graphId });
      this.setStateFromProps(this.props);
    }
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <Components.Loading radius={4} className="eupathdb-DatasetGraphLoading"/>
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
    if (this.state.details == null) {
      return (
        <div className="eupathdb-DatasetGraphContainer">
          {this.renderLoading()}
        </div>
      );
    }

    let { visibleParts, graphId, dataTable, datasetId, dataset_name} = this.state;

    let {
      assay_type,
      baseUrl,
      parts,
      graphIds,
      description,
      x_axis,
      y_axis,
    } = this.state.details;

    let baseUrlWithState = `${baseUrl}&id=${graphId}&vp=${visibleParts}`;

    let imgUrl = baseUrlWithState + '&fmt=png';

    let covImgUrl = dataTable && dataTable.record.attributes.CoverageGbrowseUrl + '%1E' + dataset_name + 'CoverageUnlogged';

    return (
      <div className="eupathdb-DatasetGraphContainer">

        {this.renderLoading()}

        <div className="eupathdb-DatasetGraph">
          <img
            src={imgUrl}
            onLoad={() => this.setState({ loading: false })}
            onError={() => this.setState({ loading: false, imgError: true })}
          />
          {this.renderImgError()}


          {assay_type == 'RNA-seq' && covImgUrl ?
           <CollapsibleSection 
               id={dataset_name + "Coverage"}
               className="eupathdb-GbrowseContext"
               headerContent="Coverage"
               isCollapsed={this.state.coverageCollapsed}
               onCollapsedChange={this.handleCoverageCollapseChange}>
               <div>
                   <a href={covImgUrl.replace('/gbrowse_img/', '/gbrowse/')}>View in genome browser</a>
               </div>
 
               <img width="450" src={covImgUrl}/>
           </CollapsibleSection>
           : null}


        </div>
        <div className="eupathdb-DatasetGraphDetails">

          {this.props.dataTable &&
            <Components.CollapsibleSection
              className={"eupathdb-" + this.props.dataTable.table.name + "Container"}
              headerContent="Data table"
              headerComponent='h4'
              isCollapsed={this.state.dataTableCollapsed}
              onCollapsedChange={this.handleDataTableCollapseChange}>
              <dataTable.DefaultComponent
                record={dataTable.record}
                recordClass={dataTable.recordClass}
                table={dataTable.table}
                value={dataTable.value.filter(dat => dat.dataset_id == datasetId)}
              />
            </Components.CollapsibleSection> }

          <Components.CollapsibleSection
            className={"eupathdb-DatasetGraphDescription"}
            headerContent="Description"
            headerComponent="h4"
            isCollapsed={this.state.descriptionCollapsed}
            onCollapsedChange={this.handleDescriptionCollapseChange}>
            <div dangerouslySetInnerHTML={{__html: description}}/>
          </Components.CollapsibleSection>

          <h4>X-axis</h4>
          <div dangerouslySetInnerHTML={{__html: x_axis}}/>

          <h4>Y-axis</h4>
          <div dangerouslySetInnerHTML={{__html: y_axis}}/>

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
          {parts.map(part => {
            return (
              <label key={part}>
                <input
                  type="checkbox"
                  checked={this.state.visibleParts.indexOf(part) > -1}
                  onChange={e => this.setState({
                    loading: true,
                    visibleParts: e.target.checked
                      ? this.state.visibleParts.concat(part)
                      : this.state.visibleParts.filter(p => p !== part)
                  })}
                /> {part} </label>
            );
          })}
        </div>
      </div>
    );
  }
}
