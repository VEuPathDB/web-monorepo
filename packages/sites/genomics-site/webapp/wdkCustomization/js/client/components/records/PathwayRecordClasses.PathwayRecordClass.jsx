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

let generaPresets = [
  {
    projectIds: ['AmoebaDB'],
    values: "Acanthamoeba,Entamoeba,Naegleria,Vitrella,Chromera,Homo,Mus",
    display: "Acanthamoeba,Entamoeba,Human,Mouse"
  },
  {
    projectIds: ['CryptoDB','PiroplasmaDB','PlasmoDB','ToxoDB'],
    values: "Babesia,Cryptosporidium,Eimeria,Gregarina,Neospora,Plasmodium,Theileria,Toxoplasma",
    display: "Apicomplexa"
  },
  {
    projectIds: ['CryptoDB','PiroplasmaDB','PlasmoDB','ToxoDB'],
    values: "Cryptosporidium,Toxoplasma,Plasmodium,Homo,Mus",
    display: "Cryp,Toxo,Plas,Human,Mouse"
  },
  {
    projectIds: ['GiardiaDB'],
    values: "Giardia,Spironucleus,Homo,Mus",
    display: "Giardia,Spironucleus,Human,Mouse"
  },
  {
    projectIds: ['FungiDB'],
    values: "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Homo,Mus",
    display: "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Human,Mouse"
  },
  {
    projectIds: ["MicrosporidiaDB"],
    values: "Anncaliia,Edhazardia,Encephalitozoon,Enterocytozoon,Nematocida,Nosema,Spraguea,Trachipleistophora,Vavraia,Vittaforma,Homo,Mus",
    display: "Microsporidia,Human,Mouse"
  },
  {
    projectIds: ["SchistoDB"],
    values: "Schistosoma,Homo,Mus",
    display: "Schistosoma,Human,Mouse"
  },
  {
    projectIds: ["TrichDB"],
    values: "Trichomonas,Homo,Mus",
    display: "Trichomonas,Human,Mouse"
  },
  {
    projectIds: ["TriTrypDB"],
    values: "Crithidia,Leishmania,Trypanosoma,Homo,Mus",
    display: "Crithidia,Leishmania,Trypanosoma,Human,Mouse"
  },
  {
    projectIds: ["TriTrypDB"],
    values: "Cryptosporidium,Plasmodium,Toxoplasma,Trypanosoma,Homo,Mus",
    display: "Cryp,Toxo,Plas,Tryp,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Acanthamoeba,Entamoeba,Naegleria,Vitrella,Chromera,Homo,Mus",
    display: "Acanthamoeba,Entamoeba,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Giardia,Spironucleus,Homo,Mus",
    display: "Giardia,Spironucleus,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Cryptosporidium,Plasmodium,Toxoplasma,Homo,Mus",
    display: "Cryp,Toxo,Plas,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Homo,Mus",
    display: "Albugo,Aphanomyces,Aspergillus,Coccidioides,Fusarium,Neurospora,Phytophthora,Pythium,Saprolegnia,Talaromyces,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Anncaliia,Edhazardia,Encephalitozoon,Enterocytozoon,Nematocida,Nosema,Spraguea,Trachipleistophora,Vavraia,Vittaforma,Homo,Mus",
    display: "Microsporidia,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Schistosoma,Homo,Mus",
    display: "Schistosoma,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Trichomonas,Homo,Mus",
    display: "Trichomonas,Human,Mouse"
  },
  {
    projectIds: ['HostDB'],
    values: "Crithidia,Leishmania,Trypanosoma,Homo,Mus",
    display: "Crithidia,Leishmania,Trypanosoma,Human,Mouse"
  }
];

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
                    'text-margin-y':-7,
                    'font-size':9,
                    'text-wrap':'wrap',
                    'text-max-width':'data(width)',

                },
            },


            {
                selector: 'node[node_type= "molecular entity"][!image]',
                style: {

                    shape: 'ellipse',
                    width:'label',
                    height:'label', 
                    'background-color':'white',
                    'background-image-opacity':0,
                    'border-width':0,
                    label:'data(name)'
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
              selector: 'node.eupathdb-CytoscapeHighlightNode',
              style: {
                'border-color': 'purple',
                'border-width': '4px'
              }
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
                        var link = linkPrefix + ecNum;
                        var smallLink = link + '&h=20&w=50&compact=1';

                        n.data('image', link);

                        n.data('hasImage', true);

                        n.style({
                            'background-image':smallLink,
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
                cy.nodes('node[node_type= "molecular entity"]').subtract(cy.nodes('node[node_type= "molecular entity"]').roots()).outgoers('node[node_type="enzyme"]').incomers('node[node_type= "molecular entity"]').roots().style({'label':null, shape: 'ellipse',width:'label',height:'label', 'background-color':'white','background-image-opacity':0,'border-width':0});
                cy.nodes('node[node_type= "molecular entity"]').subtract(cy.nodes('node[node_type= "molecular entity"]').leaves()).incomers('node[node_type="enzyme"]').outgoers('node[node_type= "molecular entity"]').leaves().style({'label':null, shape: 'ellipse',width:'label',height:'label', 'background-color':'white','background-image-opacity':0,'border-width':0});
            }
           

//'#0000ff'
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

const enhance = flow(
  withStore(state => ({
    pathwayRecord: state.pathwayRecord,
    config: state.globalData.config,
    nodeList: state.globalData.location.query.node_list,
    experimentCategoryTree: getExperimentCategoryTree(state),
    generaCategoryTree: getGeneraCategoryTree(state)
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
    this.onGeneraChange = this.onGeneraChange.bind(this);
    this.onExperimentChange = this.onExperimentChange.bind(this);
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

        //decorate nodes from node_list
        if(this.props.nodeList) {
          var nodesToHighlight = this.props.nodeList.split(/,\s*/g);
          cy.nodes().removeClass('eupathdb-CytoscapeHighlightNode');
          nodesToHighlight.forEach(function(n){
            cy.elements("node[node_identifier = '" + n + "']")
            .addClass('eupathdb-CytoscapeHighlightNode');
          });
        }

        this.setState({ cy });

      })
      .catch(error => {
        this.props.setPathwayError(error);
      });
  }

  clearActiveNodeData() {
    this.props.setActiveNodeData(null);
  }

  onExperimentChange(graph) {
    this.state.cy.changeExperiment(this.props.record.attributes[graph]);
    this.setState({graphSelectorOpen: false});
  }

  onGeneraChange(generaSelection) {
    let {projectId} = this.props.config;
    let sid = generaSelection.join(",");
    let imageLink = "/cgi-bin/dataPlotter.pl?idType=ec&fmt=png&type=PathwayGenera&project_id=" + projectId + "&sid=" + sid + "&id=";
    this.state.cy.changeExperiment( imageLink, 'genus' , '1');
    this.setState({ generaSelectorOpen: false });
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
    let { record, experimentCategoryTree } = this.props;
    let { attributes } = record;
    let { primary_key, source } = attributes;
    let red = {color: 'red'};
    let purple = {color: 'purple'};

    return (
      <div id="eupathdb-PathwayRecord-cytoscape">
        {this.renderError()}
        <VisMenu
          source={source}
          webAppUrl={this.props.config.webAppUrl}
          primary_key={primary_key}
          projectId={projectId}
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
          <GraphSelector
            isMultiPick
            displayName="Genera"
            graphCategoryTree={this.props.generaCategoryTree}
            onChange={this.onGeneraChange}
          />
          {/*<GeneraSelector generaOptions={generaOptions}
                          generaSelection={this.props.pathwayRecord.generaSelection}
                          presets={generaPresets.filter(preset => preset.projectIds.includes(projectId))}
                          onGeneraChange={this.onGeneraChange}
                          paintCustomGenera={this.paintCustomGenera}
                          cy={this.state.cy}
                          projectId={projectId} />*/}
        </Dialog>
        <Dialog
          title="Experiment Selector"
          open={this.state.graphSelectorOpen}
          onClose={() => this.setState({graphSelectorOpen: false})}
          draggable
        >
          <GraphSelector
            displayName="Experiments"
            graphCategoryTree={experimentCategoryTree}
            onChange={this.onExperimentChange}
          />
        </Dialog>
        <div>
          <p>
            <strong>NOTE </strong>
            Click on nodes for more info.  Nodes highlighted in <span style={red}>red</span> are EC numbers that we
            have mapped to at least one gene. The nodes, as well as the info box, can be repositioned by dragging.
          </p>

            {this.props.nodeList && (
                 <p>The following Nodes are being highlighted in <span style={purple}>purple:  {this.props.nodeList}</span>.</p>
            )}
            <br />
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
  let { cy, source, primary_key, onGeneraSelectorClick, onGraphSelectorClick } = props;
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
          Paint Enzymes <img src={props.webAppUrl + "/wdk/images/question.png"}
            title="Choose an Experiment to display each enzyme's corresponding average expression profile, or choose a Genera set to display their presence or absence for all enzymes in the Map"/>
        </a>
        <ul>
          <li>
            <a href="javascript:void(0)" onClick={() => cy.changeExperiment('')}>
              Clear all
            </a>
          </li>
          <li>
            <a href="javascript:void(0)" onClick={onGraphSelectorClick}>
              By Experiment
            </a>
          </li>
          <li>
            <a href="javascript:void(0)" onClick={onGeneraSelectorClick}>
              By Genera
            </a>
          </li>
        </ul>
      </li>
    </ul>
  );
}


function GeneraSelector(props) {
  return (
    <div id="eupathdb-PathwayRecord-generaSelector">
      <div className="eupathdb-PathwayGeneraInfo">
        <i
          className="fa fa-info-circle"
          style={{ color: 'blue' }}
        /> Choose a preconfigured selection, or make a custom selection below.
      </div>
      <div className="eupathdb-PathwayGeneraPresets">
        <h3 className="eupathdb-PathwayGeneraHeading">Preconfigured Selection</h3>
        <select
          className="eupathdb-PathwayGeneraPresetOptions"
          onChange={event => props.onGeneraChange(event.target.value.split(','))}
        >
          <option value="">None</option>
          {props.presets.map(preset =>
            <option key={preset.values} value={preset.values}>
              {preset.display}
            </option>
          )}
        </select>
      </div>
      <div className="eupathdb-PathwayGeneraCustom">
        <h3 className="eupathdb-PathwayGeneraHeading">Custom Selection</h3>
        <CheckboxList
          name="genera"
          items={props.generaOptions}
          value={props.generaSelection}
          onChange={props.onGeneraChange}/>
      </div>
      <div
        style={{ margin: '10px 0', textAlign: 'center' }}
      >
        <input
          type="submit"
          value="Paint"
          onClick={() => props.paintCustomGenera(props.generaSelection, props.projectId, props.cy)} />
      </div>
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
    this.props.onChange(this.props.isMultiPick ? this.state.selectedLeaves : this.state.selectedLeaves[0]);
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
            onClick={this.handleSubmit}
          >Paint</button>
        </div>
        <CategoriesCheckboxTree
          searchBoxPlaceholder={`Search for ${this.props.displayName}`}
          autoFocusSearchBox
          tree={this.props.graphCategoryTree}
          leafType="graph"
          isMultiPick={!!this.props.isMultiPick}
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
            onClick={this.handleSubmit}
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
          <img src={image + '&h=250&w=350'}/>
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
    let { nodeData: { name, node_identifier }, pathwaySource } = props;
    return (
        <div>
            <p><b>Pathway: </b>
                <Link to={'/record/pathway/' + pathwaySource + '/' + node_identifier}>{name}</Link>
            </p>

            <p><a href={'http://www.genome.jp/dbget-bin/www_bget?' + node_identifier}>View in KEGG</a></p>
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

function getExperimentCategoryTree(state) {
  return Ontology.getTree(state.globalData.ontology, Category.isQualifying({
    recordClassName: state.recordClass.name,
    targetType: 'attribute',
    scope: 'graph-internal'
  }))
}

// Alias used in getGeneraCategoryTree
//
// Category.createNode takes four params:
//   1. id
//   2. displayName
//   3. description (optional)
//   4. array of child nodes (optional)
const n = Category.createNode; // helper for below

/** Return a category tree for genera */
function getGeneraCategoryTree() {
  return n('genera', 'Genera', null, [
    n('Amoebozoa', 'Amoebozoa', null, [
      n('Acanthamoeba', 'Acanthamoeba'),
      n('Entamoeba', 'Entamoeba'),
      n('Naegleria', 'Naegleria')
    ]),
    n('Apicomplexa', 'Apicomplexa', null, [
      n('Babesia', 'Babesia'),
      n('Cryptosporidium', 'Cryptosporidium'),
      n('Eimeria', 'Eimeria'),
      n('Gregarina', 'Gregarina'),
      n('Neospora', 'Neospora'),
      n('Plasmodium', 'Plasmodium'),
      n('Theileria', 'Theileria'),
      n('Toxoplasma', 'Toxoplasma')
    ]),
    n('Chromerida', 'Chromerida', null, [
      n('Chromera', 'Chromera'),
      n('Vitrella', 'Vitrella')
    ]),
    n('Diplomonadida', 'Diplomonadida', null, [
      n('Giardia', 'Giardia'),
      n('Spironucleus', 'Spironucleus')
    ]),
    n('Fungi', 'Fungi', null, [
      n('Eurotiomycetes', 'Eurotiomycetes', null, [
        n('Aspergillus', 'Aspergillus'),
        n('Coccidioides', 'Coccidioides'),
        n('Talaromyces', 'Talaromyces')
      ]),
      n('Microsporidia', 'Microsporidia', null, [
        n('Anncaliia', 'Anncaliia'),
        n('Edhazardia', 'Edhazardia'),
        n('Encephalitozoon', 'Encephalitozoon'),
        n('Enterocytozoon', 'Enterocytozoon'),
        n('Nematocida', 'Nematocida'),
        n('Nosema', 'Nosema'),
        n('Spraguea', 'Spraguea'),
        n('Vavraia', 'Vavraia'),
        n('Vittaforma', 'Vittaforma')
      ]),
      n('Sordariomycetes', 'Sordariomycetes', null, [
        n('Fusarium', 'Fusarium'),
        n('Neurospora', 'Neurospora')
      ])
    ]),
    n('Kinetoplastida', 'Kinetoplastida', null, [
      n('Crithidia', 'Crithidia'),
      n('Leishmania', 'Leishmania'),
      n('Trypanosoma', 'Trypanosoma')
    ]),
    n('Oomycetes', 'Oomycetes', null, [
      n('Albugo', 'Albugo'),
      n('Aphanomyces', 'Aphanomyces'),
      n('Phytophthora', 'Phytophthora'),
      n('Pythium', 'Pythium'),
      n('Saprolegnia', 'Saprolegnia')
    ]),
    n('Trichomonadida', 'Trichomonadida', null, [
      n('Trichomonas', 'Trichomonas')
    ]),
    n('Schistosomatidae', 'Schistosomatidae', null, [
      n('Schistosoma', 'Schistosoma')
    ]),
    n('Mammalia', 'Mammalia', null, [
      n('Homo', 'Homo'),
      n('Mus', 'Mus')
    ])
  ]);
}
