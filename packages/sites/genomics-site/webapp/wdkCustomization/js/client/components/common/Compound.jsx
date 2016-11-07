/* global ChemDoodle */

/**
 * React Components related to Compounds
 */

import {Component, PropTypes} from 'react';
import {once, uniqueId, isEmpty} from 'lodash';
import $ from 'jquery';
import {registerCustomElement} from '../customElements';
import { webAppUrl } from '../../config';

/** Load the ChemDoodle JS library once */
let loadChemDoodleWeb = once(function() {
  return $.getScript(webAppUrl + '/js/ChemDoodleWeb.js');
});

/**
 * Wrapper for ChemDoodle structure drawing library.
 * See https://web.chemdoodle.com/tutorial/2d-structure-canvases/viewer-canvas/
 */
export class CompoundStructure extends Component {

  constructor(props) {
    super(props);
    this.canvasId = uniqueId('chemdoodle');
  }

  drawStructure(props) {
    let { moleculeString, height, width } = props;

    var structure = ChemDoodle.readMOL(moleculeString)
    structure.scaleToAverageBondLength(14.4);

    var xy = structure.getDimension();

    let vc = new ChemDoodle.ViewerCanvas(this.canvasId, xy.x + 35, xy.y + 35);
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



  }

  loadLibs(props) {
    loadChemDoodleWeb().then(() => this.drawStructure(props));
  }

  componentDidMount() {
    this.loadLibs(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadLibs(nextProps);
  }

  render() {
    return (
      <div className="eupathdb-CompoundStructureWrapper">
        <canvas id={this.canvasId}/>
      </div>

    );
  }

}

CompoundStructure.propTypes = {
  moleculeString: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number
};

CompoundStructure.defaultProps = {
  height: 200,
  width: 200
};

registerCustomElement('compound-structure', function (el) {
  let moleculeString = el.innerHTML;
  let height = el.hasAttribute('height') ? Number(el.getAttribute('height')) : undefined;
  let width = el.hasAttribute('width') ? Number(el.getAttribute('width')) : undefined;
  return isEmpty(moleculeString) ? <noscript/> : (
    <CompoundStructure moleculeString={moleculeString} height={height} width={width} />
  );
});
