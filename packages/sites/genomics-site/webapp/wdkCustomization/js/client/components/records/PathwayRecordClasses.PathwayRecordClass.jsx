/* global ChemDoodle */
import React from 'react';
import PropTypes from 'prop-types';
import { flow, uniqueId } from 'lodash';
import $ from 'jquery';
import { safeHtml } from 'wdk-client/ComponentUtils';
import { loadChemDoodleWeb } from '../common/Compound';
import { CategoriesCheckboxTree, Link, Loading, Dialog } from 'wdk-client/Components';
import { withStore, withActions } from 'ebrc-client/util/component';
import * as Ontology from 'wdk-client/OntologyUtils';
import * as Category from 'wdk-client/CategoryUtils';
import Menu from 'ebrc-client/components/Menu';

// include menu bar files
import 'site/wdkCustomization/css/pathway.css';

import * as QueryString from 'querystring';

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
        let structure = ChemDoodle.readMOL(obj.default_structure);
        structure.scaleToAverageBondLength(14.4);

        let xy = structure.getDimension();

        let uniqueChemdoodle = uniqueId('chemdoodle');

        let canvas = document.createElement("canvas");
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

        let dataURL = canvas.toDataURL();

        obj.image = dataURL;

        let widthPadding = 35;
        let defaultScaling = 0.5;
        let maxSize = 50;


        obj.width = (xy.x + widthPadding) * defaultScaling;
        obj.height = (xy.y + widthPadding)  * defaultScaling;


        // scale further if width above a max
        if(obj.width > maxSize || obj.height > maxSize) {
            let widthScalingFactor = maxSize / obj.width ;
            let heightScalingFactor = maxSize / obj.height ;

            let scalingFactor = Math.min(widthScalingFactor, heightScalingFactor);
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
    let sideNodes = (direction === 'in') ? node.incomers('node[!x]') : node.outgoers('node[!x]');
    if (node.isChild()) {
        sideNodes = (direction === 'in') ? node.parent().children().incomers('node[!x]') : node.parent().children().outgoers('node[!x]');
    }
    let minVal = min(values);
    let split = ((max(values) - minVal) / (sideNodes.size() + 1));
    let count = 0;
    for (let i=0; i<sideNodes.size(); i++) {
        let sideNode =  sideNodes[i];
        let coord;
        let offset;
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
//        sideNode.style({'label':null, shape: 'ellipse',width:'label',height:'label', 'background-color':'white','background-image-opacity':0,'border-width':0, 'color':'grey'});
        sideNode.connectedEdges().style({'line-color':'grey', 'target-arrow-color':'grey','source-arrow-color':'grey'});
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

function onlyUnique (value, index, self) { 
    return self.indexOf(value) === index;
}

function excludeIncompleteECs (value, index, self) { 
    if(value.match(/\.-/)) {
        return false;
    }
    return true;
}


// infer from either incomers/outgoers OR from children of nodeOfNodes
function inferCellularLocation (node) {

    let inCellularLocations = node.incomers('node[?cellular_location]').map(x => x.data("cellular_location")).filter(onlyUnique);
    let outCellularLocations = node.outgoers('node[?cellular_location]').map(x => x.data("cellular_location")).filter(onlyUnique);

    if(inCellularLocations.length == 1 && outCellularLocations.length == 1 && inCellularLocations[0] == outCellularLocations[0]) {
        node.data("cellular_location", inCellularLocations[0]);
        node.data("inferred_cellular_location", true);
    }

    /*
       if(inCellularLocations.length > 1 || outCellularLocations.length > 1 ||
       (inCellularLocations.length == 0 && outCellularLocations.length == 1) ||
       (outCellularLocations.length == 0 && inCellularLocations.length == 1) ||
       (inCellularLocations.length == 1 && outCellularLocations.length == 1 && inCellularLocations[0] != outCellularLocations[0])) {
       node.data("cellular_location", "Undetermined Location");
       }
     */

    let nodeOfNodeCellularLocations = node.children('node[?cellular_location]').map(x => x.data("cellular_location")).filter(onlyUnique);
    if(nodeOfNodeCellularLocations.length == 1) {
        node.data("cellular_location", nodeOfNodeCellularLocations[0]);
        node.data("inferred_cellular_location", true);
    }

    let allPossibleCellularLocations = inCellularLocations.concat(outCellularLocations).filter(onlyUnique);
    node.data("possible_cellular_locations", allPossibleCellularLocations);
}


function initialAnimation(nodes) {
    const duration = 2000;

    for (let i=0; i < nodes.length; i++) {
        animateNode(nodes[i], 200, 200, duration);
    }
    for (let i=0; i < nodes.length; i++) {
        animateNode(nodes[i], 200, -200, duration);
    }
    for (let i=0; i < nodes.length; i++) {
        animateNode(nodes[i], -200, -200, duration);
    }
    for (let i=0; i < nodes.length; i++) {
        animateNode(nodes[i], -200, 200, duration);
    }
    for (let i=0; i < nodes.length; i++) {
        animateNode(nodes[i], 0, 0, duration);
    }

}

function animateNode(node, shiftX, shiftY, duration) {
    node.animate({position:{'x':Number(node.data("x"))+ shiftX, 'y':Number(node.data("y"))+ shiftY}},
                             {duration: duration});
}


function processCellularLocationNode (initialNode, cy) {

    let nodeSelector = "#" + initialNode.id();
    let node =  cy.$(nodeSelector);

    if(node.parent().data("node_type")== "cellular_location") {
        return;
    }

    let cellularLocation = node.data("cellular_location");


    let colorMap = {
        'undetermined':'red',
        'apicoplast':'#D55E00',
        'chloroplast stroma':'#009E73',
        'chloroplast thylakoid lumen':'#009E73',
        'chloroplast thylakoid membrane':'#009E73',
        'cytoplasm':'#56B4E9',
        'cytosol':'#56B4E9',
        'extracellular region':'#999999',
        'extracellular space':'#999999',
        'from host':'#F0E442',
        'from host cell':'#F0E442',
        'to host cell':'#F0E442',
        'go:0048237':'#E69F00',
        'golgi lumen':'#E69F00',
        'mitochondrial inner membrane':'#0072B2',
        'mitochondrial matrix':'#0072B2',
        'mitochondrion':'#0072B2',
        'outer membrane-bounded periplasmic space':'',
        'plasma membrane':'#CC79A7',
    };

    let color = colorMap[cellularLocation.toLowerCase()];
    if(!color) {
        color = "green";
    }

    let cellularLocationNode = cy.add({
        group: "nodes",
        data: { cellular_location: cellularLocation, node_type: 'cellular_location', display_label: cellularLocation, color:color
        },
    });

    addCellularLocation(node, cellularLocationNode);
}

function addCellularLocation (node, cellularLocationNode) {

    if(node.parent().data("node_type")== "cellular_location") {
        return;
    }


    let cellularLocation = cellularLocationNode.data("cellular_location");
//    let selectorString = 'node[cellular_location = "' + cellularLocation + '"]';
    let selectorString = 'node[?possible_cellular_locations]';

    let incomerNodes = node.incomers(selectorString);
    let outgoerNodes = node.outgoers(selectorString);
    let childrenNodes = node.children(selectorString);

    if(node.data("possible_cellular_locations").length == 1) {
        node.move({parent:cellularLocationNode.id()});
    }

    for (let i=0; i<incomerNodes.size(); i++) {
        if(incomerNodes[i].data("possible_cellular_locations").includes(cellularLocation)) {
            addCellularLocation(incomerNodes[i], cellularLocationNode);
        }
    }

    for (let i=0; i<outgoerNodes.size(); i++) {
        if(outgoerNodes[i].data("possible_cellular_locations").includes(cellularLocation)) {
            addCellularLocation(outgoerNodes[i], cellularLocationNode);
        }
    }

    for (let i=0; i<childrenNodes.size(); i++) {
        if(childrenNodes[i].data("possible_cellular_locations").includes(cellularLocation)) {
            addCellularLocation(childrenNodes[i], cellularLocationNode);
        }
    }
}







function makeCy(container, pathwayId, pathwaySource, PathwayNodes, PathwayEdges, name) {

  return Promise.all([loadCytoscapeJs(), loadChemDoodleWeb()])
    .then(function([ cytoscape ]) {

    let myLayout = {
        name: 'preset',
        fit: false,
    };


    let cy = cytoscape({
        container,
        elements:PathwayNodes.map(makeNode).concat(PathwayEdges.map(makeEdge)),

        style: [
            {
                selector: 'edge',
                style: {
                    'line-color':'black',
                    'width':1,
                    'curve-style':'bezier',
                    'arrow-scale':0.4,
                    'target-arrow-shape':'triangle-backcurve',
                    'target-arrow-color':'black',
                },
            },

            {
                selector: 'edge[is_reversible="1"]',
                style: {
                    'source-arrow-shape':'triangle-backcurve',
                    'source-arrow-color':'black',
                },
            },


            {
                selector: 'edge[zoomLevel > 1.4]',
                style: {
                    'width':0.5,
                },
            },

            {
                selector: 'node',
                style: {

                    'text-halign':'center',
                    'text-valign':'center',
                    'border-width':1,
                    'border-style':'solid',
                    'border-color':'black',
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
                    width:10,
                    height:10,
                },
            },

            {
              selector: 'node[node_type= "enzyme"][gene_count > 0]',
              style: {
                'border-color':'orange',
                  'background-color': 'orange',
              },
            },


            /* {
               selector: 'node:child[node_type= "enzyme"][gene_count <1]',
               style: {
               visibility:'hidden'
               },
               },
             */
            {
              selector: 'node[node_type= "enzyme"][?hasImage]',
              style: {
                  width:50,
                  height:25,
                  visibility:'visible',
                  'font-size':12,
                  'background-image':'data(smallImage)',
                  'background-fit':'contain',
                  label:null,
              },
            },

            {
                selector: 'node[node_type= "enzyme"][zoomLevel > 1.4]',
                style: {
                    visibility:'visible',
                    width:25,
                    height:10,
                    }
            },


            {
                selector: 'node[node_type= "enzyme"][zoomLevel > 1.4][!hasImage]',
                style: {
                   'font-size':6,
                    label: 'data(display_label)',
                }
            },


            {
                selector: 'node[node_type= "pathway_internal"]',
                style: {
                    'display': 'none',
                },
            },



             {
               selector: 'node[node_type= "molecular entity"]',
               style: {
               shape: 'ellipse',
               width:7,
               height:7,
               'background-color':'white',
               'border-width':1,
               'background-image-opacity':0,
               label:null,
               }
               },


             {
               selector: 'node[node_type= "molecular entity"][?side]',
                 style: {
                     shape: 'ellipse',
                     width:4,
                     height:4,
                     'background-image-opacity':0,
                     'color':'grey'
               }
               },

             {
               selector: 'node[node_type= "molecular entity"][?side][zoomLevel > 1.4]',
                 style: {
               width:'label',
               height:'label',
               'border-width':0,
               label:'data(name)',
               padding:'2px',
               'font-size':6,
               }
               },

             {
               selector: 'node[node_type= "molecular entity"][?side][zoomLevel > 2]',
                 style: {
               'font-size':3,
               }
               },


            {
               selector: 'node[node_type= "molecular entity"][!image][zoomLevel > 0.8][!side]',
               style: {
               width:'label',
               height:'label',
               'border-width':0,
               label:'data(name)',
               'font-size':12,
               },
               },


             {
               selector: 'node[node_type= "molecular entity"][?image][zoomLevel > 0.8][!side]',
               style: {
               shape: 'rectangle',
               width:'data(width)',
               height:'data(height)',
               'border-width':0,
               'background-image-opacity':1,
               'background-color': 'white',
               'background-image':'data(image)',
               'background-fit':'contain',
               label:null,

               },
               },



            {
               selector: 'node[node_type= "molecular entity"][?image][zoomLevel > 1.4][!side]',
               style: {
                   label:'data(name)',
                   'text-valign': 'bottom',
                   'text-halign': 'center',
                   'text-margin-y':-6,
                   'font-size':6,
                   'text-wrap':'wrap',
                   }
            },


            {
               selector: 'node[node_type= "molecular entity"][?image][zoomLevel > 2][!side]',
               style: {
                   'font-size':4,
                   'text-margin-y':-3,
                   }
            },





             {
               selector: 'node[node_type= "molecular entity"][?paintingEnzymes][zoomLevel <= 2]',
               style: {
               shape: 'ellipse',
               width:7,
               height:7,
               'background-color':'white',
               'border-width':1,
               'background-image-opacity':0,
               }
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
                    'font-size':30,
                },
            },

            {
                selector: 'node[node_type= "metabolic process"]',
                style: {
                    'font-size':12,
                },
            },



            {
                selector: 'node[node_type= "cellular_location"]',
                style: {
                    shape: 'roundrectangle',
                    'border-color': 'data(color)',
                    'background-color': 'data(color)',
                    'color': 'data(color)',
                    'text-background-color': 'data(color)',
                    'text-background-opacity': 0.1,
                    'background-opacity' : 0.1,
                    label: 'data(display_label)',
                    padding:'5%',
                    'text-valign': 'top',
                    'text-halign': 'center',
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
        zoom:1
    });




        cy.ready(function () {

            cy.changeLayout = function (val) {

                cy.zoom(1);
                cy.reset();

                // Null out all positions or the compound nodes are not being set correctly
                cy.nodes().map(function(node){node.position({x:null, y:null});node.renderedPosition({x:null, y:null});});

                if (val === 'preset') {
                    cy.layout({name:val,
                               fit:true,
                               positions:function(node){return{'x':Number(node.data("x")), 'y':Number(node.data("y"))}}
                    }).run();
                }

                else if (val === 'dagre') {
                    cy.layout({name:val, rankDir:'LR'}).run();
                }

                else {
                    cy.layout({name:val}).run();
                }
            };

            cy.changeExperiment = function (linkPrefix, xaxis, doAllNodes) {

                let nodes = cy.elements('node[node_type= "enzyme"]');

                let compounds = cy.elements('node[node_type= "molecular entity"]');
                let hasLinkPrefix = linkPrefix ? true : false;
                for (let i=0; i < compounds.length; i++) {
                    compounds[i].data("paintingEnzymes", hasLinkPrefix);
                }

                for (let i=0; i < nodes.length; i++) {
                    let n = nodes[i];

                    let ecNum = n.data('display_label');

                    if (linkPrefix && (doAllNodes || n.data("gene_count") > 0 )) {
                        let link = linkPrefix + ecNum;
                        let smallLink = link + '&h=20&w=50&compact=1';

                        n.data('image', link);
                        n.data('smallImage', smallLink);
                        n.data('hasImage', true);
                        /* n.style({
                           'background-image':smallLink,
                           'background-fit':'contain',
                           }); */
                    }
                    else {
                        n.data('hasImage', false);
                        n.data('image', null);
                        n.data('smallImage', null);
                    }
                }

//                cy.style().selector('node[node_type= "enzyme"][!hasImage]').style({'label':'data(display_label)', 'background-image-opacity':0}).update();
//                cy.style().selector('node[node_type= "enzyme"][?hasImage]').style({'label':null}).update();
            };






            if (pathwaySource.indexOf('Cyc') > -1) {
                if (cy.nodes().is('node[?x]')) {
                    cy.nodes('node[node_type="enzyme"]').map(function(node) {
                        //if node is a child, get the parent
                        node = (node.isChild()) ? node.parent()[0] : node;

                        //tag sides so non-leaf sides are only positioned once
                        tagSides(node.incomers('node[!x]'));
                        tagSides(node.outgoers('node[!x]'));

                        //for each enzyme, get all incoming and outgoing nodes with coordinates
                        let incomingNodes = node.incomers('node[?x][!side]');
                        let outgoingNodes = node.outgoers('node[?x][!side]');

                        //extract coordinates
                        let xValuesIn = getCoords(incomingNodes, 'x');
                        let xValuesOut = getCoords(outgoingNodes, 'x');
                        let yValuesIn = getCoords(incomingNodes, 'y');
                        let yValuesOut = getCoords(outgoingNodes, 'y');

                        //only reposition if enzyme has an incomer and and outgoer with coords
                        if (incomingNodes.size() >= 1 && outgoingNodes.size() >= 1) {
                            let meanX = mean(xValuesIn.concat(xValuesOut));
                            let meanY = mean(yValuesIn.concat(yValuesOut));
                            let orientation = (Math.abs(mean(xValuesIn) - mean(xValuesOut)) >= Math.abs(mean(yValuesIn) - mean(yValuesOut))) ? 'horizontal' : 'vertical';

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
                                    for (let i=0; i<node.children().size(); i++) {
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
                    let enzymeNodes = cy.nodes('node[node_type="enzyme"]');
                    for (let i=0; i < enzymeNodes.size(); i++) {
                        for (let j=0; j < enzymeNodes.size(); j++) {
                            //find enzyme nodes with identical coords and reset
                            if (enzymeNodes[i].id() != enzymeNodes[j].id() && enzymeNodes[i].data('x') === enzymeNodes[j].data('x') && enzymeNodes[i].data('y') === enzymeNodes[j].data('y')) {
                                resetOverlappingNodes(enzymeNodes[i], -60);
                                resetOverlappingNodes(enzymeNodes[j], 60);
                            }
                        }
                    }

                    //Handle nodes with no preset position
                    cy.elements('node[!x]').layout({ name: 'cose' }).run();

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

                    //Remove duplicate nodes
                    var allNodes = cy.nodes();
                    for (let i=0; i < allNodes.size() -1; i++) {
                        for (let j= i+1; j < allNodes.size(); j++) {
                            //Find node with identical coordinates
                            if ( allNodes[i].id() != allNodes[j].id() && allNodes[i].data('name') === allNodes[j].data('name') && allNodes[i].data('x') === allNodes[j].data('x') && allNodes[i].data('y') === allNodes[j].data('y')) {
                                allNodes[j].connectedEdges().map(function(edge) {
                                    if (edge.data('source') === allNodes[j].data('id')) {
                                        edge.move({'source': allNodes[i].data('id')});
                                    }
                                    else if (edge.data('target') === allNodes[j].data('id')) {
                                        edge.move({'target': allNodes[i].data('id')});
                                    }
                                    cy.remove(allNodes[j]);
                                });
                            }
                        }
                    }

                }
            }
            let nodesOfNodes = cy.nodes('node[node_type= "nodeOfNodes"]');
            for (let i=0; i < nodesOfNodes.length; i++) {
                let parent = nodesOfNodes[i];
                let children = parent.children().map(function(child) {
                    return child.data("node_identifier");
                });
                parent.data("childenNodes", children.join('<br>'));
            }

            cy.boxSelectionEnabled(true);

        });
        cy.add([{group: "nodes", data: {id: pathwayId + '_' + pathwaySource, name: name, node_type: 'pathway_internal'}}]);


        let nodes = cy.nodes();
        for (let i=0; i < nodes.length; i++) {
            if(nodes[i].data("cellular_location")) {
                nodes[i].data("possible_cellular_locations", [nodes[i].data("cellular_location")]);
            }
            else {
                nodes[i].data("possible_cellular_locations", []);
            }
        }


        let nodesWithoutCellularLocation = cy.nodes('node[!cellular_location]');
        for (let i=0; i < nodesWithoutCellularLocation.length; i++) {
            inferCellularLocation(nodesWithoutCellularLocation[i]);
        }

        let nodesWithCellularLocation = cy.nodes('node[?cellular_location]');
        for (let i=0; i < nodesWithCellularLocation.length; i++) {
            processCellularLocationNode(nodesWithCellularLocation[i], cy);
        }

        let nodesWithInferredCellularLocation = cy.nodes('node[?inferred_cellular_location]');
        for (let i=0; i < nodesWithInferredCellularLocation.length; i++) {
            nodesWithInferredCellularLocation[i].data("cellular_location", null);
            nodesWithInferredCellularLocation[i].move({parent:null});
        }


        let parentNodes = cy.nodes('node[node_type="nodeOfNodes"],node[node_type="cellular_location"]');
        for (let i=0; i < parentNodes.length; i++) {
            parentNodes[i].data("descendants", parentNodes[i].descendants().map(function(child) {
                    return "</br>" + child.data("name") + " (" + child.data("display_label") + ")";
                }));
        }

//        let nodesWithCellularLocation = cy.nodes('node[?cellular_location]');
//        initialAnimation(nodesWithCellularLocation);

        if (nodes.allAre('[!x]')) {
            cy.layout({name: 'cose'}).run();
        }
        return cy;

    });
}

function readDynamicCols(dynamicColsOfIncomingStep, globalData) {

    // Need this in here for metabolite transforms

    var nodeList = QueryString.parse(globalData.location.search.slice(1)).node_list;
    if(nodeList) {
        return(nodeList);
    }

    var excludeIncompleteEC = Number(QueryString.parse(globalData.location.search.slice(1)).exclude_incomplete_ec);

    //TODO:  need to make this work for metabolite records not just genes!
    var ecsForGenes = dynamicColsOfIncomingStep
    .filter(row => row.ec_numbers_derived != null || row.ec_numbers != null)
    .map(row => { 
        var a = [];
        if(row.ec_numbers) {
            a.push(row.ec_numbers);
        }
        if(row.ec_numbers_derived) {
            a.push(row.ec_numbers_derived);
        }

        var combined = a.join("; ");
        var namedEcs = combined.split(';\s');
        var ecs = namedEcs.map(full => full.split(" ")[0]);

        if(excludeIncompleteEC) {
            ecs = ecs.filter(excludeIncompleteECs);
        }

        return(ecs);
    });

  return [
    ...new Set([].concat.apply([], ecsForGenes).filter(onlyUnique))
  ].join(',');
}

// enhance function supplements a component with additional custom data and AC props
const enhance = flow(
  // pulls custom values out of store's state and will pass as props to enhanced component

  withStore(state => ({
    pathwayRecord: state.pathwayRecord,
    config: state.globalData.config,
    siteConfig: state.globalData.siteConfig,
    nodeList: readDynamicCols(state.dynamicColsOfIncomingStep, state.globalData),
    exactMatchEC: QueryString.parse(state.globalData.location.search.slice(1)).exact_match_only,
    excludeIncompleteEC: QueryString.parse(state.globalData.location.search.slice(1)).exclude_incomplete_ec,
    dynamicColsOfIncomingStep: state.dynamicColsOfIncomingStep,
    experimentCategoryTree: getExperimentCategoryTree(state),
    generaCategoryTree: getGeneraCategoryTree(state)
  })),
  // wraps these raw ACs with dispatchAction and will pass as props to enhanced component
  withActions({
    setActiveNodeData,
    setPathwayError,
    setGeneraSelection,
    setFilteredNodeList
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
          let node = event.target;
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
          if (activeNodeData && activeNodeData.id === event.target.data('id')) {
            this.props.setActiveNodeData(Object.assign({}, event.target.data()));
          }
        });


          cy.on('boxselect', function(event){
              cy.fit(cy.$(':selected'));
          });


          cy.on('zoom', function(event){
              let elements = cy.elements();

              for (let i=0; i < elements.size(); i++) {

                  elements[i].data('zoomLevel', cy.zoom());
              }
          });


        cy.minZoom(0.1);
        cy.maxZoom(4);
        cy.panzoom({
            zoomFactor:0.2,
          minZoom: .1,
          maxZoom: 4
        });

        cy.fit();

        //decorate nodes from node_list
        if(this.props.nodeList) {
          let nodesToHighlight = this.props.nodeList.split(/,\s*/g);
            var updatedNodesToHighlight = [];

          cy.nodes().removeClass('eupathdb-CytoscapeHighlightNode');

          var useFuzzyECMatch = !Number(this.props.exactMatchEC);
          var useIncompleteEC = !Number(this.props.excludeIncompleteEC);

          nodesToHighlight.forEach(function(n){
              var expandedNodes = [n];
              var operator = "=";
              if(useFuzzyECMatch) {
                  operator = "*=";
                  var firstWildCardPos = n.indexOf(".-");
                  if(firstWildCardPos > 0) {
                      n = n.substring(0, firstWildCardPos);
                  }
              }


              var nodeListNodes = cy.nodes("node[node_type = 'enzyme'][node_identifier " + operator + " '" + n + "'], node[node_type= 'molecular_entity'][node_identifier = '" + n + "']");
              nodeListNodes.addClass('eupathdb-CytoscapeHighlightNode');

              if(nodeListNodes.length > 0) {
                  updatedNodesToHighlight.push(n);
              }
              
              // Fuzzy matches for EC Numbers
              if(useFuzzyECMatch && useIncompleteEC) {
                  while(1) {
                      var res = n.replace(/\.(\d+)($|(\.-))/, "$3.-");
                      
                      if(res == n) {
                          break;
                      }
                      
                      n = res;

                      var nodeListNodes = cy.nodes("node[node_type = 'enzyme'][node_identifier ='" + n + "']");
                      nodeListNodes.addClass('eupathdb-CytoscapeHighlightNode');

                      if(nodeListNodes.length > 0) {
                          updatedNodesToHighlight.push(n);
                      }
                  }
              }

          });

            this.props.setFilteredNodeList({filteredNodeList:updatedNodesToHighlight.filter(onlyUnique).join(",")});
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
    let orange = {color: 'orange'};
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
            Click on nodes for more info.  Nodes highlighted in <span style={orange}>orange</span> are EC numbers that we
            have mapped to at least one gene. The nodes, as well as the info box, can be repositioned by dragging.
          </p>


            {this.props.pathwayRecord.filteredNodeList && (
                 <p>Identifiers from result which map to this pathway are highlighted in <span style={purple}>purple:  {this.props.pathwayRecord.filteredNodeList}</span>.</p>
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
  let jsonKeys = ['elements', 'nodes', 'data', 'id', 'display_label', 'parent', 'cellular_location', 'node_type', 'x', 'y', 'name', 'node_identifier', 'position', 'edges', 'is_reversible', 'source', 'target', 'reaction_source_id'];
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
         : type === 'cellular_location' ? <CellularLocationNodeDetails {...this.props}/>
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
  let { display_label, name, gene_count, image, cellular_location } = props.nodeData;

  return (
    <div>
        <p><b>EC Number or Reaction:</b>
          <a href={'http://enzyme.expasy.org/EC/' + display_label}> {display_label}</a> </p>

      {name && (
           <p><b>Enzyme Name:</b> {name}</p>
      )}

      {cellular_location && (
           <p><b>Cellular Location:</b> {safeHtml(cellular_location)}</p>
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
  let { nodeData: { node_identifier, name, image, cellular_location } } = props;

  return (
    <div>
      <p><b>ID:</b> {node_identifier}</p>

      {name && (
           <p><b>Name:</b> {safeHtml(name)}</p>
      )}

      {cellular_location && (
           <p><b>Cellular Location:</b> {safeHtml(cellular_location)}</p>
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
      <div><b>Node Group: </b><p>{safeHtml(props.nodeData.descendants)}</p>
      </div>
    </div>
  );
}

function CellularLocationNodeDetails(props) {
  return (
    <div>
      <div><b>{safeHtml(props.nodeData.cellular_location)}: </b><p>{safeHtml(props.nodeData.descendants)}</p>
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
    const { PathwayEdges, PathwayNodes } = props.record.tables;
    const content = PathwayEdges && PathwayNodes
      ? <CytoscapeDrawing {...props}/>
      : <Loading/>;

    return (
      <div>
        <h4>{props.attribute.displayName}</h4>
        {content}
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


function setFilteredNodeList(filteredNodeList) {
  return {
    type: 'pathway-record/set-filtered-nodeList',
    payload: filteredNodeList
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
