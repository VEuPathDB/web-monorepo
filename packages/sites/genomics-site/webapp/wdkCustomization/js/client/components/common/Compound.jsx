/* global ChemDoodle */

/**
 * React Components related to Compounds
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { uniqueId, isEmpty } from 'lodash';
import { registerCustomElement } from '@veupathdb/web-common/lib/util/customElements';

/** Load the ChemDoodle JS library once */
export function loadChemDoodleWeb() {
  return new Promise(function (resolve, reject) {
    try {
      require.ensure([], function (require) {
        require('!!script-loader!site/js/ChemDoodleWeb');
        resolve(ChemDoodle);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Wrapper for ChemDoodle structure drawing library.
 * See https://web.chemdoodle.com/tutorial/2d-structure-canvases/viewer-canvas/
 */
export class CompoundStructure extends Component {
  constructor(props) {
    super(props);
    this.canvasId = uniqueId('chemdoodle');
    this.mounted = false;
  }

  drawStructure(props, ChemDoodle) {
    if (!this.mounted) return;

    let { moleculeString } = props;

    var structure = ChemDoodle.readMOL(moleculeString);
    structure.scaleToAverageBondLength(14.4);

    var xy = structure.getDimension();

    let vc = new ChemDoodle.ViewerCanvas(this.canvasId, xy.x + 35, xy.y + 35);
    //the width of the bonds should be .6 pixels
    vc.specs.bonds_width_2D = 0.6;
    //the spacing between higher order bond lines should be 18% of the length of the bond
    vc.specs.bonds_saturationWidth_2D = 0.18;
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
    loadChemDoodleWeb().then((ChemDoodle) =>
      this.drawStructure(props, ChemDoodle)
    );
  }

  componentDidMount() {
    this.loadLibs(this.props);
    this.mounted = true;
  }

  componentWillReceiveProps(nextProps) {
    this.loadLibs(nextProps);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    return (
      <div className="eupathdb-CompoundStructureWrapper">
        <canvas id={this.canvasId} />
      </div>
    );
  }
}

CompoundStructure.propTypes = {
  moleculeString: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
};

CompoundStructure.defaultProps = {
  height: 200,
  width: 200,
};

registerCustomElement('compound-structure', function (el) {
  let moleculeString = el.innerHTML;
  let height = el.hasAttribute('height')
    ? Number(el.getAttribute('height'))
    : undefined;
  let width = el.hasAttribute('width')
    ? Number(el.getAttribute('width'))
    : undefined;
  return isEmpty(moleculeString) ? (
    <noscript />
  ) : (
    <CompoundStructure
      moleculeString={moleculeString}
      height={height}
      width={width}
    />
  );
});
