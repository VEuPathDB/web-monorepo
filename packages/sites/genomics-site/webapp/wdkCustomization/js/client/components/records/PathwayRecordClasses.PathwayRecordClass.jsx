import React from 'react';
import { flow, uniqueId } from 'lodash';
import $ from 'jquery';
import {safeHtml} from 'wdk-client/ComponentUtils';
import {loadChemDoodleWeb} from '../common/Compound';
import { CheckboxList, CategoriesCheckboxTree, Link, Dialog } from 'wdk-client/Components';
import { withStore, withActions } from '../../util/component';
import * as Ontology from 'wdk-client/OntologyUtils';
import * as Category from 'wdk-client/CategoryUtils';

export const RECORD_CLASS_NAME = 'PathwayRecordClasses.PathwayRecordClass';

const EC_NUMBER_SEARCH_PREFIX = '/processQuestion.do?questionFullName=' +
  'GeneQuestions.InternalGenesByEcNumber&organism=all&array%28ec_source%29=all' +
  '&questionSubmit=Get+Answer&ec_number_pattern=N/A&ec_wildcard=';

const ORTHOMCL_LINK = 'http://orthomcl.org/orthomcl/processQuestion.do?questionFullName=' +
  'GroupQuestions.ByEcNumber&questionSubmit=Get+Answer&ec_number_type_ahead=N/A&ec_wildcard=*';

function loadCytoscapeJs() {
  return new Promise(function(resolve, reject) {
    try {
      require([ 'cytoscape', 'cytoscape-dagre', 'dagre', 'cytoscape-panzoom', 'cytoscape-panzoom/cytoscape.js-panzoom.css' ], function(cytoscape, cyDagre, dagre, panzoom) {
        panzoom(cytoscape, $);
        cyDagre(cytoscape, dagre);
        resolve(cytoscape);
      });
    }
    catch(err) {
      reject(err);
    }
  });
}




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

    if(obj.node_type == 'molecular entity' && obj.default_structure) {
        var structure = ChemDoodle.readMOL(obj.default_structure);
        structure.scaleToAverageBondLength(14.4);

        var xy = structure.getDimension();

        var uniqueChemdoodle = uniqueId('chemdoodle');

        var canvas = document.createElement("canvas");
        canvas.id =uniqueChemdoodle;

        document.body.appendChild(canvas);

        let vc = new ChemDoodle.ViewerCanvas(uniqueChemdoodle, xy.x + 35, xy.y + 35);

        document.getElementById(uniqueChemdoodle).style.visibility = "hidden";

        //the width of the bonds should be .6 pixels
        vc.specs.bonds_width_2D = .6;
        //the spacing between higher order bond lines should be 18% of the length of the bond
        vc.specs.bonds_saturationWidth_2D = .18;
        //the hashed wedge spacing should be 2.5 pixels
        vc.specs.bonds_hashSpacing_2D = 2.5;
        //the atom label font size should be 10
        vc.specs.atoms_font_size_2D = 10;
        //we define a cascade of acceptable font families
        //if Helvetica is not found, Arial will be used
        vc.specs.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
        //display carbons labels if they are terminal
        vc.specs.atoms_displayTerminalCarbonLabels_2D = true;
        //add some color by using JMol colors for elements
        vc.specs.atoms_useJMOLColors = true;

        vc.loadMolecule(structure);

        var dataURL = canvas.toDataURL();
        
        obj.image = dataURL;
        obj.width = (xy.x + 35) * .75;
        obj.height = (xy.y + 35)  * .75;
    }


    return { data:obj,  renderedPosition:{x:obj.x, y:obj.y }, position:{x:obj.x, y:obj.y }};
}

function makeEdge(obj) {
    return { data:obj };
}



