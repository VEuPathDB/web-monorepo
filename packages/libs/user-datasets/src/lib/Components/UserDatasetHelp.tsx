import { ReactNode } from 'react';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';
import { Link } from '@veupathdb/wdk-client/lib/Components';

import tutStep2 from './images/tut-step-2.jpg';
import tutStep3 from './images/tut-step-3.jpg';

interface Props {
  hasDirectUpload: boolean;
  projectName: string;
  quotaSize: number;
  workspaceTitle: ReactNode;
}

function UserDatasetHelp({
  hasDirectUpload,
  projectName,
  quotaSize,
  workspaceTitle,
}: Props) {
  // FIXME: Perhaps this should be provided via static content?
  return hasDirectUpload ? (
    <div className="UserDataset-Help">
      <section>
        <h2>Preparing data for upload</h2>
        <h4>Processing amplicon sequencing reads </h4>
        Taxon counts can be obtained from metagenome sequences through commonly
        available tools. Three of the most common ones (
        <a href="https://benjjneb.github.io/dada2">DADA2</a>,{' '}
        <a href="www.qiime.org">QIIME</a>, and{' '}
        <a href="www.mothur.org/wiki/Make.biom">Mothur</a>) have been integrated
        into workflows, and are available as a free online service, through
        NIAID's <a href="https://nephele.niaid.nih.gov/">Nephele</a> project.
        <h4>Formatting the input </h4>
        You can upload any file that contains processed taxonomic reads in a
        valid BIOM format. See <a href="http://biom-format.org/">
          this page
        </a>{' '}
        for examples. If your data is in a different format - for example TSV -
        you can use{' '}
        <a href="http://biom-format.org/documentation/biom_conversion.html">
          conversion tools
        </a>{' '}
        from the Python package <code>biom-format</code>.<h4>Sample Details</h4>
        Annotations for samples are not required, but they can be useful for
        subsetting and grouping samples.
        <br />
        <br />
        If possible, try to include rich sample details in your uploaded file,
        to obtain full benefits from our suite of visualisation and analysis
        tools.
        <br />
        <br />
        This{' '}
        <a href="http://biom-format.org/documentation/adding_metadata.html">
          documentation page
        </a>{' '}
        shows how to add sample details to a BIOM file using a tool{' '}
        <code>biom-add-metadata</code>.
      </section>
      <section>
        <h2>Tips for analysis</h2>
        Queries for user data sets work like they do for MicrobiomeDB data sets,
        allowing you to either proceed with the whole data set for analysis, or
        selecting a subset based on sample details or by taxon abundance. You
        can access them from each data set page.
        <br />
        You can extend and modify those searches using the strategies panel on
        the results page. This allows comparing uploaded data sets with each
        other, or with public MicrobiomeDB data sets.
        <br />
        <br />
        All analyses and visualisations available for MicrobiomeDB data sets can
        also be used on the uploaded data set, for example:
        <br />
        <ul>
          <li>
            Box and Whisker plot showing most abundant taxa, split by sample
            groups{' '}
          </li>
          <li>
            Alpha diversity trends for samples annotated by continuous variables
            like patient height or age{' '}
          </li>
          <li>Beta diversity plots annotated by sample groups</li>
          <li>
            {' '}
            Report of differentially abundant samples between groups of samples{' '}
          </li>
        </ul>
      </section>
    </div>
  ) : (
    <div>
      <div className="row UserDataset-Help">
        <div className="box xs-12">
          <h2>Introduction</h2>
          <iframe
            title="Introduction to User Datasets"
            src="https://www.youtube-nocookie.com/embed/igQZHjRBqV0"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            width="560"
            height="315"
          ></iframe>
        </div>
        <div className="box xs-12 md-6">
          <h2>VEuPathDB Galaxy</h2>
          <img alt="Screenshoot for step 2 of tutorial" src={tutStep2} />
          <ul>
            <li>
              Use the <b>VEuPathDB Export Tools</b> on the left-side navigation,
              at <Link to="/galaxy-orientation">VEuPathDB Galaxy</Link>.
            </li>
            <li>
              Prepare your export data set by selecting the files (galaxy data
              sets) in your history.{' '}
            </li>
            <li>
              The data set name, summary and description can be edited later in
              the <i>{workspaceTitle}</i> page.
            </li>
            <li>
              When you’re ready, <code>Execute</code> the export. The process of
              exporting to VEuPathDB may take some time. Progress can be
              monitored from the right-side history panel in Galaxy.
            </li>
          </ul>
        </div>
        <div className="box xs-12 md-6">
          <h2>{workspaceTitle} page</h2>
          <img alt="Screenshoot for step 3 of tutorial" src={tutStep3} />
          <ul>
            <li>
              You can now view, manage, share, and utilize your data set in{' '}
              <b>{projectName}</b>.
            </li>
            <li>
              {workspaceTitle} you’ve created contribute to a per-user upload
              limit/quota of <b>{bytesToHuman(quotaSize)}</b>.
            </li>
            <li>
              {' '}
              Bigwig files can be sent to JBrowse in the data set’s detail page.
              Click the data set name or status icon to see this page.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserDatasetHelp;
