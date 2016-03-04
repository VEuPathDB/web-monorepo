import React from 'react';
import { Components } from 'wdk-client';
import Image from 'wdk-client-components/Image';
import {cytoscape} from '../../../../../js/cytoscapeweb.min.js';

export const RECORD_CLASS_NAME = 'PathwayRecordClasses.PathwayRecordClass';

let { Main } = Components;

//var div_id = "cytoscapeweb";
var div_id = "eupathdb-PathwayRecord-cytoscapeweb";

// initialization options
var options = {
  // where you have the Cytoscape Web SWF
  swfPath: "/swf/CytoscapeWeb",
  //swfPath: "http://www.plasmodb.org/swf/CytoscapeWeb",
  // where you have the Flash installer SWF
  flashInstallerPath: "/swf/playerProductInstall"
  //flashInstallerPath: "http://www.plasmodb.org/swf/playerProductInstall"
};

// init and draw
var vis = new org.cytoscapeweb.Visualization(div_id, options);
var presetLayout;

let drawVisualization = (pathwayId, pathwaySource) => {
  // Added bogus url file is not on localhost
  //let network$ = getNetwork("/plasmodb/data/" + pathwayId + ".xgmml");
  let network$ = getNetwork("/common/downloads/pathwayFiles/KEGG/" + pathwayId + ".xgmml");
  network$.then(data => {
    vis.draw(options);
    if (pathwaySource === 'TrypanoCyc') {
      vis.draw({ network: data , layout: 'ForceDirected' });
    } else {
      vis.draw({ network: data , layout: 'Preset' });
    }
  }).catch(error => {
    alert("Error loading file " + error);
  });
};

