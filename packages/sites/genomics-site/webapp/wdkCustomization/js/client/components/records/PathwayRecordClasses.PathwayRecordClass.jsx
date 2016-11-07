/* global org */
import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import $ from 'jquery';
import {safeHtml} from 'wdk-client/ComponentUtils';
import {CompoundStructure} from '../common/Compound';
import { CheckboxList } from 'wdk-client/Components';

export const RECORD_CLASS_NAME = 'PathwayRecordClasses.PathwayRecordClass';

const EC_NUMBER_SEARCH_PREFIX = '/processQuestion.do?questionFullName=' +
  'GeneQuestions.InternalGenesByEcNumber&organism=all&array%28ec_source%29=all' +
  '&questionSubmit=Get+Answer&ec_number_pattern=N/A&ec_wildcard=';

let div_id = "eupathdb-PathwayRecord-cytoscapeweb";

let loadCytoscapeJs = _.once(function(webAppUrl) {
  return Promise.all([
    Promise.resolve($.getScript(webAppUrl + '/js/cytoscape.js')),
  ]);
});



                      let pathwayFilesBaseUrl = "/common/downloads/pathwayFiles/";
                                                let pathwayFileExt = ".xgmml";

let options = {
  // where you have the Cytoscape Web SWF
  swfPath: "/swf/CytoscapeWeb",
  //swfPath: "http://www.plasmodb.org/swf/CytoscapeWeb",
  // where you have the Flash installer SWF
  flashInstallerPath: "/swf/playerProductInstall"
  //flashInstallerPath: "http://www.plasmodb.org/swf/playerProductInstall"
};




// transform wdk row into Cyto Node
function makeNode(obj) {
    return { data:obj,  renderedPosition:{x:obj.x, y:obj.y }, position:{x:obj.x, y:obj.y }};
}

function makeEdge(obj) {
    return { data:obj };
}



