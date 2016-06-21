/* global wdk, org */
import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import {Image} from 'wdk-client/Components';
import {safeHtml} from 'wdk-client/ComponentUtils';
import {CompoundStructure} from '../common/Compound';

export const RECORD_CLASS_NAME = 'PathwayRecordClasses.PathwayRecordClass';

const EC_NUMBER_SEARCH_PREFIX = '/a/processQuestion.do?questionFullName=' +
  'GeneQuestions.InternalGenesByEcNumber&organism=all&array%28ec_source%29=all' +
  '&questionSubmit=Get+Answer&ec_number_pattern=N/A&ec_wildcard=';


let div_id = "eupathdb-PathwayRecord-cytoscapeweb";

let pathwayFilesBaseUrl = "/common/downloads/pathwayFiles/";
//let pathwayFilesBaseUrl = "/plasmodb/data/";
let pathwayFileExt = ".xgmml";

// initialization options
let options = {
  // where you have the Cytoscape Web SWF
  swfPath: "/swf/CytoscapeWeb",
  //swfPath: "http://www.plasmodb.org/swf/CytoscapeWeb",
  // where you have the Flash installer SWF
  flashInstallerPath: "/swf/playerProductInstall"
  //flashInstallerPath: "http://www.plasmodb.org/swf/playerProductInstall"
};

let loadCytoscapeWeb = _.once(function() {
  return Promise.resolve($.getScript(wdk.webappUrl('js/cytoscapeweb.min.js')));
});