function makeCy(container, pathwayId, pathwaySource, PathwayNodes, PathwayEdges) {

  return Promise.all([loadCytoscapeJs(), loadChemDoodleWeb()])
    .then(function([ cytoscape ]) {

        var myLayout = {
            name: 'dagre',
            rankDir:'LR',
        };

        if (pathwaySource === 'KEGG') {
            myLayout = {
                name: 'preset',
            };
        }

    var cy = cytoscape({
        container,

        elements:PathwayNodes.map(makeNode).concat(PathwayEdges.map(makeEdge)), 

        style: [

            {
                selector: 'edge',
                style: {
                    'line-color':'black',
                    'width':1,
                    'curve-style':'bezier',
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
                    'background-color': 'white',
                    label: 'data(display_label)',
                    width:50,
                    height:25,
                    'font-size':10
                },
            },





            {
                selector: 'node[node_type= "molecular entity"][?image]',
                style: {
                    shape: 'rectangle',
                    width:'data(width)',
                    height:'data(height)',
                    'border-width':0,
                    'background-image':'data(image)',
                    'background-fit':'contain',
                    label:'data(name)',
                    'text-valign': 'bottom',
                    'text-halign': 'center',
                    'text-margin-y':-9,
                    'font-size':6
                },
            },


            {
                selector: 'node[node_type= "molecular entity"][!image]',
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

          {
            selector: 'node.eupathdb-CytoscapeActiveNode',
            style: {
              'border-width': '6px',
            }
          },

            {
              selector: 'node[node_type= "enzyme"][gene_count > 0]',
              style: {
                'border-color':'red',
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
                    cy.elements('node[node_type= "nodeOfNodes"]').layout({ name: 'cose' });
                }

                if(val === 'dagre') {
                    cy.layout({name:val, rankDir:'LR'});
                }

                else {
                    cy.layout({name:val});
                    }

            };

            cy.changeExperiment = function (linkPrefix, xaxis, doAllNodes) {

                var nodes = cy.elements('node[node_type= "enzyme"]');

                for (var i = 0; i < nodes.length; i++) {

                    var n = nodes[i];

                    var ecNum = n.data("display_label");

                    if (linkPrefix && (doAllNodes || n.data("gene_count") > 0 )) {
                        var link = `${linkPrefix}${ecNum}&h=20&w=50&compact=1`;

                        n.data('image', linkPrefix);

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
                        n.data('image', null);
                    }
                }

                cy.style().selector('node[node_type= "enzyme"][!hasImage]').style({'label':'data(display_label)', 'background-image-opacity':0}).update();
                cy.style().selector('node[node_type= "enzyme"][?hasImage]').style({'label':null}).update();
            };


            if (pathwaySource !== 'KEGG') {
                // Find all enzymes which have an input which is a non root compound and  change node shape for input compounds which are roots
                // Do the same for leaves
                // the effect here is to hide side compounds 
                cy.nodes('node[node_type= "molecular entity"]').subtract(cy.nodes('node[node_type= "molecular entity"]').roots()).outgoers('node[node_type="enzyme"]').incomers('node[node_type= "molecular entity"]').roots().style({'label':null, shape: 'ellipse','background-color': '#0000ff',width:15,height:15, 'background-image-opacity':0,});
                cy.nodes('node[node_type= "molecular entity"]').subtract(cy.nodes('node[node_type= "molecular entity"]').leaves()).incomers('node[node_type="enzyme"]').outgoers('node[node_type= "molecular entity"]').leaves().style({'label':null, shape: 'ellipse','background-color': '#0000ff',width:15,height:15, 'background-image-opacity':0,});
            }
           

            var nodesOfNodes = cy.nodes('node[node_type= "nodeOfNodes"]');
            for (var i = 0; i < nodesOfNodes.length; i++) {
                var parent = nodesOfNodes[i];
                var children = parent.children().map(function(child) {
                    return child.data("node_identifier");
                });

                
                parent.data("childrenNodes", children.join('<br>'));
            }
        });

        return cy;

    });
}

const getGraphCategoryTree = state =>
  Ontology.getTree(state.globalData.ontology, Category.isQualifying({
    recordClassName: state.recordClass.name,
    targetType: 'attribute',
    scope: 'graph-internal'
  }))

const enhance = flow(
  withStore(state => ({
    pathwayRecord: state.pathwayRecord,
    config: state.globalData.config,
    nodeList: state.globalData.location.query.node_list,
    graphCategoryTree: getGraphCategoryTree(state)
  })),
  withActions({
    setActiveNodeData,
    setPathwayError,
    setGeneraSelection
  })
);

const CytoscapeDrawing = enhance(class CytoscapeDrawing extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      generaSelectorOpen: false
    };
    this.clearActiveNodeData = this.clearActiveNodeData.bind(this);
    this.paintCustomGenera = this.paintCustomGenera.bind(this);
    this.onGeneraChange = this.onGeneraChange.bind(this);
    this.onGraphChange = this.onGraphChange.bind(this);
  }

  componentDidMount() {
    this.initMenu();
    this.initVis();
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
    let { primary_key, source } = this.props.record.attributes;
    let { PathwayNodes, PathwayEdges } = this.props.record.tables;

    makeCy(this.refs.cytoContainer, primary_key, source, PathwayNodes, PathwayEdges)
      .then(cy => {

        // listener for when nodes and edges are clicked
        // The nodes collection event listener will be called before the
        // unrestricted event listener that follows below. Since we don't
        // want the latter to be called after the former, we are invoking
        // the `event.stopPropagation()` method so it is not triggered.

        cy.nodes().on('tap', event => {
          var node = event.cyTarget;
          this.props.setActiveNodeData(Object.assign({}, node.data()));
          cy.nodes().removeClass('eupathdb-CytoscapeActiveNode');
          node.addClass('eupathdb-CytoscapeActiveNode');
          event.stopPropagation();
        });

        cy.on('tap', () => {
          cy.nodes().removeClass('eupathdb-CytoscapeActiveNode');
          this.props.setActiveNodeData(null);
        });

        // dispatch action when active node data changes
        cy.on('data', 'node.eupathdb-CytoscapeActiveNode', event => {
          const { activeNodeData } = this.props.pathwayRecord;
          if (activeNodeData && activeNodeData.id === event.cyTarget.data('id')) {
            this.props.setActiveNodeData(Object.assign({}, event.cyTarget.data()));
          }
        });

        cy.panzoom();

        this.setState({ cy });
      })
      .catch(error => {
        this.props.setPathwayError(error);
      });
  }

  clearActiveNodeData() {
    this.props.setActiveNodeData(null);
  }

  onGeneraChange(newSelections) {
    this.props.setGeneraSelection(newSelections);
  }

  onGraphChange(graph) {
    this.setState({graphSelectorOpen: false});
    this.state.cy.changeExperiment(this.props.record.attributes[graph]);
  }

  paintCustomGenera(generaSelection, projectId, cy) {
    let sid = generaSelection.join(",");
    let arg = "type=PathwayGenera&project_id=" + projectId + "&sid=" + sid;
    cy.changeExperiment( arg, 'genus' , '1');
    this.setState({ generaSelectorOpen: false });
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
    if (this.props.pathwayRecord.error) {
      return (
        <div style={{color: 'red' }}>
          Error: The Pathway Network could not be loaded.
        </div>
      );
    }
  }

  render() {
    let { projectId } = this.props.config;
    let { record, graphCategoryTree } = this.props;
    let { attributes } = record;
    let { primary_key, source } = attributes;
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
        <VisMenu
          source={source}
          webAppUrl={this.props.config.webAppUrl}
          primary_key={primary_key}
          projectId={projectId}
          experimentData={experimentData}
          onGeneraSelectorClick={() => this.setState({ generaSelectorOpen: true })}
          onGraphSelectorClick={() => this.setState({graphSelectorOpen: true})}
          cy={this.state.cy}
        />
        <div className="eupathdb-PathwayRecord-cytoscapeIcon">
            <a href="http://js.cytoscape.org/">

                <img src={this.props.config.webAppUrl + "images/cytoscape-logo.png"} alt="Cytoscape JS" width="42" height="42"/>
          </a>
        <br/>
          Cytoscape JS
        </div>
        <Dialog
          title="Genera Selector"
          open={this.state.generaSelectorOpen}
          onClose={() => this.setState({ generaSelectorOpen: false })}
          draggable
        >
          <GeneraSelector generaOptions={generaOptions}
                          generaSelection={this.props.pathwayRecord.generaSelection}
                          onGeneraChange={this.onGeneraChange}
                          paintCustomGenera={this.paintCustomGenera}
                          cy={this.state.cy}
                          projectId={projectId} />
        </Dialog>
        <Dialog
          title="Experiment Selector"
          open={this.state.graphSelectorOpen}
          onClose={() => this.setState({graphSelectorOpen: false})}
        >
          <GraphSelector
            graphCategoryTree={graphCategoryTree}
            onChange={this.onGraphChange}
          />
        </Dialog>
        <div>
          <p>
            <strong>NOTE </strong>
            Click on nodes for more info.  Nodes highlighted in <span style={red}>red</span> are EC numbers that we
            have mapped to at least one gene. The nodes, as well as the info box, can be repositioned by dragging.
            <br />
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div ref="cytoContainer" className="eupathdb-PathwayRecord-CytoscapeContainer" />
          {this.props.pathwayRecord.activeNodeData && (
            <NodeDetails
              onClose={this.clearActiveNodeData}
              wdkConfig={this.props.config}
              nodeData={this.props.pathwayRecord.activeNodeData}
              pathwaySource={source}
            />
          )}
        </div>
      </div>
    );
  }
});

