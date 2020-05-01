import React from 'react';
import { bytesToHuman } from 'wdk-client/Utils/Converters';

import tutStep2 from './images/tut-step-2.jpg';
import tutStep3 from './images/tut-step-3.jpg';

function UserDatasetTutorial ({ projectName, quotaSize }) {
  const galaxyUrl = 'https://eupathdb.globusgenomics.org/';
  return (
    <div className="row UserDataset-Tutorial">
      <div className="box xs-12 md-6">
        <h2>EuPathDB Galaxy</h2>
        <img src={tutStep2} />
        <ul>
          <li>Use the <b>EuPathDB Export Tools</b> on the left-side navigation, at <b><a href={galaxyUrl} target="_blank">EuPathDB Galaxy</a></b>.</li>
          <li>Prepare your export data set by selecting the files (galaxy datasets) in your history. </li>
          <li>The data set name, summary and description can be edited later in the <i>My Data Sets</i> page.</li>
          <li>When you’re ready, <code>Execute</code> the export. The process of exporting to EuPathDB may take some time. Progress can be monitored from the right-side history panel in Galaxy.</li>
        </ul>
      </div>
      <div className="box xs-12 md-6">
        <h2>My Data Sets page</h2>
        <img src={tutStep3} />
        <ul>
          <li>You can now view, manage, share, and utilize your data set in <b>{projectName}</b>.</li>
          <li>My Data sets you’ve created contribute to a per-user upload limit/quota of <b>{bytesToHuman(quotaSize)}</b>.</li>
          <li> Bigwig files can be sent to GBrowse in the dataset’s detail page.
               Click the dataset name or status icon to see this page.</li>
        </ul>
      </div>
    </div>
  );
}

export default UserDatasetTutorial;