function makeVis(pathwayId, pathwaySource) {
  return loadCytoscapeWeb().then(function() {
    // init and draw
    let vis = new org.cytoscapeweb.Visualization(div_id, options);

    var presetLayout;

    /**
     * Creates and resolves a Promise object that collects the requested pathway and
     * draws it
     * @param pathwayId - pathway id
     * @param pathwaySource - source of pathway (e.g., KEGG)
     */
    let drawVisualization = (pathwayId, pathwaySource) => {
      let network$ = getNetwork(pathwayFilesBaseUrl + pathwaySource + "/" + pathwayId + pathwayFileExt);
      network$.then(data => {
        vis.draw(options);
        if (pathwaySource === 'KEGG') {
          vis.draw({network: data, layout: 'Preset'});
        } else {
          vis.draw({network: data, layout: 'ForceDirected'});
        }
      }).catch(error => {
        alert("Error loading file " + error);
      });
    };

    /**
     * Provides a Promise object representing the output of an XHR call
     * to the provided url
     * @param url - url object of the XHR call
     * @returns {Promise} - Promise
     */
    let getNetwork = function (url) {
      return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("get", url);
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response, xhr.statusText, xhr);
          }
          else {
            var error = new Error(xhr.statusText);
            error.response = xhr.response;
            reject(error);
          }
        };
        xhr.onerror = function () {
          reject(xhr.statusText);
        };
        xhr.send();
      });
    };

    // function exportVisualization(vis, type, name) {
    //   var link = wdk.webappUrl('exportCytoscapeNetwork.do?type=' + type + '&name=' + name);
    //   vis.exportNetwork(type, link);
    // }

    // Transform a JSON request from webservices to
    // a more usable data structure. This is used
    // by `getEcToOrganismMap`
    function transformToEcNumberList(data) {
      if (!(data.response && data.response.recordset && data.response.recordset.records)) {
        throw new Error("Received an unexpected response object");
      }

      var ecNumberList = {};
      var records = data.response.recordset.records;

      records.forEach(function (record) {
        var organism = _(record.fields).findWhere({name: 'organism'});
        var ecTable = _(record.tables).findWhere({name: 'EC Number'});

        ecTable.rows.forEach(function (row) {
          var ecItem;
          var ecNumber = _(row.fields).findWhere({name: 'ec_number'});
          var source = _(row.fields).findWhere({name: 'source'});

          if (!_(ecNumberList).has(ecNumber.value)) {
            // create new entry in ecNumberList
            ecItem = ecNumberList[ecNumber.value] = {};
          } else {
            // return existing entry
            ecItem = ecNumberList[ecNumber.value]
          }

          if (!_(ecItem).has(source.value)) {
            ecItem[source.value] = [];
          }

          if (ecItem[source.value].indexOf(organism.value) === -1) {
            ecItem[source.value].push(organism.value);
          }

        });
      });

      return ecNumberList;
    }


    // Requests JSON from webservice and tranforms the JSON to
    // a map of ecNumbers -> sources -> organisms
    //
    // Example:
    //   getEcToOrganismMap(id).done(function(ecNumberMap) {
    //     vis.nodes().forEach(function(node) {
    //       // get ecNumber from node somehow ...
    //       var ecMapItem = ecNumberMap[ecNumber];
    //       for (var source in ecMapItem) {
    //         var genes = ecMapItem[source]; // returns an array
    //         // do something with ecNumber, source, and genes ...
    //       }
    //     });
    //   });

    // function getEcToOrganismMap(id) {
    //   var url = wdk.webappUrl('/webservices/GeneQuestions/GenesByMetabolicPathwayIDKegg.json?metabolic_pathway_id_with_genes=' +
    //     encodeURIComponent(id) + '&o-fields=organism,EcNumber');
    //   return $.getJSON(url).then(transformToEcNumberList);
    // }


    // callback when Cytoscape Web has finished drawing
    /**
     * Callback that is issued when Cytoscape Web has finished drawing
     * Does additional styling, adds event handlers in drawing and on menu
     */
    vis.ready(function () {

      // Add new field 'xaxis' to nodes:
      var xAxisField = {name: "xaxis", type: "string", defValue: ''};
      vis.addDataField("nodes", xAxisField);

      // customTooltip function
      vis["customTooltip"] = function (data) {
        //  var value = Math.round(100 * data["weight"]) + "%";
        var value = data["label"];
        if (data["Description"]) {
          value = value + ": " + data["Description"];
        }
        return (value);
      };

      // customBorder function : if node has Organisms, then border should be a different color
      vis["customBorder"] = function (data) {
        var value = data["label"];
        if (data["OrganismsInferredByOthoMCL"] || data["Organisms"]) {
          value = "#FF0000";
        } else {
          value = "#000000";
        }
        return (value);
      };

      var colorMapper = {
        attrName: "Type",
        entries: [{attrValue: "metabolic process", value: "#ccffff"},
          {attrValue: "enzyme", value: "#ffffcc"},
          {attrValue: "molecular entity", value: "#0000ff"}]
      };

      var shapeMapper = {
        attrName: "Type",
        entries: [{attrValue: "metabolic process", value: "ROUNDRECT"},
          {attrValue: "enzyme", value: "SQUARE"},
          {attrValue: "molecular entity", value: "CIRCLE"}]
      };

      var sizeMapper = {
        attrName: "Type",
        entries: [{attrValue: "metabolic process", value: 'auto'}]
      };

      var widthMapper = {
        attrName: "Type",
        entries: [{attrValue: "enzyme", value: 50},
          {attrValue: "molecular entity", value: 15}]
      };

      var heightMapper = {
        attrName: "Type",
        entries: [{attrValue: "metabolic process", value: 20},
          {attrValue: "enzyme", value: 20},
          {attrValue: "molecular entity", value: 15}]
      };

      // var labelPosition = {
      //   attrName: "Type",
      //   entries: [{attrValue: "molecular entity", value: 'right'}]
      // };

      var labelSize = {
        attrName: "Type",
        entries: [{attrValue: "molecular entity", value: 0}]
      };

      // to not show arrowhead for a Reversible reaction
      var edgeArrow = {
        attrName: "direction",
        entries: [{attrValue: "Reversible", value: "NONE"},
          {attrValue: "Irreversible", value: "DELTA"}]
      };


      var style = {
        nodes: {
          color: {discreteMapper: colorMapper},
          shape: {discreteMapper: shapeMapper},
          width: {discreteMapper: widthMapper},
          size: {discreteMapper: sizeMapper},
          height: {discreteMapper: heightMapper},
          borderColor: {customMapper: {functionName: "customBorder"}},
          borderWidth: 1,
          tooltipText: {customMapper: {functionName: "customTooltip"}},
          labelFontSize: {discreteMapper: labelSize}
        },
        edges: {
          color: "#000000", width: 1,
          targetArrowShape: {discreteMapper: edgeArrow},
          lineStyle: "dotted"
        }
      };

      //  node attribute to store the image
      var imageField = {name: "image", type: "string", defValue: ""};
      vis.addDataField("nodes", imageField);

      vis.nodeTooltipsEnabled(true);
      vis.visualStyle(style);

      vis.changeExperiment = function (val, xaxis, doAllNodes) {

        // use bypass to hide labelling of EC num that have expression graphs
        var nodes = vis.nodes();

        for (var i in nodes) {
          var n = nodes[i];

          var type = n.data.Type;

          if (type == ("enzyme")) {
            var ecNum = n.data.label;

            if (val && (doAllNodes || n.data.OrganismsInferredByOthoMCL || n.data.Organisms)) {
              var linkPrefix = '/cgi-bin/dataPlotter.pl?idType=ec&' + val + '&id=' + ecNum;
              var link = linkPrefix + '&fmt=png&h=20&w=50&compact=1';

              style.nodes[n.data.id] = {image: link, label: ""};
              n.data.image = linkPrefix;

              if (xaxis) {
                n.data.xaxis = xaxis;
              } else {
                n.data.xaxis = "";
              }

            } else {
              style.nodes[n.data.id] = {image: ""};
              n.data.image = "";
              n.data.xaxis = "";
            }
            //vis.updateData([n]);
          }  // if enzyme
        }
        vis.updateData(nodes.filter(node => {
          return node.data.Type === "enzyme"
        }));
        vis.nodeTooltipsEnabled(true);
        vis.visualStyleBypass(style);
      };

      vis.changeLayout = function (val) {
        var current = vis.layout();
        if (current.name == "Preset") {
          presetLayout = current;
        }
        (val === "Preset") ? vis.layout(presetLayout) : vis.layout(val);
      };

      var colorNodes = function (val) {
        //  to color the ec numbers that correspond to a set of genes
        var nodes = vis.nodes();

        for (var i in nodes) {
          var n = nodes[i];
          var type = n.data.Type;
          var label = n.data.label;

          var nodeArray = val.split(/,/);
          for (var j = 0; j < nodeArray.length; j++) {
            if (type == ("enzyme") && label == nodeArray[j]) {
              style.nodes[n.data.id] = {color: "#00FF00", border: 2};

              //vis.updateData([n]);
            } else if (type == ("molecular entity") && label == nodeArray[j]) {
              style.nodes[n.data.id] = {color: "#00FF00"};

            }
          }
        }
        vis.nodeTooltipsEnabled(true);
        vis.visualStyleBypass(style);
      };


      // color EC Numbers, if any specified
      var nodeList = $('#' + div_id).data('node-list');
      colorNodes(nodeList);

      // set the style programmatically
      document.getElementById("color").onclick = function () {
        vis.visualStyleBypass(style);
      };

    });
    // end ready

    drawVisualization(pathwayId, pathwaySource);

    return vis;
  });
}