let getNetwork = function(url)  {
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


function exportVisualization (type, name) {
  var link = wdk.webappUrl('exportCytoscapeNetwork.do?type=' + type + '&name=' + name);

  vis.exportNetwork(type, link);
}

// Transform a JSON request from webservices to
// a more usable data structure. This is used
// by `getEcToOrganismMap`
function transformToEcNumberList(data) {
  if (!(data.response && data.response.recordset && data.response.recordset.records)) {
    throw new Error("Received an unexpected response object");
  }

  var ecNumberList = {};
  var records = data.response.recordset.records;

  records.forEach(function(record) {
    var organism = _(record.fields).findWhere({ name: 'organism' });
    var ecTable = _(record.tables).findWhere({ name: 'EC Number' });

    ecTable.rows.forEach(function(row) {
      var ecItem;
      var ecNumber = _(row.fields).findWhere({ name: 'ec_number' });
      var source = _(row.fields).findWhere({ name: 'source' });

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
function getEcToOrganismMap(id) {
  var url = wdk.webappUrl('/webservices/GeneQuestions/GenesByMetabolicPathwayIDKegg.json?metabolic_pathway_id_with_genes=' +
    encodeURIComponent(id) + '&o-fields=organism,EcNumber');
  return $.getJSON(url).then(transformToEcNumberList);
}


// callback when Cytoscape Web has finished drawing
vis.ready(function() {

  // listener for when nodes and edges are clicked
  vis.addListener("click", "nodes", function (event) {
    // try "mouseover" OR "click"
    handle_click(event);
  });

  // Add new field 'xaxis' to nodes:
  var field = {name: "xaxis", type: "string", defValue: ''};
  vis.addDataField("nodes", field);

  function handle_click(event) {
    var target = event.target;
    clear();
    var type = target.data["Type"];

    if (type == "enzyme") {
      print("<b>EC Number:  </b> " + target.data["label"]);
      print("");
      print("<b>Enzyme Name or Description:  </b>" + target.data["Description"]);
      print("");

      if (target.data["Organisms"]) {
        var orgs = target.data["Organisms"].split(",");
        print("<b>Organism(s): </b>");
        for (var i in orgs.sort()) {
          print("&nbsp;&nbsp;" + orgs[i]);
        }
      }
      print("");
      if (target.data["OrganismsInferredByOthoMCL"]) {
        var orgs = target.data["OrganismsInferredByOthoMCL"].split(",");
        print("<b>Organism(s) inferred from OrthoMCL: </b>");
        for (var i in orgs.sort()) {
          print("&nbsp;&nbsp;" + orgs[i]);
        }
        print("");
        print("<a href='/a/processQuestion.do?questionFullName=GeneQuestions.InternalGenesByEcNumber&organism=all&array%28ec_source%29=all&questionSubmit=Get+Answer&ec_number_pattern=N/A&ec_wildcard=" + target.data["label"] + "'>Search for Gene(s) By EC Number</a>");
        print("");

      }
      if (target.data.image) {
        var link = target.data.image + '&fmt=png&h=250&w=350';
        print("<img src='" + link + "'>");
        if (target.data.xaxis) {
          print("<B>x-axis</B>: " + target.data.xaxis);
        }
      }

    }

    if (type == "molecular entity") {
      print("<b>Compound ID:</b>  " + target.data["label"] + "<br />");

      if (target.data.Description) {
        print("<b>Name:</b>  " + target.data["Description"] + "<br />");
      }
      if (target.data["CID"]) {
        print("<a href='/a/showRecord.do?name=CompoundRecordClasses.CompoundRecordClass&source_id=CID:" + target.data["CID"] + "'>View on this site</a>");
      }

      print("<a href='http://www.genome.jp/dbget-bin/www_bget?" + target.data["label"] + "'>View in KEGG</a>");

      if (target.data["SID"]) {
        print("<a href='http://pubchem.ncbi.nlm.nih.gov/summary/summary.cgi?sid=" + target.data["SID"] + "'>View in PubChem</a>");
        print("<img src='http://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?t=l&sid=" + target.data["SID"] + "'>");
      }
    }

    if (type == "metabolic process") {
      print("<b>Pathway:  </b>" + "<a href='/a/showRecord.do?name=PathwayRecordClasses.PathwayRecordClass&source_id=" + target.data["Description"] + "'>" + target.data["label"] + "</a>");
      print("");
      print("<a href='http://www.genome.jp/dbget-bin/www_bget?" + target.data["Description"] + "'>View in KEGG</a>");
    }
  }


  function clear() {
    document.getElementById("draggable").innerHTML = "";
  }


  function print(msg) {
    document.getElementById("draggable").innerHTML += msg + "<br />";
  }

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

  var labelPosition = {
    attrName: "Type",
    entries: [{attrValue: "molecular entity", value: 'right'}]
  };

  var labelSize = {
    attrName: "Type",
    entries: [{attrValue: "molecular entity", value: 0}],
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
      labelFontSize: {discreteMapper: labelSize},
    },
    edges: {
      color: "#000000", width: 1,
      targetArrowShape: {discreteMapper: edgeArrow},
      lineStyle: "dotted",
    }
  };

  //  node attribute to store the image
  var field = {name: "image", type: "string", defValue: ""};
  vis.addDataField("nodes", field);

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
        vis.updateData([n]);
      }  // if enzyme
    }

    vis.nodeTooltipsEnabled(true);
    vis.visualStyleBypass(style);
  };

  vis.changeLayout = function (val) {
    var current = vis.layout();
    if (current.name == "Preset") {
      presetLayout = current;
    }

    if (val == "Preset") {
      vis.layout(presetLayout);
    }
    else {
      vis.layout(val);
    }
  };

  colorNodes = function (val) {
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

// Resize cytoscape container to height of viewport
jQuery(function($) {
  function resizeMap() {
    $('#' + div_id).height($(window).height() - 10);
  }

  $(window).on('resize', resizeMap);
  resizeMap();

  if ($.fn.superfish) {
    var menu = $('#vis-menu')
      .superfish()
      .on('click', 'a', function(e) {
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

});

export let RecordOverview = React.createClass({

  componentWillMount() {
    drawVisualization(this.props.record.attributes.primary_key, this.props.record.attributes.pathway_source);
  },

  componentDidMount() {
    // Resize cytoscape container to height of viewport
    jQuery(function($) {
      function resizeMap() {
        $('#' + div_id).height($(window).height() - 10);
      }

      $(window).on('resize', resizeMap);
      resizeMap();

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
    });
    $(function() {
      $( "#draggable" ).draggable({ iframeFix: '#eupathdb-PathwayRecord-cytoscapeweb embed' });
    });
  },

  render() {
    let titleClass = 'eupathdb-PathwayRecord-title';
    let projectId = wdk.MODEL_NAME;
    let { record, questions, recordClasses } = this.props;
    let { attributes, tables } = record;
    let {
      primary_key,
      pathway_source
      } = attributes;

    let {
      PathwayGraphs
      } = tables;
    let red = {color: 'red'};
    return (
      <div>
        <div id="draggable">
          <p>
            Click on nodes for more info.
            <br />Nodes highlighted in <span style={red}>red</span> are EC numbers that we have mapped to at least one gene.
            <br />The nodes, as well as this info box, can be repositioned by dragging.
            <br />
          </p>
        </div>
        {this.renderVisMenu(pathway_source, primary_key, PathwayGraphs, projectId)}
        <div align="right">
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
        <div id={div_id}>
          Cytoscape Web will replace the contents of this div with your graph.
        </div>

      </div>
    );
  },


  renderVisMenu(pathway_source, primary_key, PathwayGraphs, projectId) {
    return(
      <ul id="vis-menu" className="sf-menu">
        <li>
          <a href="#">File</a>
          <ul>
            <li>
              <a href={"/common/downloads/Current_Release/pathwayFiles/" + primary_key + ".xgmml"}>
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
              <li><a href="javascript:void(0)" onClick={() => vis.changeLayout('Preset')}>Kegg</a></li> :
              ""
            }
            <li><a  href="javascript:void(0)" onClick={() => vis.changeLayout('ForceDirected')}>ForceDirected</a></li>
            <li><a href="javascript:void(0)" onClick={() => vis.changeLayout('Tree')}>Tree</a></li>
            <li><a href="javascript:void(0)" onClick={() => vis.changeLayout('Circle')}>Circle</a></li>
            <li><a href="javascript:void(0)" onClick={() => vis.changeLayout('Radial')}>Radial</a></li>
          </ul>
        </li>
        <li>
          <a href="javascript:void(0)">
            Paint Experiment
            <Image title="Choose an Experiment, to display its (average) expression profile on enzymes in the Map"  src="wdk/images/question.png" />
          </a>
          <ul>
            <li><a href="javascript:void(0)" onClick={() => vis.changeExperiment('')}>None</a></li>
            {PathwayGraphs.map(graph => this.renderPathwayGraph(graph))}
          </ul>
        </li>
        <li>
          <a href="#">
            Paint Genera
            <Image title="Choose a Genera set, to display the presence or absence of these for all enzymes in the Map "  src="wdk/images/question.png" />
          </a>
          <ul>
            <li>
              <a href="javascript:void(0)" onClick={() => vis.changeExperiment('')}>
                None
              </a>
            </li>
            {projectId === 'AmoebaDB' ?
              <li>
                <a href="javascript:void(0)" onClick={() => vis.changeExperiment('type=PathwayGenera&project_id=' + projectId + '&sid=Acanthamoeba,Entamoeba,Naegleria,Vitrella,Chromera,Homo,Mus', 'genus', '1')}>
                  Acanthamoeba,Entamoeba,Human,Mouse
                </a>
              </li> :
              ""
            }
            {(projectId === 'CryptoDB' || projectId === 'PiroplasmaDB' || projectId === 'PlasmoDB' || projectId === 'ToxoDB') ?
              <li>
                <a href="javascript:void(0)" onClick={() => vis.changeExperiment('type=PathwayGenera&project_id=' + projectId + '&sid=Babesia,Cryptosporidium,Eimeria,Gregarina,Neospora,Plasmodium,Theileria,Toxoplasma', 'genus', '1')}>
                  Apicomplexa
                </a>
              </li> :
              ""
            }
            {(projectId === 'CryptoDB' || projectId === 'PiroplasmaDB' || projectId === 'PlasmoDB' || projectId === 'ToxoDB') ?
              <li>
                <a href="javascript:void(0)" onClick={() => vis.changeExperiment('type=PathwayGenera&project_id=' + projectId + '&sid=Cryptosporidium,Plasmodium,Toxoplasma,Homo,Mus', 'genus','1')}>
                  Cryp,Toxo,Plas,Human,Mouse
                </a>
              </li> :
              ""
            }
          </ul>
        </li>
      </ul>
    );
  },

  renderPathwayGraph(graph) {
    return(
      <li key={graph.internal}>
        <a href="javascript:void(0)"
           onClick={() => vis.changeExperiment(graph.internal + "," + graph.xaxis_description)} >
          {graph.display_name}
        </a>
      </li>
    )
  }



});

