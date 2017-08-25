import React from 'react';
import { IconAlt as Icon } from 'wdk-client/Components'

const Text = {
  product: 'MAL-ED ClinEpiDB Prototype v0.2',
  headline: 'Do not distribute beyond MAL-ED Network investigators!',
  body: (
    <div>
      <p>As a MAL-ED collaborating investigator, you have been granted access to this prototype version of the ClinEpiDB database, in order to assess the performance and capabilities of this resource. This release contains a subset of 0-24 month data from the MAL-ED longitudinal birth cohort study (note that some of the datatypes and variables loaded in this release differ from the final version established by the Data Coordinating Center).</p>
      <p>You may also grant access to others on your team in a position to appropriately critique the database and provide feedback to the developers. Use the Contact Us link above to submit questions and comments to the development team. <b><i>Please note that this resource is for evaluation and training purposes only; datasets are not available for download, and shouild not be used for analyses leading to presentation or publication.</i></b></p>
    </div>
  ),
  action: <span>Click here to acknowledge your agreement. <Icon fa="chevron-right" /></span>
};

const Style = {
  modalWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modal: {
    padding: '30px',
    backgroundColor: '#eee',
    boxShadow: '0px 0px 20px rgba(0,0,0,0.33)',
    color: '#333',
    maxWidth: '550px'
  },
  product: {
    fontWeight: 200
  }
}

const flag = 'acceptedClinEpiDisclaimer=true';

class DisclaimerModal extends React.Component {
  constructor (props) {
    super(props);
    const showModal = document.cookie.indexOf(flag) < 0;
    this.state = { showModal };
    this.acceptDisclaimer = this.acceptDisclaimer.bind(this);
  }

  acceptDisclaimer () {
    document.cookie = flag;
    const showModal = false;
    this.setState({ showModal });
  }

  render () {
    const { showModal } = this.state;
    if (!showModal) return null;

    const { action, body, headline, product } = Text;
    return (
      <div className="DisclaimerModal">
        <div className="DisclaimerModal-Outer" style={Style.modalWrapper}>
          <div className="DisclaimerModal-Inner" style={Style.modal}>
            <h3 style={Style.product}>{product}</h3>
            <h2>{headline}</h2>
            {body}
            <button onClick={this.acceptDisclaimer}>{action}</button>
          </div>
        </div>
      </div>
    )
  }
};


export default DisclaimerModal;