export class CytoscapeDrawing extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.resizeMap = _.throttle(this.resizeMap.bind(this), 250);
    this.state = this.context.viewStore.getState().pathwayRecord;
  }

  componentDidMount() {
    let { viewStore } = this.context;
    this.resizeMap();
    this.initMenu();
    this.initVis();
    $(this.detailContainer).draggable({
      iframeFix: '#eupathdb-PathwayRecord-cytoscapeweb embed'
    });
    this.storeSub = viewStore.addListener(() => {
      this.setState(viewStore.getState().pathwayRecord);
    });
    $(window).on('resize', this.resizeMap);
  }

  componentWillUnmount() {
    this.storeSub.remove();
    $(window).off('resize', this.resizeMap);
  }

  // Resize cytoscape container to height of viewport
  resizeMap() {
    $(this.cytoContainer).height($(window).height() - 10);
  }

  initMenu() {
    if ($.fn.superfish) {
      var menu = $('#vis-menu').superfish().on('click', 'a', function (e) {
        var a = $(this);
        if (a.is('.sf-with-ul')) {
          // prevent page jumps
          e.preventDefault();
        } else {
          // hide menu when an action is clicked
          menu.hideSuperfishUl();
        }
      });
    }
  }

  initVis() {
    let { primary_key, pathway_source } = this.props.record.attributes;
    makeVis(primary_key, pathway_source).then(vis => {
      this.vis = vis;
      // listener for when nodes and edges are clicked
      vis.addListener("click", "nodes", (event) => {
        let { data } = event.target;
        this.context.dispatchAction(setActiveNode(event.target));
        if (data.Type === 'molecular entity' && data.CID) {
          this.context.dispatchAction(loadCompoundStructure(data.CID));
        }
      });
    })
    .catch(error => {
      this.context.dispatchAction(setPathwayError(error));
    });
  }

  renderError() {
    if (this.state.error) {
      return (
        <div style={{color: 'red' }}>
          Error: The Pathway Network could not be loaded.
        </div>
      );
    }
  }

  render() {
    let projectId = wdk.MODEL_NAME;
    let { record } = this.props;
    let { attributes, tables } = record;
    let { primary_key, pathway_source } = attributes;
    let { PathwayGraphs } = tables;
    let red = {color: 'red'};
    let experimentData = [
      {
        "type": "PathwayGenera",
        "projectIds": ['AmoebaDB'],
        "linkData":[
          {"sid": "Acanthamoeba,Entamoeba,Naegleria,Vitrella,Chromera,Homo,Mus",
            "display": "Acanthamoeba,Entamoeba,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ['CryptoDB','PiroplasmaDB','PlasmoDB','ToxoDB'],
        "linkData": [
          {
            "sid": "Babesia,Cryptosporidium,Eimeria,Gregarina,Neospora,Plasmodium,Theileria,Toxoplasma",
            "display": "Apicomplexa"
          },
          {
            "sid": "Cryptosporidium,Plasmodium,Toxoplasma,Homo,Mus",
            "display": "Cryp,Toxo,Plas,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ['GiardiaDB'],
        "linkData": [
          {
            "sid": "Giardia,Spironucleus,Homo,Mus",
            "display": "Giardia,Spironucleus,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ['FungiDB'],
        "linkData": [
          {
            "sid": "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Homo,Mus",
            "display": "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ["MicrosporidiaDB"],
        "linkData": [
          {
            "sid": "Anncaliia,Edhazardia,Encephalitozoon,Enterocytozoon,Nematocida,Nosema,Spraguea,Trachipleistophora,Vavraia,Vittaforma,Homo,Mus",
            "display": "Microsporidia,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ["SchistoDB"],
        "linkData": [
          {
            "sid": "Schistosoma,Homo,Mus", "display": "Schistosoma,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ["TrichDB"],
        "linkData": [
          {
            "sid": "Trichomonas,Homo,Mus", "display": "Trichomonas,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ["TriTrypDB"],
        "linkData": [
          {
            "sid": "Crithidia,Leishmania,Trypanosoma,Homo,Mus", "display": "Crithidia,Leishmania,Trypanosoma,Human,Mouse"
          },
          {
            "sid": "Cryptosporidium,Plasmodium,Toxoplasma,Trypanosoma,Homo,Mus", "display": "Cryp,Toxo,Plas,Tryp,Human,Mouse"
          }
        ]
      },
      {
        "type": "PathwayGenera",
        "projectIds": ['HostDB'],
        "linkData": [
          {
            "sid": "Acanthamoeba,Entamoeba,Naegleria,Vitrella,Chromera,Homo,Mus",
            "display": "Acanthamoeba,Entamoeba,Human,Mouse"
          },
          {"sid": "Giardia,Spironucleus,Homo,Mus", "display": "Giardia,Spironucleus,Human,Mouse"},
          {"sid": "Cryptosporidium,Plasmodium,Toxoplasma,Homo,Mus", "display": "Cryp,Toxo,Plas,Human,Mouse"},
          {
            "sid": "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Homo,Mus",
            "display": "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Human,Mouse"
          },
          {
            "sid": "Anncaliia,Edhazardia,Encephalitozoon,Enterocytozoon,Nematocida,Nosema,Spraguea,Trachipleistophora,Vavraia,Vittaforma,Homo,Mus",
            "display": "Microsporidia,Human,Mouse"
          },
          {"sid": "Schistosoma,Homo,Mus", "display": "Schistosoma,Human,Mouse"},
          {"sid": "Trichomonas,Homo,Mus", "display": "Trichomonas,Human,Mouse"},
          {"sid": "Crithidia,Leishmania,Trypanosoma,Homo,Mus", "display": "Crithidia,Leishmania,Trypanosoma,Human,Mouse"}
        ]
      }
    ];

    return (
      <div id="eupathdb-PathwayRecord-cytoscape">
        {this.renderError()}
        <div id="draggable" ref={node => this.detailContainer = node}>
          {this.state.activeNode == null ? (
            <p>
              Click on nodes for more info.
              <br />Nodes highlighted in <span style={red}>red</span> are EC numbers that we have mapped to at least one gene.
              <br />The nodes, as well as this info box, can be repositioned by dragging.
              <br />
            </p>
            ) : <NodeDetails nodeData={this.state.activeNode.data}
                             compoundRecord={this.state.activeCompound}
                             pathwaySource={pathway_source}/>}
        </div>
        <VisMenu pathway_source = {pathway_source}
                       primary_key = {primary_key}
                       PathwayGraphs = {PathwayGraphs}
                       projectId = {projectId}
                       experimentData = {experimentData}
                       vis={this.vis} />
        <div id="eupathdb-PathwayRecord-cytoscapeIcon">
          <a href="http://cytoscapeweb.cytoscape.org/">
            <img src="http://cytoscapeweb.cytoscape.org/img/logos/cw_s.png" alt="Cytoscape Web"/>
          </a>
        </div>
        <div>
          <p>
            <strong>NOTE </strong>
            Click on nodes for more info.  Nodes highlighted in <span style={red}>red</span> are EC numbers that we
            have mapped to at least one gene. The nodes, as well as the info box, can be repositioned by dragging.
            <br />
          </p>
        </div>
        <div id={div_id} ref={node => this.cytoContainer = node}>
          Cytoscape Web will replace the contents of this div with your graph.
        </div>

      </div>
    );
  }
}

CytoscapeDrawing.contextTypes = {
  dispatchAction: React.PropTypes.func.isRequired,
  viewStore: React.PropTypes.object.isRequired
};

function VisMenu(props) {
  let { vis, pathway_source, primary_key, PathwayGraphs, projectId, experimentData } = props;
  return(
    <ul id="vis-menu" className="sf-menu">
      <li>
        <a href="#">File</a>
        <ul>
          <li>
            <a href={pathwayFilesBaseUrl + pathway_source + "/" + primary_key + pathwayFileExt}>
              Get Download XGMML (XML) file
            </a>
          </li>
        </ul>
      </li>
      <li>
        <a href="javascript:void(0)">
          Layout
          <Image title="Choose a Layout for the Pathway Map"  src="wdk/images/question.png" />
        </a>
        <ul>
          {pathway_source === "KEGG" ?
            <li key='Preset'><a href="javascript:void(0)" onClick={() => vis.changeLayout('Preset')}>Kegg</a></li> :
            ""
          }
          <li key='ForceDirected' ><a href="javascript:void(0)" onClick={() => vis.changeLayout('ForceDirected')}>ForceDirected</a></li>
          <li key='Tree'><a href="javascript:void(0)" onClick={() => vis.changeLayout('Tree')}>Tree</a></li>
          <li key='Circle'><a href="javascript:void(0)" onClick={() => vis.changeLayout('Circle')}>Circle</a></li>
          <li key='Radial'><a href="javascript:void(0)" onClick={() => vis.changeLayout('Radial')}>Radial</a></li>
        </ul>
      </li>
      <li>
        <a href="javascript:void(0)">
          Paint Experiment
          <Image title="Choose an Experiment, to display its (average) expression profile on enzymes in the Map"  src="wdk/images/question.png" />
        </a>
        <ul>
          <li><a href="javascript:void(0)" onClick={() => vis.changeExperiment('')}>None</a></li>
          {PathwayGraphs.map(graph => <PathwayGraph key={graph.internal} graph={graph} vis={vis} />)}
        </ul>
      </li>
      <li>
        <a href="#">
          Paint Genera
          <Image title="Choose a Genera set, to display the presence or absence of these for all enzymes in the Map "  src="wdk/images/question.png" />
        </a>
        <ExperimentMenuItems experimentData={experimentData} projectId={projectId} type="PathwayGenera" vis={vis} />
      </li>
    </ul>
  );
}

function PathwayGraph(props) {
  let {graph, vis} = props;
  return(
    <li>
      <a href="javascript:void(0)"
         onClick={() => vis.changeExperiment(graph.internal + "," + graph.xaxis_description)} >
        {graph.display_name}
      </a>
    </li>
  )
}

function ExperimentMenuItems(props) {
  let { experimentData, projectId, type, vis } = props;
  let entries = experimentData
    .filter(datum => {return datum.type === type && datum.projectIds.includes(projectId)})
    .reduce(function (arr, expt) {return arr.concat(expt.linkData)}, [])
    .map((item) => {
      let id = type + "_" + projectId + "_" + item.sid;
      return (<li key={id}><a href='javascript:void(0)' onClick={() => vis.changeExperiment('type=' + type + '&project_id=' + projectId + '&sid=' + item.sid, 'genus' , '1')}>{item.display}</a></li>);
    });
  return(
    <ul>
      <li>
        <a href="javascript:void(0)" onClick={() => vis.changeExperiment('')}>
          None
        </a>
      </li>
      {entries}
    </ul>
  );
}

/** Render pathway node details */
function NodeDetails(props) {
  let { Type } = props.nodeData;

  if (Type == "enzyme")
    return <EnzymeNodeDetails {...props}/>

  else if (Type == "molecular entity")
    return <MolecularEntityNodeDetails {...props}/>

  else if (Type == "metabolic process")
    return <MetabolicProcessNodeDetails {...props}/>

  else
    return <noscript/>
}

NodeDetails.propTypes = {
  nodeData: React.PropTypes.object.isRequired,
  pathwaySource: React.PropTypes.string.isRequired
};

function EnzymeNodeDetails(props) {
  let { nodeData } = props;
  return (
    <div>
      <p><b>EC Number:</b> {nodeData.label}</p>
      <p><b>Enzyme Name or Description:</b> {nodeData.Description}</p>

      {nodeData.Organisms && (
        <div>
          <b>Organism(s):</b>
          <ul>
            {nodeData.Organisms.split(',').sort().map(organism => (
              <li key={organism}>{organism}</li>
            ))}
          </ul>
        </div>
      )}

      {nodeData.OrganismsInferredByOthoMCL && (
        <div>
          <b>Organism(s) inferred from OrthoMCL:</b>
          <ul>
            {nodeData.OrganismsInferredByOthoMCL.split(',').sort().map(organism => (
              <li key={organism}>{organism}</li>
            ))}
          </ul>
          <div>
            <a href={EC_NUMBER_SEARCH_PREFIX + nodeData.label}>Search for Gene(s) By EC Number</a>
          </div>
        </div>
      )}

      {nodeData.image && (
        <div>
          <img src={nodeData.image + '&fmt=png&h=250&w=350'}/>
          {nodeData.xaxis && <div><b>x-axis</b>: {nodeData.xaxis}</div>}
        </div>
      )}
    </div>
  );
}

function MolecularEntityNodeDetails(props) {
  let { nodeData, compoundRecord, compoundError } = props;
  return (
    <div>
      <p><b>Compound ID:</b> {nodeData.label}</p>

      {nodeData.Description && (
        <p><b>Name:</b> {safeHtml(nodeData.Description)}</p>
      )}

      {nodeData.CID && (
        <div><a href={wdk.webappUrl('/app/record/compound/' + nodeData.CID)}>View on this site</a></div>
      )}


      {nodeData.SID && (
        <div>
          <div><a href={'https://www.ebi.ac.uk/chebi/searchId.do?chebiId=' + nodeData.CID}>View in CHEBI</a></div>
          {/*<div><img src={'http://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?t=l&sid=' + nodeData.SID}/></div>*/}
        </div>
      )}

      {compoundRecord && (
        <CompoundStructure width={200} height={200}
                           moleculeString={compoundRecord.attributes.default_structure} />
      )}

      {compoundError && (
        <div style={{color: 'red'}}>Unable to load compound structure</div>
      )}
    </div>
  );
}

function MetabolicProcessNodeDetails(props) {
  //print("<b>Pathway:  </b>" + "<a href='/a/showRecord.do?name=PathwayRecordClasses.PathwayRecordClass&source_id=" + nodeData["Description"] + "'>" + nodeData["label"] + "</a>");
  let { nodeData, pathwaySource } = props;
  return (
    <div>
      <div><b>Pathway: </b> <a href={wdk.webappUrl('/app/record/pathway/' + pathwaySource + '/' + nodeData.Description)}>{nodeData.label}</a></div>
      <div><a href={'http://www.genome.jp/dbget-bin/www_bget?' + nodeData.Description}>View in KEGG</a></div>
    </div>
  );
}


/**
 * Overrides the Cytoscape Drawing attribute in the Pathway Record class with a call to the
 * element rendering the Cytoscape drawing.
 * @param props
 * @returns {XML}
 * @constructor
 */
export function RecordAttribute(props) {
  if (props.name === 'drawing') {
    return <CytoscapeDrawing {...props}/>
  }
  else {
    return <props.DefaultComponent {...props}/>;
  }
}

function setActiveNode(activeNode) {
  return {
    type: 'pathway-record/set-active-node',
    payload: { activeNode }
  };
}

function setPathwayError(error) {
  console.error(error);
  return {
    type: 'pathway-record/set-pathway-error',
    payload: { error }
  };
}

function loadCompoundStructure(compoundId) {
  let recordClassName = 'CompoundRecordClasses.CompoundRecordClass';
  let primaryKey = [
    { name: 'source_id', value: compoundId },
    { name: 'project_id', value: wdk.MODEL_NAME }
  ];
  let options = { attributes: [ 'default_structure' ] };
  return function run(dispatch, { wdkService }) {
    dispatch({ type: 'pathway-record/compound-loading' });
    dispatch(wdkService.getRecord(recordClassName, primaryKey, options)
    .then(compound => ({
      type: 'pathway-record/compound-loaded',
      payload: { compound }
    }))
    .catch(error => ({
      type: 'pathway-record/compound-error',
      payload: { compoundId, error }
    })));
  }
}
