/* global wdk, ChemDoodle */

/**
 * React Components related to Compounds
 */

import {Component, PropTypes} from 'react';
import lodash from 'lodash';
import $ from 'jquery';
import {registerCustomElement} from '../customElements';

/** Load the ChemDoodle JS library once */
let loadChemDoodleWeb = lodash.once(function() {
  return $.getScript(wdk.webappUrl('js/ChemDoodleWeb.js'));
});

/**
 * Wrapper for ChemDoodle structure drawing library.
 * See https://web.chemdoodle.com/tutorial/2d-structure-canvases/viewer-canvas/
 */
export class CompoundStructure extends Component {

  constructor(props) {
    super(props);
    this.canvasId = lodash.uniqueId('chemdoodle');
  }

  drawStructure(props) {
    let { moleculeString, height, width } = props;
    let vc = new ChemDoodle.ViewerCanvas(this.canvasId, width, height);
    vc.loadMolecule(ChemDoodle.readMOL(moleculeString));
  }

  componentDidMount() {
    loadChemDoodleWeb().then(() => this.drawStructure(this.props));
  }

  componentWillReceiveProps(nextProps) {
    loadChemDoodleWeb().then(() => this.drawStructure(nextProps));
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
  return (
    <CompoundStructure moleculeString={moleculeString} height={height} width={width} />
  );
});