function makeCy(pathwayId, pathwaySource, PathwayNodes, PathwayEdges, wdkConfig) {

    return loadCytoscapeJs(wdkConfig.webAppUrl).then(function() {

        var myLayout = {
            name: 'cose',
            randomize:true,
            
        };
        
        if (pathwaySource === 'KEGG') {
            myLayout = {
                name: 'preset',
            };
        }


    var cy = cytoscape({
        container: document.getElementById(div_id),

        elements:PathwayNodes.map(makeNode).concat(PathwayEdges.map(makeEdge)), 

        style: [

            {
                selector: 'edge',
                style: {
                    'line-color':'black',
                    'width':1,
                },
            },

            {
                selector: 'edge[is_reversible="1"]',
                style: {
                    'mid-target-arrow-shape':'triangle-backcurve',
                    'mid-source-arrow-shape':'triangle-backcurve',
                    'mid-source-arrow-color':'black',
                    'mid-target-arrow-color':'black',
                    'mid-source-arrow-fill':'hollow',
//                    'mid-source-arrow-shape':'triangle',
                },
            },
            {
                selector: 'edge[is_reversible="0"]',
                style: {
                    'mid-target-arrow-shape':'triangle-backcurve',
                    'mid-target-arrow-color':'black',
                },
            },

            {
                selector: 'node',
                style: {

                    'text-halign':'center',
                    'text-valign':'center',
                    'border-width':1,
                    'boder-style':'solid',
                    'boder-color':'black',
                    'padding-left':0,
                    'padding-right':0,
                    'padding-top':0,
                    'padding-bottom':0,
                },
            },
            
            {
                selector: 'node[node_type= "enzyme"]',
                style: {
                    shape: 'rectangle',
                    'background-color': '#ffffcc',
                    label: 'data(display_label)',
                    width:50,
                    height:20,
                    'font-size':11
                },
            },


            {
                selector: 'node[node_type= "molecular entity"]',
                style: {
                    shape: 'ellipse',
                    'background-color': '#0000ff',
                    width:15,
                    height:15,

                },
            },
            {
                selector: 'node[node_type= "metabolic process"]',
                style: {
                    shape: 'roundrectangle',
                    'background-color': '#ccffff',
                    width:'label',
                    height:'label',
                    label: 'data(display_label)',
                    'border-width':0,
                },
            },


        ] ,
        layout:myLayout,
        zoom:0.5
    });



        cy.ready(function () {

            cy.changeLayout = function (val) {

                cy.zoom(0.5);
                if(val === 'preset') {
                    cy.nodes().map(function(node){node.renderedPosition({x:node.data("x"), y:node.data("y")})});
                    cy.elements('node[node_type= "nodeOfNOdes"]').layout({ name: 'cose' });
                    }
                else {
                    cy.layout({name:val});
                    }

            };

            cy.changeExperiment = function (val, xaxis, doAllNodes) {

                var nodes = cy.elements('node[node_type= "enzyme"]');

                for (var i = 0; i < nodes.length; i++) {

                    var n = nodes[i];

                    var ecNum = n.data("node_identifier");

                    if (val && (doAllNodes || n.data("OrganismsInferredByOthoMCL") || n.data("Organisms"))) {
                        var linkPrefix = '/cgi-bin/dataPlotter.pl?idType=ec&' + val + '&id=' + ecNum;
                        var link = linkPrefix + '&fmt=png&h=20&w=50&compact=1';


                        n.data('hasImage', true);

                        n.style({
                            'background-image':link,
                            'background-fit':'contain',
                        });

                        
                        /* if (xaxis) {
                           n.data.xaxis = xaxis;
                           } else {
                           n.data.xaxis = "";
                           }

                           } else {
                           style.nodes[n.data.id] = {image: ""};
                           n.data.image = "";
                           n.data.xaxis = "";
                           }
                         */
                    }
                    else {
                        n.data('hasImage', false);


                    }

                }


                cy.style().selector('node[node_type= "enzyme"][!hasImage]').style({'label':'data(display_label)', 'background-image-opacity':0}).update();
                cy.style().selector('node[node_type= "enzyme"][?hasImage]').style({'label':null}).update();

            };


        });

        return cy;

    });
}