function VisMenu(props) {
  let { cy, source, primary_key, projectId, experimentData, onGeneraSelectorClick, onGraphSelectorClick } = props;
  return(
    <ul id="vis-menu" className="sf-menu">
      <li>
        <a>File</a>
        <ul>
          <li>
            <a href="#" download={primary_key + '.png'} onClick={event => event.target.href = cy.png()}>PNG</a>
          </li>
          <li>
            <a href="#" download={primary_key + '.jpg'} onClick={event => event.target.href = cy.jpg()}>JPG</a>
          </li>
          <li>
            <a href="#" download={primary_key + '.json'} onClick={event => event.target.href = 'data:application/json,' + JSON.stringify(cy.json())}>JSON</a>
          </li>
        </ul>
      </li>
      <li>
        <a>
          Layout <img title="Choose a Layout for the Pathway Map"  src={props.webAppUrl + "/wdk/images/question.png"} />
        </a>
        <ul>
          {source === "KEGG" ?
            <li key='Preset'><a href="javascript:void(0)" onClick={() => cy.changeLayout('preset')}>Kegg</a></li> :
            ""
          }
            <li key='dagre'><a href="javascript:void(0)" onClick={() => cy.changeLayout('dagre')}>Directed Graph</a></li>
            <li key='cose' ><a href="javascript:void(0)" onClick={() => cy.changeLayout('cose')}>Compound Spring Embedder</a></li>
            <li key='grid'><a href="javascript:void(0)" onClick={() => cy.changeLayout('grid')}>Grid</a></li>
        </ul>
      </li>
      <li>
        <a>
          Paint Experiment <img title="Choose an Experiment, to display its (average) expression profile on enzymes in the Map" src={props.webAppUrl + "/wdk/images/question.png"} />
        </a>
        <ul>
          <li>
            <a href="javascript:void(0)" onClick={() => cy.changeExperiment('')}>
              None
            </a>
          </li>
          <li>
            <a href="javascript:void(0)" onClick={onGraphSelectorClick}>
              Choose Experiment
            </a>
          </li>
        </ul>
      </li>
      <li>
        <a>
          Paint Genera <img title="Choose a Genera set, to display the presence or absence of these for all enzymes in the Map " src={props.webAppUrl + "/wdk/images/question.png"} />
        </a>
        <ExperimentMenuItems onGeneraSelectorClick={onGeneraSelectorClick} experimentData={experimentData} projectId={projectId} type="PathwayGenera" cy={cy} />
      </li>
    </ul>
  );
}

