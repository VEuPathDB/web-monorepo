/* global ChemDoodle */
import * as QueryString from 'querystring';
import React from 'react';
import PropTypes from 'prop-types';
import { flow, uniqueId } from 'lodash';
import $ from 'jquery';
import { safeHtml } from 'wdk-client/ComponentUtils';
import { loadChemDoodleWeb } from '../common/Compound';
import { CategoriesCheckboxTree, Link, Dialog } from 'wdk-client/Components';
import { withStore, withActions } from 'ebrc-client/util/component';
import * as Ontology from 'wdk-client/OntologyUtils';
import * as Category from 'wdk-client/CategoryUtils';
import Menu from 'ebrc-client/components/Menu';

// include menu bar files
import 'site/wdkCustomization/css/pathway.css';

export const RECORD_CLASS_NAME = 'PathwayRecordClasses.PathwayRecordClass';

const EC_NUMBER_SEARCH_PREFIX = '/processQuestion.do?questionFullName=' +
  'GeneQuestions.InternalGenesByEcNumber&organism=all&array%28ec_source%29=all' +
  '&questionSubmit=Get+Answer&ec_number_pattern=N/A&ec_wildcard=';

const ORTHOMCL_LINK = 'http://orthomcl.org/orthomcl/processQuestion.do?questionFullName=' +
  'GroupQuestions.ByEcNumber&questionSubmit=Get+Answer&ec_number_type_ahead=N/A&ec_wildcard=*';

