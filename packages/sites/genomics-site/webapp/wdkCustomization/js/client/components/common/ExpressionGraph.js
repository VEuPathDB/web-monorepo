// Renders an Expression graph with the provided rowData.
// rowData comes from an ExpressionTable record table.
//
// rowData will include the available gene ids (graph_ids), but the available
// graphs for the dataset (visible_parts) has to be fetched from dataPlotter.pl.
// This means that when we get new rowData, we first have to make a request for
// the available parts, and then we can update the state of the Component. This
// flow will ensure that we have a consistent state when rendering.
export default class ExpressionGraph extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      loading: true,
      imgError: false,
      details: null,
      graphId: null,
      visibleParts: null
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

    let { rowData } = props;
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
          baseUrl,
          parts,
          graphIds,
          description: rowData.description,
          x_axis: rowData.x_axis,
          y_axis: rowData.y_axis
        }
      })
    });
  }

  setGraphId(graphId) {
    this.setState({ graphId });
    setStateFromProps(this.props);
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <Wdk.client.Components.Loading radius={4} className="eupathdb-ExpressionGraphLoading"/>
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
      return this.renderLoading();
    }

    let { visibleParts, graphId } = this.state;

    let {
      baseUrl,
      parts,
      graphIds,
      description,
      x_axis,
      y_axis
    } = this.state.details;

    let baseUrlWithState = `${baseUrl}&id=${graphId}&vp=_LEGEND,${visibleParts}`;

    let imgUrl = baseUrlWithState + '&fmt=png';
    let tableUrl = baseUrlWithState + '&fmt=table';

    return (
      <div className="eupathdb-ExpressionGraphContainer">

        {this.renderLoading()}

        <div className="eupathdb-ExpressionGraph">
          <img
            src={imgUrl}
            onLoad={() => this.setState({ loading: false })}
            onError={() => this.setState({ loading: false, imgError: true })}
          />
          {this.renderImgError()}
        </div>
        <div className="eupathdb-ExpressionGraphDetails">
          <h4>Description</h4>
          <div dangerouslySetInnerHTML={{__html: description}}/>

          <h4>X-axis</h4>
          <div dangerouslySetInnerHTML={{__html: x_axis}}/>

          <h4>Y-axis</h4>
          <div dangerouslySetInnerHTML={{__html: y_axis}}/>

          <h4>Choose gene for which to display graph</h4>
          {graphIds.map(graphId => {
            return (
              <label>
                <input
                  type="radio"
                  checked={graphId === this.state.graphId}
                  onChange={() => this.setGraphId({ graphId })}
                /> {graphId} </label>
            );
          })}

          <h4>Choose graph(s) to display</h4>
          {parts.map(part => {
            return (
              <label>
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