function ExperimentMenuItems(props) {
  let { experimentData, projectId, type, cy, onGeneraSelectorClick } = props;
  let entries = experimentData
    .filter(datum => {return datum.type === type && datum.projectIds.includes(projectId)})
    .reduce(function (arr, expt) {return arr.concat(expt.linkData)}, [])
    .map((item) => {
      let id = type + "_" + projectId + "_" + item.sid;
      let imageUrl = `/cgi-bin/dataPlotter.pl?idType=ec&fmt=png&type=${type}&project_id=${projectId}&sid=${item.sid}&id=`;
      return (
        <li key={id}>
          <a href='javascript:void(0)' onClick={() => cy.changeExperiment(imageUrl, 'genus' , '1')} >
            {item.display}
          </a>
        </li>
      );
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
        <a href="javascript:void(0)" onClick={onGeneraSelectorClick}>
          Custom Selection
        </a>
      </li>
    </ul>
  );
}

function GeneraSelector(props) {
  return (
    <div id="eupathdb-PathwayRecord-generaSelector">
      <CheckboxList
        name="genera"
        items={props.generaOptions}
        value={props.generaSelection}
        onChange={props.onGeneraChange}/>
      <input
        style={{ margin: '10px 0' }}
        type="submit"
        value="Paint"
        onClick={() => props.paintCustomGenera(props.generaSelection, props.projectId, props.cy)} />
    </div>
  );
}

class GraphSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expandedBranches: Category.getAllBranchIds(this.props.graphCategoryTree)
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleUiChange = this.handleUiChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
  }

  handleChange(selectedLeaves) {
    this.setState({selectedLeaves});
  }

  handleUiChange(expandedBranches) {
    this.setState({expandedBranches});
  }

  handleSubmit() {
    this.props.onChange(this.state.selectedLeaves[0]);
  }

  handleSearchTermChange(searchTerm) {
    this.setState({searchTerm});
  }

  render() {
    return (
      <div className="eupathdb-PathwayGraphSelector">
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <button
            type="submit"
            onClick={() => this.props.onChange(this.state.selectedLeaves[0])}
          >Paint</button>
        </div>
        <CategoriesCheckboxTree
          searchBoxPlaceholder="Search for graphs"
          autoFocusSearchBox
          tree={this.props.graphCategoryTree}
          leafType="graph"
          isMultiPick={false}
          selectedLeaves={this.state.selectedLeaves}
          expandedBranches={this.state.expandedBranches}
          searchTerm={this.state.searchTerm}
          onChange={this.handleChange}
          onUiChange={this.handleUiChange}
          onSearchTermChange={this.handleSearchTermChange}
        />
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <button
            type="submit"
            onClick={() => this.props.onChange(this.state.selectedLeaves[0])}
          >Paint</button>
        </div>
      </div>
    );
  }
}

