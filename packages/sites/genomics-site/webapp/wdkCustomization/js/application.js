import Wdk from 'wdk';

// Import custom Components
import {
  DatasetRecord
} from './records/DatasetRecordClasses.DatasetRecordClass';

let Img = React.createClass({

  render() {
    return (
      <img {...this.props} src={wdk.assetsUrl(this.props.src)}/>
    );
  }

});

// Footer
let Footer = React.createClass({
  render() {
    let siteName = wdk.MODEL_NAME;
    let buildNumber = wdk.VERSION;
    let today = new Date;
    let releaseDate = today.toDateString();
    let copyrightYear = today.getFullYear();

    return (
      <div id="fixed-footer">
        <div className="left">
          <div className="build-info">
            <a href={location.origin}>{siteName}</a> {buildNumber}
            <span className="release"> {releaseDate}</span><br/>
          </div>
          <div className="copyright">&copy;{copyrightYear} The EuPathDB Project Team</div>
        </div>

        <div className="right">
          <ul className="attributions">
            <li>
              <a href="http://code.google.com/p/strategies-wdk/">
                <Img border="0" src="wdk/images/stratWDKlogo.png" width="120"/>
              </a>
            </li>
          </ul>
        </div>

        <div className="bottom">
          <ul className="site-icons">
            <li title="EuPathDB.org">
              <a href="http://www.eupathdb.org">
                <Img src="images/eupathdblink.png" alt="Link to EuPathDB homepage"/>
              </a>
            </li>
            <li className="short-space" title="AmoebaDB.org">
              <a href="http://amoebadb.org">
                <Img src="images/AmoebaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="CryptoDB.org">
              <a href="http://cryptodb.org">
                <Img src="images/CryptoDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="FungiDB.org">
              <a href="http://fungidb.org">
                <Img src="images/FungiDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="GiardiaDB.org">
              <a href="http://giardiadb.org">
                <Img src="images/GiardiaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="long-space" title="MicrosporidiaDB.org">
              <a href="http://microsporidiadb.org">
                <Img src="images/MicrosporidiaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="PiroplasmaDB.org">
              <a href="http://piroplasmadb.org">
                <Img src="images/PiroplasmaDB/footer-logo.png"/>
              </a>
            </li>
            <li className="long-space" title="PlasmoDB.org">
              <a href="http://plasmodb.org">
                <Img src="images/PlasmoDB/footer-logo.png"/>
              </a>
            </li>
            <li className="long-space" title="ToxoDB.org">
              <a href="http://toxodb.org">
                <Img src="images/ToxoDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="TrichDB.org">
              <a href="http://trichdb.org">
                <Img src="images/TrichDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="TriTrypDB.org">
              <a href="http://tritrypdb.org">
                <Img src="images/TriTrypDB/footer-logo.png"/>
              </a>
            </li>
            <li className="short-space" title="OrthoMCL.org">
              <a href="http://orthomcl.org">
                <Img src="images/OrthoMCL/footer-logo.png"/>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

let ExpressionGraph = React.createClass({

  getInitialState() {
    return {
      graphId: this.props.rowData.graph_ids.split(',')[0],
      visibleParts: this.props.rowData.visible_parts.split(',').slice(0, 1),
      loading: true
    };
  },

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
          ? <Wdk.client.Components.Loading radius={4} className="eupathdb-ExpressionGraphLoading"/>
          : null}
        <div className="eupathdb-ExpressionGraph">
          <img src={imgUrl} onLoad={() => this.setState({ loading: false })}/>
        </div>
        <div className="eupathdb-ExpressionGraphDetails">
          <h4>Description</h4>
          <p dangerouslySetInnerHTML={{__html: rowData.description}}/>

          <h4>X-axis</h4>
          <p>{rowData.x_axis}</p>

          <h4>Y-axis</h4>
          <p>{rowData.y_axis}</p>

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
});

let ExpressionGraphTable = React.createClass({

  render() {
    return (
      <Wdk.client.Components.DataTable
        {...this.props}
      />
    );
  }

});

// Add footer to main content
Wdk.client.Components.Main.wrapComponent(function(Main) {
  let ApiMain = React.createClass({
    render() {
      return (
        <Main {...this.props}>
          <div
            className="eupathdb-Beta-Announcement"
            title="BETA means pre-release; a beta page is given out to a large group of users to try under real conditions. Beta versions have gone through alpha testing inhouse and are generally fairly close in look, feel and function to the final product; however, design changes often occur as a result.">
              You are viewing a <strong>BETA</strong> (pre-release) page. <a data-name="contact_us" className="new-window" href="contact.do">Feedback and comments</a> are welcome!
          </div>
          {this.props.children}
          <Footer/>
        </Main>
      );
    }
  });
  return ApiMain;
});

// Customize the Record Component
Wdk.client.Components.RecordUI.wrapComponent(function(RecordUI) {
  // Map record class names to custom Components
  function recordComponent(recordClassName) {
    switch (recordClassName) {
      case 'DatasetRecordClasses.DatasetRecordClass':
        return DatasetRecord;

      default:
        return RecordUI;
    }
  }

  // This React Component will delegate to custom Components defined in the
  // Object defined above.
  let RecordComponentResolver =  React.createClass({
    render() {
      let Component = recordComponent(this.props.recordClass.fullName);
      return (
        <Component {...this.props}/>
      );
    }
  });

  return RecordComponentResolver;
});


Wdk.client.Components.RecordTable.wrapComponent(RecordTable => props => {
  if (props.tableMeta.name === 'ExpressionGraphs') {
    return <RecordTable
      {...props}
      childRow={childProps => <ExpressionGraph rowData={props.table[childProps.rowIndex]}/>}
    />
  }
  return <RecordTable {...props} />
});


// Bootstrap the WDK client application

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();
let app = window._app = Wdk.client.run({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement
});

// TODO Convert initialData to an action
if (config.initialData) {
  let action = config.initialData;
  app.store.dispatch(action);
}