function _JB_makeVis(pathwayId, pathwaySource, wdkConfig) {
    return loadCytoscapeWeb(wdkConfig.webAppUrl).then(function() {
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
    let storeState = context.store.getState();
    this.state = storeState.pathwayRecord;
    this.wdkConfig = storeState.globalData.config;
  }

  componentDidMount() {
    let { store } = this.context;
    this.initMenu();
    this.initVis();
    $(this.detailContainer).draggable({
      iframeFix: '#eupathdb-PathwayRecord-cytoscapeweb embed'
    });
    this.storeSub = store.addListener(() => {
      this.setState(store.getState().pathwayRecord);
    });
  }

  componentWillUnmount() {
    this.storeSub.remove();
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
      let { PathwayNodes, PathwayEdges } = this.props.record.tables;
    makeCy(primary_key, pathway_source, PathwayNodes, PathwayEdges, this.wdkConfig).then(cy => {
      this.cy = cy;
      // listener for when nodes and edges are clicked

        cy.on("click", 'node[node_type= "molecular entity"]', {context:this.context, projectId:this.wdkConfig.projectId}, function(event) {

            var context = event.data.context;
            var projectId = event.data.projectId;
          var node = event.cyTarget;

            console.log("NODE");
            console.log(node);

            context.dispatchAction(setActiveNode(node));
            if (node.data("node_identifier")) {
                context.dispatchAction(loadCompoundStructure(node.data("node_identifier"), projectId));
            }
      });
    })
    .catch(error => {
      this.context.dispatchAction(setPathwayError(error));
    });
  }

  onGeneraChange(newSelections, dispatchAction) {
    dispatchAction({"type": 'pathway-record/genera-selected', "payload": {"generaSelection": newSelections}});
  }

  paintCustomGenera(generaSelection, projectId, vis) {
    let sid = generaSelection.join(",");
    let arg = "type=PathwayGenera&project_id=" + projectId + "&sid=" + sid;    
    vis.changeExperiment( arg, 'genus' , '1');
    $('#eupathdb-PathwayRecord-generaSelector-wrapper').hide();
  }

  loadGenera() {
    return [
      {value:'Acanthamoeba', display:'Acanthamoeba'},
      {value:'Entamoeba', display:'Entamoeba'},
      {value:'Naegleria', display:'Naegleria'},
      {value:'Cryptosporidium', display:'Cryptosporidium'},
      {value:'Chromera', display:'Chromera'},
      {value:'Vitrella', display:'Vitrella'},
      {value:'Eimeria', display:'Eimeria'},
      {value:'Gregarina', display:'Gregarina'},
      {value:'Neospora', display:'Neospora'},
      {value:'Toxoplasma', display:'Toxoplasma'},
      {value:'Plasmodium', display:'Plasmodium'},
      {value:'Babesia', display:'Babesia'},
      {value:'Theileria', display:'Theileria'},
      {value:'Giardia', display:'Giardia'},
      {value:'Spironucleus', display:'Spironucleus'},
      {value:'Crithidia', display:'Crithidia'},
      {value:'Leishmania', display:'Leishmania'},
      {value:'Trypanosoma', display:'Trypanosoma'},
      {value:'Anncaliia', display:'Anncaliia'},
      {value:'Edhazardia', display:'Edhazardia'},
      {value:'Encephalitozoon', display:'Encephalitozoon'},
      {value:'Enterocytozoon', display:'Enterocytozoon'},
      {value:'Nematocida', display:'Nematocida'},
      {value:'Nosema', display:'Nosema'},
      {value:'Spraguea', display:'Spraguea'},
      {value:'Vavraia', display:'Vavraia'},
      {value:'Vittaforma', display:'Vittaforma'},
      {value:'Schistosoma', display:'Schistosoma'},
      {value:'Aspergillus', display:'Aspergillus'},
      {value:'Phytophthora', display:'Phytophthora'},
      {value:'Pythium', display:'Pythium'},
      {value:'Aphanomyces', display:'Aphanomyces'},
      {value:'Saprolegnia', display:'Saprolegnia'},
      {value:'Neurospora', display:'Neurospora'},
      {value:'Albugo', display:'Albugo'},
      {value:'Fusarium', display:'Fusarium'},
      {value:'Coccidioides', display:'Coccidioides'},
      {value:'Talaromyces', display:'Talaromyces'},
      {value:'Trichomonas', display:'Trichomonas'},
      {value:'Homo', display:'Homo'},
      {value:'Mus', display:'Mus'}
    ];
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
    let { projectId } = this.wdkConfig;
    let { record } = this.props;
    let { attributes, tables } = record;
    let { primary_key, pathway_source } = attributes;
    let { PathwayGraphs } = tables;
    let red = {color: 'red'};
    let generaOptions = this.loadGenera();
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
            "sid": "Cryptosporidium,Toxoplasma,Plasmodium,Homo,Mus",
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
            ) : <NodeDetails wdkConfig={this.wdkConfig}
                             node={this.state.activeNode}
                             compoundRecord={this.state.activeCompound}
                             pathwaySource={pathway_source}/>}
        </div>
        <VisMenu pathway_source = {pathway_source}
                       webAppUrl={this.wdkConfig.webAppUrl}
                       primary_key = {primary_key}
                       PathwayGraphs = {PathwayGraphs}
                       projectId = {projectId}
                       experimentData = {experimentData}
                       cy={this.cy} />
        <div id="eupathdb-PathwayRecord-cytoscapeIcon">
          <a href="http://cytoscapeweb.cytoscape.org/">
            <img src="http://cytoscapeweb.cytoscape.org/img/logos/cw_s.png" alt="Cytoscape Web"/>
          </a>
        </div>
        <div id="eupathdb-PathwayRecord-generaSelector-wrapper">
          <GeneraSelector generaOptions={generaOptions}
                          generaSelection={this.state.generaSelection}
                          onGeneraChange={this.onGeneraChange}
                          paintCustomGenera={this.paintCustomGenera}
                          dispatchAction={this.context.dispatchAction}
                          cy={this.cy}
                          projectId={projectId} />
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
        </div>
      </div>
    );
  }
}

