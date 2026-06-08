import React from 'react';
import * as persistence from '@veupathdb/web-common/lib/util/persistence';
import Modal from '@veupathdb/web-common/lib/App/Modal';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';

import './DisclaimerModal.scss';

const itemName = 'acceptedClinEpiDisclaimer';

const Text = {
  product: (
    <span>
      <big>
        data<span style={{ color: '#DD314E' }}>Explorer</span>{' '}
      </big>
    </span>
  ),
  body: (
    <div>
      <p>
        dataExplorer (https://dataExplorer.org) is an online platform supporting
        the contribution, discovery, understanding, exploration, and reuse of
        datasets by the global research community. We are committed to FAIR
        (Findable, Accessible, Interoperable, and Reusable) data principles.
      </p>
      <p>
        Data are interpretable only to the extent the original study design and
        context are understood. Researchers reusing data should review available
        documentation to understand the original study design, context, and
        limitations before conducting secondary analyses and making conclusions.
      </p>
      <p>
        Personally Identifiable Information (PII) must not be uploaded to
        dataExplorer. By uploading datasets to this platform, contributors
        acknowledge and agree that they are solely responsible for ensuring that
        uploaded data are appropriately de-identified and comply with all
        applicable ethical, institutional, legal, and regulatory requirements.
      </p>
      <p>
        By using dataExplorer, users agree to comply with the platform’s{' '}
        <a
          href="/a/app/static-content/dataExplorer/access_and_use.html"
          target="_blank"
        >
          Data Access and Use Policy
        </a>{' '}
        and to use datasets responsibly and only as authorized. The dataExplorer
        team is not responsible for inappropriate sharing or use of datasets
        contributed to this platform. dataExplorer reserves the right to remove
        datasets or other content that do not comply with these requirements,
        including datasets containing PII or other prohibited information.
      </p>
      <p>
        Please use the “Contact Us” link above for questions, comments, or to
        report datasets that may contain PII or other sensitive information.
      </p>
    </div>
  ),
  action: (
    <span>
      Click here to acknowledge your agreement.{' '}
      <Icon fa="chevron-right right-side" />
    </span>
  ),
};

class DisclaimerModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: !persistence.get(itemName, false),
    };

    this.acceptDisclaimer = this.acceptDisclaimer.bind(this);
  }

  acceptDisclaimer() {
    persistence.set(itemName, true);
    const showModal = false;
    this.setState({ showModal });
  }

  render() {
    const { showModal } = this.state;
    const { action, body, headline, product } = Text;
    return (
      <Modal when={showModal} className="DisclaimerModal">
        {!product ? null : (
          <h1 className="DisclaimerModal-Product">{product}</h1>
        )}
        {!headline ? null : (
          <h2 className="DisclaimerModal-Headline">{headline}</h2>
        )}
        {!body ? null : (
          <section className="DisclaimerModal-Body">{body}</section>
        )}
        {!action ? null : (
          <button
            className="DisclaimerModal-Button btn"
            onClick={this.acceptDisclaimer}
          >
            {action}
          </button>
        )}
      </Modal>
    );
  }
}

export default DisclaimerModal;
