/* global wdk */

/**
 * React Components related to Compounds
 */

import {Component, PropTypes} from 'react';
import lodash from 'lodash';
import $ from 'jquery';
import {CollapsibleSection} from 'wdk-client/Components';
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
    this.drawStructure = () => {
      this.node.innerHTML = `<canvas id="${this.canvasId}"/>`;
      new ChemDoodle.ViewerCanvas(this.canvasId, this.props.width, this.props.height)
      .loadMolecule(ChemDoodle.readMOL(this.props.children));
    };
  }

  componentDidMount() {
    loadChemDoodleWeb().then(this.drawStructure);
  }

  render() {
    return (
      <div className="eupathdb-CompoundStructureWrapper">
        <span ref={node => this.node = node}/>
      </div>

    );
  }

}

CompoundStructure.propTypes = {
  children: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number
};

CompoundStructure.defaultProps = {
  height: 200,
  width: 200
};

registerCustomElement('compound-structure', CompoundStructure);
