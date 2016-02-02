import { Components } from 'wdk-client';

export default class ExpressionGraph extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      graphId: this.props.rowData.graph_ids.split(',')[0],
      visibleParts: this.props.rowData.visible_parts.split(',').slice(0, 1),
      loading: true
    };
  }

  render() {
    let { rowData } = this.props;
    let displayName = rowData.display_name;

    let graphIds = rowData.graph_ids.split(',');
    let visibleParts = rowData.visible_parts.split(',');

    let baseUrl = '/cgi-bin/dataPlotter.pl' +
      '?type=' + rowData.module +
      '&project_id=' + rowData.project_id +
      '&dataset=' + rowData.dataset_name +
      '&template=' + (rowData.is_graph_custom === 'false' ? 1 : '') +
      '&id=' + this.state.graphId +
      '&vp=_LEGEND,' + this.state.visibleParts

    let imgUrl = baseUrl + '&fmt=png';
    let tableUrl = baseUrl + '&fmt=table';

    return (
      <div className="eupathdb-ExpressionGraphContainer">
        {this.state.loading
          ? <Components.Loading radius={4} className="eupathdb-ExpressionGraphLoading"/>
          : null}
        <div className="eupathdb-ExpressionGraph">
          <img src={imgUrl} onLoad={() => this.setState({ loading: false })}/>
        </div>
        <div className="eupathdb-ExpressionGraphDetails">
          <h4>Description</h4>
          <div dangerouslySetInnerHTML={{__html: rowData.description}}/>

          <h4>X-axis</h4>
          <div>{rowData.x_axis}</div>

          <h4>Y-axis</h4>
          <div>{rowData.y_axis}</div>

          <h4>Choose gene for which to display graph</h4>
          {graphIds.map(graphId => {
            return (
              <label>
                <input
                  type="radio"
                  checked={graphId === this.state.graphId}
                  onChange={() => this.setState({ graphId })}
                /> {graphId} </label>
            );
          })}

          <h4>Choose graph(s) to display</h4>
          {visibleParts.map(part => {
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
