import React from 'react';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import HelpIcon from 'wdk-client/Components/Icon/HelpIcon';
import {Link} from 'wdk-client/Components';

import 'wdk-client/Views/UserDatasets/Navigation.scss';

const BackToAllDatasetsLink = () => (
  <Link to={'/workspace/datasets'}>
    <Icon fa="chevron-left"/>
    &nbsp; All My Data Sets
  </Link>
);

const GoToNewUploadLink = () => (
  <Link to={'/workspace/dataset-upload'}>
    <Icon fa="chevron-right"/>
    &nbsp; Upload Data Set
  </Link>
);
const BackToNewUploadLink = () => (
  <Link to={'/workspace/dataset-upload'}>
    <Icon fa="chevron-left"/>
    &nbsp; Upload Data Set
  </Link>
);

const GoToUploadsListLink = () => (
  <Link to={'/workspace/dataset-upload/status'}>
    <Icon fa="chevron-right"/>
    &nbsp; Recent Uploads
  </Link>
);

const UploadsListLinkShowingSummary = (text: string) => (
  <Link style={{color:"orange"}} to={'/workspace/dataset-upload/status'}>
    <span style={{marginLeft: "1em"}}>
      {text}
    </span>
  </Link>
);

export const MyDatasetsNoUploadRibbon = (projectName: string) => (
  <div className="UserDatasetNavigation">
    <h1 className="UserDatasetNavigation-Title">
      My Data Sets
      <HelpIcon>
        <div>
          Bring your own data sets to <b>{projectName}</b>.
          <ul style={{ marginTop: '10px' }}>
            <li>My Data Sets is currently enabled for data sets containing one or more bigwig files. </li>
            <li>Export this type of data set from your history in <a href='http://veupathdb.globusgenomics.org'>VEuPathDB Galaxy</a> <b>{projectName}</b>.</li>
            <li>Push compatible data straight to <a>GBrowse</a>, with other tooling coming soon.</li>
            <li>Share your data set with others and receive shared data from your colleagues.</li>
          </ul>
        </div>
      </HelpIcon>
    </h1>
  </div>
);


const MyDatasetsMicrobiomeDBRibbon = (numOngoingUploads: number) => (
  <div className="UserDatasetNavigation">
    <h1 className="UserDatasetNavigation-Title">
      My Data Sets
      <HelpIcon>
        <div>
          Bring your own data sets to <b>MicrobiomeDB</b>.
          <ul style={{ marginTop: '10px' }}>
            <li>Use our upload functionality to view your own data using MicrobiomeDB tools. </li>
            <li>Visualise most abundant taxa, compare diversity between groups of samples, and more.</li>
            <li>If you choose to, you can share your data set with others and receive shared data from your colleagues.</li>
          </ul>
        </div>
      </HelpIcon>
    </h1>
  {numOngoingUploads === 0 && GoToNewUploadLink()}
  {numOngoingUploads > 0 && UploadsListLinkShowingSummary(numOngoingUploads + " upload" + (numOngoingUploads>1 ? "s" : "") + " currently in progress")}
  </div>
);

export const MyDatasetsRibbon = (props: {projectName: string; numOngoingUploads: number;}) => {
  return (props.projectName === 'MicrobiomeDB'
    ? MyDatasetsMicrobiomeDBRibbon(props.numOngoingUploads)
    : MyDatasetsNoUploadRibbon(props.projectName)
  );
}

export const UploadDatasetRibbon = () => (
  <div className="UserDatasetNavigation">
    {BackToAllDatasetsLink()}
    <h1 className="UserDatasetNavigation-Title">
      Upload Data Set
    </h1>
    {GoToUploadsListLink()}
  </div>
);

export const AllUploadsRibbon = () => (
  <div className="UserDatasetNavigation">
    {BackToAllDatasetsLink()}
    <h1 className="UserDatasetNavigation-Title">
      Recent Uploads
    </h1>
    {BackToNewUploadLink()}
  </div>
);