CytoscapeDrawing.contextTypes = {
  dispatchAction: React.PropTypes.func.isRequired,
  store: React.PropTypes.object.isRequired
};

function VisMenu(props) {
  let { cy, pathway_source, primary_key, PathwayGraphs, projectId, experimentData } = props;
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
          <img title="Choose a Layout for the Pathway Map"  src={props.webAppUrl + "/wdk/images/question.png"} />
        </a>
        <ul>
          {pathway_source === "KEGG" ?
            <li key='Preset'><a href="javascript:void(0)" onClick={() => cy.changeLayout('preset')}>Kegg</a></li> :
            ""
          }
            <li key='cose' ><a href="javascript:void(0)" onClick={() => cy.changeLayout('cose')}>Compound Spring Embedder</a></li>
            <li key='circle'><a href="javascript:void(0)" onClick={() => cy.changeLayout('circle')}>Circle</a></li>
            <li key='concentric'><a href="javascript:void(0)" onClick={() => cy.changeLayout('concentric')}>Concentric</a></li>
            <li key='breadthfirst'><a href="javascript:void(0)" onClick={() => cy.changeLayout('breadthfirst')}>Breadthfirst</a></li>
            <li key='grid'><a href="javascript:void(0)" onClick={() => cy.changeLayout('grid')}>Grid</a></li>
        </ul>
      </li>
      <li>
        <a href="javascript:void(0)">
          Paint Experiment
          <img
            title="Choose an Experiment, to display its (average) expression profile on enzymes in the Map"
            src={props.webAppUrl + "/wdk/images/question.png"}
          />
        </a>
        <ul>
          <li><a href="javascript:void(0)" onClick={() => cy.changeExperiment('')}>None</a></li>
          {PathwayGraphs.map(graph => <PathwayGraph key={graph.internal} graph={graph} cy={cy} />)}
        </ul>
      </li>
      <li>
        <a href="#">
          Paint Genera
          <img
            title="Choose a Genera set, to display the presence or absence of these for all enzymes in the Map " 
            src={props.webAppUrl + "/wdk/images/question.png"}
          />
        </a>
        <ExperimentMenuItems experimentData={experimentData} projectId={projectId} type="PathwayGenera" cy={cy} />
      </li>
    </ul>
  );
}

function PathwayGraph(props) {
  let {graph, cy} = props;
  return(
    <li>
      <a href="javascript:void(0)"
         onClick={() => cy.changeExperiment(graph.internal)} >
        {graph.display_name}
      </a>
    </li>
  )
}

function ExperimentMenuItems(props) {
  let { experimentData, projectId, type, cy } = props;
  let entries = experimentData
    .filter(datum => {return datum.type === type && datum.projectIds.includes(projectId)})
    .reduce(function (arr, expt) {return arr.concat(expt.linkData)}, [])
    .map((item) => {
      let id = type + "_" + projectId + "_" + item.sid;
      return (<li key={id}><a href='javascript:void(0)' onClick={() => cy.changeExperiment('type=' + type + '&project_id=' + projectId + '&sid=' + item.sid, 'genus' , '1')}>{item.display}</a></li>);
    });
  return(
    <ul>
      <li>
        <a href="javascript:void(0)" onClick={() => cy.changeExperiment('')}>
          None
        </a>
      </li>
      {entries}
      <li>
        <a href="javascript:void(0)" onClick={function() {$('#eupathdb-PathwayRecord-generaSelector-wrapper').show()}}>
          Custom Selection
        </a>
      </li>
    </ul>
  );
}