/** Render pathway node details */
class NodeDetails extends React.Component {

  componentDidMount() {
    $(this.refs.container).draggable({ handle: this.refs.handle });
  }

  render() {
    const type = this.props.nodeData.node_type;
    const details = type === 'enzyme' ? <EnzymeNodeDetails {...this.props}/>
                : type === 'molecular entity' ? <MolecularEntityNodeDetails {...this.props}/>
                  : type === 'metabolic process' ? <MetabolicProcessNodeDetails {...this.props}/>
                  : type === 'nodeOfNodes' ? <NodeOfNodesNodeDetails {...this.props}/>
                : null;

    return (
      <div ref="container" className="eupathdb-PathwayNodeDetailsContainer">
        <div ref="handle" className="eupathdb-PathwayNodeDetailsHeader">
          <button
            type="button"
            style={{ position: 'absolute', right: 6, top: 3 }}
            onClick={this.props.onClose}
          ><i className="fa fa-close"/>
          </button>
          <div>Node Details</div>
        </div>
        <div style={{ padding: '12px' }}>{details}</div>
      </div>
    );
  }
}

NodeDetails.propTypes = {
  nodeData: React.PropTypes.object.isRequired,
  pathwaySource: React.PropTypes.string.isRequired,
  onClose: React.PropTypes.func.isRequired
};

function EnzymeNodeDetails(props) {
  let { display_label, name, gene_count, image } = props.nodeData;

  return (
    <div>
        <p><b>EC Number or Reaction:</b> 
	 <a href={'http://enzyme.expasy.org/EC/' + display_label}> {display_label}</a> </p>

      {name && (  
           <p><b>Enzyme Name:</b> {name}</p>
      )}  


      {gene_count > 0&& (
        <div>
            <a href={props.wdkConfig.webAppUrl + EC_NUMBER_SEARCH_PREFIX + display_label}>Show {gene_count} gene(s) which match this EC Number</a>
        </div>
      )}

      <p><a href={ORTHOMCL_LINK + display_label + '*'}>Search on OrthoMCL for groups with this EC Number</a></p>

      {image && (
        <div>
          <img src={image + '&fmt=png&h=250&w=350'}/>
        </div>

      )}
    </div>


  );
}

function MolecularEntityNodeDetails(props) {
  let { nodeData: { node_identifier, name, image } } = props;

  return (
    <div>
      <p><b>ID:</b> {node_identifier}</p>

      {name && (
           <p><b>Name:</b> {safeHtml(name)}</p>
      )}

      {node_identifier && (
        <div>
          <Link to={'/record/compound/' + node_identifier}>View on this site</Link>
        </div>
      )}


      {image && (
        <div>
          <img src={image}/>
        </div>
      )}

    </div>
  );
}

function MetabolicProcessNodeDetails(props) {
    let { nodeData: { name, display_label }, pathwaySource } = props;
    return (
        <div>
            <div><b>Pathway: </b>
                <Link to={'/record/pathway/' + pathwaySource + '/' + name}>{display_label}</Link>
            </div>
            <div><a href={'http://www.genome.jp/dbget-bin/www_bget?' + name}>View in KEGG</a></div>
        </div>
    );
}


function NodeOfNodesNodeDetails(props) {
    let { nodeData: { name, childrenNodes }, pathwaySource } = props;
    return (
        <div>
            <div><b>Node Group: </b><p>{safeHtml(childrenNodes)}</p>
            </div>
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

function setActiveNodeData(activeNodeData) {
  return {
    type: 'pathway-record/set-active-node',
    payload: { activeNodeData }
  };
}

function setPathwayError(error) {
  console.error(error);
  return {
    type: 'pathway-record/set-pathway-error',
    payload: { error }
  };
}

function setGeneraSelection(generaSelection) {
  return {
    type: 'pathway-record/genera-selected',
    payload: { generaSelection }
  };
}