function loadCytoscapeJs() {
  return new Promise(function(resolve, reject) {
    try {
      require([ 'cytoscape', 'cytoscape-dagre', 'ciena-dagre/lib', 'cytoscape-panzoom', 'cytoscape-panzoom/cytoscape.js-panzoom.css' ], function(cytoscape, cyDagre, dagre, panzoom) {
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

        var widthPadding = 35;
        var defaultScaling = 0.75;
        var maxSize = 100;

        obj.width = (xy.x + widthPadding) * defaultScaling;
        obj.height = (xy.y + widthPadding)  * defaultScaling;

        // scale further if width above a max
        if(obj.width > maxSize || obj.height > maxSize) {
            var widthScalingFactor = maxSize / obj.width ;
            var heightScalingFactor = maxSize / obj.height ;

            var scalingFactor = Math.min(widthScalingFactor, heightScalingFactor);
            obj.width = obj.width * scalingFactor;
            obj.height = obj.height * scalingFactor;
        }

    }


    return { data:obj,  renderedPosition:{x:obj.x, y:obj.y }, position:{x:obj.x, y:obj.y }};
}

function makeEdge(obj) {
    return { data:obj };
}

function mean(array) {
    return (array.reduce(function(a, b) { return (parseFloat(a) + parseFloat(b)); }) / array.length);
}

function min(array) {
    return (array.reduce(function(a, b) {return (Math.min(parseFloat(a), parseFloat(b)))}));
}

function max(array) {
    return (array.reduce(function(a, b) {return (Math.max(parseFloat(a), parseFloat(b)))}));
}

function getCoords(nodes, pos) {
    return nodes.map(function(node) {
        return node.data(pos);
    });
}

function tagSides(nodes) {
    nodes.map(function(node) {
        node.data('side', 'true');
    });
}

function placeSideNodes (node, orientation, values) {
    getSideNodeCoords (node, orientation, values, 'in');
    getSideNodeCoords (node, orientation, values, 'out');
}

function getSideNodeCoords (node, orientation, values, direction) {
    var sideNodes = (direction === 'in') ? node.incomers('node[!x]') : node.outgoers('node[!x]');
    if (node.isChild()) {
        sideNodes = (direction === 'in') ? node.parent().children().incomers('node[!x]') : node.parent().children().outgoers('node[!x]');
    }
    var minVal = min(values);
    var split = ((max(values) - minVal) / (sideNodes.size() + 1));
    var count = 0;
    for (var i=0; i<sideNodes.size(); i++) {
        var sideNode =  sideNodes[i];
        var coord;
        var offset;
        //handle compound nodes with no coords that aren't leaves
        if (sideNode.connectedEdges().size() > 1) {
            if (orientation === 'vertical') {
                coord = (direction === 'in') ? mean(getCoords(node.incomers('node[?x]'), 'y')) : mean(getCoords(node.outgoers('node[?x]'), 'y'));
            } else {
                coord = (direction === 'in') ? mean(getCoords(node.incomers('node[?x]'), 'x')) : mean(getCoords(node.outgoers('node[?x]'), 'x'));
            }
            offset = 40 + (10*count);
            count ++;
        } else {
            coord = (minVal + (split * (i+1)));
            offset = 40;
        }
        if (orientation === 'vertical') {
            direction === 'in' ? sideNode.data('x', node.data('x') - offset) : sideNode.data('x', node.data('x') + offset);
            sideNode.data('y', coord);
        } else {
            direction === 'in' ? sideNode.data('y', node.data('y') - offset) : sideNode.data('y', node.data('y') + offset);
            sideNode.data('x', coord);
        }
        sideNode.renderedPosition({x: sideNode.data('x'), y: sideNode.data('y') });
        sideNode.style({'label':null, shape: 'ellipse',width:'label',height:'label', 'background-color':'white','background-image-opacity':0,'border-width':0, 'color':'grey'});
        sideNode.connectedEdges().style({'line-color':'grey', 'mid-target-arrow-color':'grey'});
    }
}


function resetOverlappingNodes(node, offset) {
    if (node.data('placed') === 'true') {
        node.data('x', node.data('x') + offset);
        node.renderedPosition({x: node.data('x'), y: node.data('y')});
        nullSides(node);
        (node.data('orientation') === 'vertical') ? placeSideNodes(node, node.data('orientation'), node.data('yVals')) : placeSideNodes(node, node.data('orientation'), node.data('xVals'));
    }
}

function nullSides(node) {
    node.incomers('node[?side]').data({x: null, y: null});
    node.outgoers('node[?side]').data({x: null, y: null});
}

function makeCy(container, pathwayId, pathwaySource, PathwayNodes, PathwayEdges, name) {

  return Promise.all([loadCytoscapeJs(), loadChemDoodleWeb()])
    .then(function([ cytoscape ]) {

    var myLayout = {
        name: 'preset',
        fit: false,
    };


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
                selector: 'node[node_type= "pathway_internal"]',
                style: {
                    'display': 'none',
                },
            },

            {
                selector: 'node[node_type= "molecular entity"][?image]',
                style: {
                    shape: 'rectangle',
                    width:'data(width)',
                    height:'data(height)',
                    'border-width':0,
                    'background-color': 'white',
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
              selector: 'node[node_type= "enzyme"][gene_count > 0]',
              style: {
                'border-color':'red',
              },
            },

            {
                selector: 'node.eupathdb-CytoscapeHighlightNode',
                style: {
                    'border-color': 'purple',
                    'border-width': '4px'
                },
            },

            {
                selector: 'node.eupathdb-CytoscapeActiveNode',
                style: {
                    'border-width': '6px',
                },
            },

            {
                selector: 'node:selected',
                style: {
                    'overlay-color': '#2196F3',
                    'overlay-opacity': .3,
                    'overlay-padding': 0
                },
           },

        ],
        layout:myLayout,
        zoom:0.5
    });


        cy.ready(function () {

            cy.changeLayout = function (val) {

                cy.zoom(0.5);
                if (val === 'preset') {
                    cy.nodes().map(function(node){node.renderedPosition({x:node.data("x"), y:node.data("y")})});
                    cy.elements('node[node_type= "nodeOfNodes"]').layout({name: 'cose' });
                }

                else if (val === 'dagre') {
                    cy.layout({name:val, rankDir:'LR'});
                }

                else {
                    cy.layout({name:val});
                }
            };

            cy.changeExperiment = function (linkPrefix, xaxis, doAllNodes) {

                var nodes = cy.elements('node[node_type= "enzyme"]');

                for (var i=0; i < nodes.length; i++) {
                    var n = nodes[i];

                    var ecNum = n.data('display_label');

                    if (linkPrefix && (doAllNodes || n.data("gene_count") > 0 )) {
                        var link = linkPrefix + ecNum;
                        var smallLink = link + '&h=20&w=50&compact=1';

                        n.data('image', link);
                        n.data('hasImage', true);
                        n.style({
                            'background-image':smallLink,
                            'background-fit':'contain',
                        });
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
                cy.nodes('node[node_type="enzyme"]').map(function(node) {
                    //if node is a child, get the parent
                    node = (node.isChild()) ? node.parent()[0] : node;

                    //tag sides so non-leaf sides are only positioned once
                    tagSides(node.incomers('node[!x]'));
                    tagSides(node.outgoers('node[!x]'));

                    //for each enzyme, get all incoming and outgoing nodes with coordinates
                    var incomingNodes = node.incomers('node[?x][!side]');
                    var outgoingNodes = node.outgoers('node[?x][!side]');

                    //extract coordinates
                    var xValuesIn = getCoords(incomingNodes, 'x');
                    var xValuesOut = getCoords(outgoingNodes, 'x');
                    var yValuesIn = getCoords(incomingNodes, 'y');
                    var yValuesOut = getCoords(outgoingNodes, 'y');

                    //only reposition if enzyme has an incomer and and outgoer with coords
                    if (incomingNodes.size() >= 1 && outgoingNodes.size() >= 1) {
                        var meanX = mean(xValuesIn.concat(xValuesOut));
                        var meanY = mean(yValuesIn.concat(yValuesOut));
                        var orientation = (Math.abs(mean(xValuesIn) - mean(xValuesOut)) >= Math.abs(mean(yValuesIn) - mean(yValuesOut))) ? 'horizontal' : 'vertical';

                        if (node.data('placed') != 'true') {
                            node.data('x', meanX);
                            node.data('y', meanY);
                            node.renderedPosition({ x:meanX, y:meanY});
                            //flag node as places to avoid repeatedly placing parent nodes
                            node.data('placed', 'true'); //change to use boolean instead of text
                            //if node is a parent, place the children
                            if (node.isParent()) {
                                //use i to ensure child nodes aren't placed on top of each other
                                //TODO right now stacked vertically - may need to do something else if many children
                                for (var i=0; i<node.children().size(); i++) {
                                    node.children()[i].data('x', meanX);
                                    node.children()[i].data('y', ((i*15) + meanY));
                                    node.children()[i].renderedPosition({ x:meanX, y:((i*15) + meanY)});
                                    node.data('placed', 'true'); //use boolean
                                    node.children()[i].data('placed', 'true'); //use boolean
                                    (orientation === 'vertical') ? placeSideNodes(node.children()[i], orientation, yValuesIn.concat(yValuesOut)) : placeSideNodes(node.children()[i], orientation, xValuesIn.concat(xValuesOut));
                                }
                            }
                        }

                        //place side nodes
                        (orientation === 'vertical') ? placeSideNodes(node, orientation, yValuesIn.concat(yValuesOut)) : placeSideNodes(node, orientation, xValuesIn.concat(xValuesOut));
                        node.data('orientation', orientation);
                        node.data('xVals', xValuesIn.concat(xValuesOut));
                        node.data('yVals', yValuesIn.concat(yValuesOut));
                    }
                });

                //reset nodes that overlap
                var enzymeNodes = cy.nodes('node[node_type="enzyme"]');
                for (var i=0; i < enzymeNodes.size(); i++) {
                    for (var j=0; j < enzymeNodes.size(); j++) {
                        //find enzyme nodes with identical coords and reset
                        if (enzymeNodes[i].id() != enzymeNodes[j].id() && enzymeNodes[i].data('x') === enzymeNodes[j].data('x') && enzymeNodes[i].data('y') === enzymeNodes[j].data('y')) {
                            resetOverlappingNodes(enzymeNodes[i], -60);
                            resetOverlappingNodes(enzymeNodes[j], 60);
                        }
                    }
                }

                //Handle nodes with no preset position
                cy.elements('node[!x]').layout({ name: 'cose' });

                //clean up unplaces and orphan nodes
                enzymeNodes.map(function(node) {
                    if (node.data('placed') != 'true') {
                        cy.remove(node);
                        if (node.isChild()) {
                            cy.remove(node.parent());
                        }
                    }
                });

                cy.nodes('node[node_type= "molecular_entity"]').map(function(node) {
                    if (node.incomers().size() === 0 && node.outgoers().size() === 0) {
                        cy.remove(node);
                    }
                });

            }

            var nodesOfNodes = cy.nodes('node[node_type= "nodeOfNodes"]');
            for (var i=0; i < nodesOfNodes.length; i++) {
                var parent = nodesOfNodes[i];
                var children = parent.children().map(function(child) {
                    return child.data("node_identifier");
                });
                parent.data("childenNodes", children.join('<br>'));
            }

            cy.boxSelectionEnabled(true);

        });
        cy.add([{group: "nodes", data: {id: pathwayId + '_' + pathwaySource, name: name, node_type: 'pathway_internal'}}]);
        return cy;

    });
}

function readEcNumbers(dynamicColsOfIncomingStep) {
  return [
    ...new Set(dynamicColsOfIncomingStep
    .filter(row => row.ec_numbers_derived != null)
    .map(row => row.ec_numbers_derived.split(' ')[0]))
  ].join(',');
}

// enhance function supplements a component with additional custom data and AC props
const enhance = flow(
  // pulls custom values out of store's state and will pass as props to enhanced component
  withStore(state => ({
    pathwayRecord: state.pathwayRecord,
    config: state.globalData.config,
    siteConfig: state.globalData.siteConfig,
    nodeList: readEcNumbers(state.dynamicColsOfIncomingStep),
    dynamicColsOfIncomingStep: state.dynamicColsOfIncomingStep,
    experimentCategoryTree: getExperimentCategoryTree(state),
    generaCategoryTree: getGeneraCategoryTree(state)
  })),
  // wraps these raw ACs with dispatchAction and will pass as props to enhanced component
  withActions({
    setActiveNodeData,
    setPathwayError,
    setGeneraSelection
  })
);

const SELECTORS = {
  GENERA: 'genera',
  GRAPH: 'graph'
};

const CytoscapeDrawing = enhance(class CytoscapeDrawing extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      openSelector: null,
    };
    this.clearActiveNodeData = this.clearActiveNodeData.bind(this);
    this.onGeneraChange = this.onGeneraChange.bind(this);
    this.onExperimentChange = this.onExperimentChange.bind(this);
  }

  componentDidMount() {
    this.initVis();
  }

  initVis() {
    let { primary_key, source, name } = this.props.record.attributes;
    let { PathwayNodes, PathwayEdges } = this.props.record.tables;

    makeCy(this.refs.cytoContainer, primary_key, source, PathwayNodes, PathwayEdges, name)
      .then(cy => {

        // listener for when nodes and edges are clicked
        // The nodes collection event listener will be called before the
        // unrestricted event listener that follows below. Since we don't
        // want the latter to be called after the former, we are invoking
        // the `event.stopPropagation()` method so it is not triggered.

        cy.nodes().on('tap', withoutModifier(event => {
          var node = event.cyTarget;
          this.props.setActiveNodeData(Object.assign({}, node.data()));
          cy.nodes().removeClass('eupathdb-CytoscapeActiveNode');
          node.addClass('eupathdb-CytoscapeActiveNode');
          event.stopPropagation();
        }));

        cy.on('tap', withoutModifier(() => {
          cy.nodes().removeClass('eupathdb-CytoscapeActiveNode');
          this.props.setActiveNodeData(null);
        }));

        // dispatch action when active node data changes
        cy.on('data', 'node.eupathdb-CytoscapeActiveNode', event => {
          const { activeNodeData } = this.props.pathwayRecord;
          if (activeNodeData && activeNodeData.id === event.cyTarget.data('id')) {
            this.props.setActiveNodeData(Object.assign({}, event.cyTarget.data()));
          }
        });

        cy.minZoom(0.1);
        cy.maxZoom(2);
        cy.panzoom({
          minZoom: 0.1,
          maxZoom: 2
        });
        cy.fit();


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
    this.setState({ openSelector: null });
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
          webAppUrl={this.props.siteConfig.webAppUrl}
          primary_key={primary_key}
          projectId={projectId}
          onGeneraSelectorClick={() => this.setState({ openSelector: SELECTORS.GENERA })}
          onGraphSelectorClick={() => this.setState({ openSelector: SELECTORS.GRAPH })}
          cy={this.state.cy}
        />
        <div className="eupathdb-PathwayRecord-cytoscapeIcon">
            <a href="http://js.cytoscape.org/">

              <img src={this.props.siteConfig.webAppUrl + "/images/cytoscape-logo.png"} alt="Cytoscape JS" width="42" height="42"/>
          </a>
        <br/>
          Cytoscape JS
        </div>
        <Dialog
          title="Genera Selector"
          open={this.state.openSelector === SELECTORS.GENERA}
          onClose={() => this.setState({ openSelector: null })}
          draggable
        >
          <GraphSelector
            isMultiPick
            displayName="Genera"
            graphCategoryTree={this.props.generaCategoryTree}
            onChange={this.onGeneraChange}
          />
        </Dialog>
        <Dialog
          title="Experiment Selector"
          open={this.state.openSelector === SELECTORS.GRAPH}
          onClose={() => this.setState({ openSelector: null })}
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
              wdkConfig={this.props.siteConfig}
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
  var jsonKeys = ['elements', 'nodes', 'data', 'id', 'display_label', 'parent', 'cellular_location', 'node_type', 'x', 'y', 'name', 'node_identifier', 'position', 'edges', 'is_reversible', 'source', 'target', 'reaction_source_id'];
  return(
    <Menu
      webAppUrl={props.webAppUrl}
      projectId={props.projectId}
      items={[
        {
          text: 'File',
          children: [
            {
              text: 'PNG',
              url: '#',
              onClick(event) {
                event.currentTarget.href = cy.png();
                event.currentTarget.download = primary_key + '.png';
              }
            }, {
              text: 'JPG',
              url: '#',
              onClick(event) {
                event.currentTarget.href = cy.jpg();
                event.currentTarget.download = primary_key + '.jpg';
              }
            }, {
              text: 'JSON',
              url: '#',
              onClick(event) {
                event.currentTarget.href = 'data:application/json,' +
                  JSON.stringify(cy.json(), jsonKeys);
                event.currentTarget.download = primary_key + '.json';
              }
            }
          ]
        }, {
          text: (
            <span>Layout <img title="Choose a Layout for the Pathway Map"  src={props.webAppUrl + "/wdk/images/question.png"} /></span>
          ),
          children: [
            source === 'KEGG' ? {
              text: 'KEGG',
              url: '#kegg',
              onClick(event) {
                event.preventDefault();
                cy.changeLayout('preset');
              }
            } : null,
            {
              text: 'Directed Graph',
              url: '#dag',
              onClick(event) {
                event.preventDefault();
                cy.changeLayout('dagre');
              }
            }, {
              text: 'Compound Spring Embedder',
              url: '#cse',
              onClick(event) {
                event.preventDefault();
                cy.changeLayout('cose');
              }
            }, {
              text: 'Grid',
              url: '#grid',
              onClick(event) {
                event.preventDefault();
                cy.changeLayout('grid');
              }
            }
          ]
        }, {
          text: (
            <span>
              Paint Enzymes <img
                src={props.webAppUrl + "/wdk/images/question.png"}
                title={
                  `Choose an Experiment to display each enzyme's ` +
                  `corresponding average expression profile, or choose a ` +
                  `Genera set to display their presence or absence for ` +
                  `all enzymes in the Map`
                } />
            </span>
          ),
          children: [
            {
              text: 'Clear all',
              url: '#clear',
              onClick(event) {
                event.preventDefault();
                cy.changeExperiment('');
              }
            }, {
              text: 'By Experiment',
              url: '#experiment',
              onClick(event) {
                event.preventDefault();
                onGraphSelectorClick();
              }
            }, {
              text: 'By Genera',
              url: '#genera',
              onClick(event) {
                event.preventDefault();
                onGeneraSelectorClick();
              }
            }
          ]
        }
      ]}
    />
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
  nodeData: PropTypes.object.isRequired,
  pathwaySource: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
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
  return (
    <div>
      <div><b>Node Group: </b><p>{safeHtml(props.nodeData.childrenNodes)}</p>
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
      n('Macaca', 'Macaca'),
      n('Mus', 'Mus')
    ])
  ]);
}

function withoutModifier(f) {
  return function skipModified(event) {
    let { altKey, ctrlKey, metaKey, shiftKey } = event.originalEvent;
    if (!(altKey || ctrlKey || metaKey || shiftKey)) f(event);
  }
}