function GeneraSelector(props) {
  return (
    <div id="eupathdb-PathwayRecord-generaSelector">
      <h3>Genera Selector</h3>
      <div className="hideMenu" onClick={function() {$('#eupathdb-PathwayRecord-generaSelector-wrapper').hide()}}>
        X
      </div>
      <CheckboxList name="genera" items={props.generaOptions} value={props.generaSelection}
                    onChange={function(newSelections) { props.onGeneraChange(newSelections, props.dispatchAction)}}/>
      <input type="submit" value="Paint" onClick={function() { props.paintCustomGenera(props.generaSelection, props.projectId, props.cy) }} />
    </div>
  );
}

/** Render pathway node details */
function NodeDetails(props) {
  var Type = props.node.data("node_type");


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
  node: React.PropTypes.object.isRequired,
  pathwaySource: React.PropTypes.string.isRequired
};

function EnzymeNodeDetails(props) {
  let { node } = props;
  return (
    <div>
      <p><b>EC Number or Reaction:</b> {node.data.label}</p>

      {node.data.Description && (  
        <p><b>Enzyme Name or Description:</b> {node.data.Description}</p>
      )}  

      {node.data.Organisms && (
        <div>
          <b>Organism(s):</b>
          <ul>
            {node.data.Organisms.split(',').sort().map(organism => (
              <li key={organism}>{organism}</li>
            ))}
          </ul>
        </div>
      )}

      {node.data.OrganismsInferredByOthoMCL && (
        <div>
          <b>Organism(s) inferred from OrthoMCL:</b>
          <ul>
            {node.data.OrganismsInferredByOthoMCL.split(',').sort().map(organism => (
              <li key={organism}>{organism}</li>
            ))}
          </ul>
        </div>
      )}
    
      {node.data.Organisms && (
        <div>
          <a href={props.wdkConfig.webAppUrl + EC_NUMBER_SEARCH_PREFIX + node.data.label}>Search for Gene(s) By EC Number</a>
        </div>
      )}

      {node.data.image && (
        <div>
          <img src={node.data.image + '&fmt=png&h=250&w=350'}/>
          {node.data.xaxis && <div><b>x-axis</b>: {node.data.xaxis}</div>}
        </div>
      )}
    </div>
  );
}

function MolecularEntityNodeDetails(props) {
  let { node, compoundRecord, compoundError } = props;

    console.log(node);

  return (
    <div>
      <p><b>ID:</b> {node.data("node_identifier")}</p>

      {node.data("name") && (
        <p><b>Name:</b> {safeHtml(node.data("name"))}</p>
      )}

      {node.data("node_identifier") && (
        <div>
          <Link to={'/record/compound/' + node.data("node_identifier")}>View on this site</Link>
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
  let { node, pathwaySource } = props;
  return (
    <div>
      <div><b>Pathway: </b>
        <Link to={'/record/pathway/' + pathwaySource + '/' + node.data.Description}>{node.data.label}</Link>
      </div>
      <div><a href={'http://www.genome.jp/dbget-bin/www_bget?' + node.data.Description}>View in KEGG</a></div>
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
export function RecordAttributeSection(props) {
  if (props.attribute.name === 'drawing') {
    return (
      <div>
        <h4>{props.attribute.displayName}</h4>
        <CytoscapeDrawing {...props}/>
      </div>
    )
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

function loadCompoundStructure(compoundId, projectId) {
  let recordClassName = 'CompoundRecordClasses.CompoundRecordClass';
  let primaryKey = [
    { name: 'source_id', value: compoundId },
    { name: 'project_id', value: projectId }
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

