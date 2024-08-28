import React from 'react';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { Mesa, MesaState } from '@veupathdb/coreui/lib/components/Mesa';

import { makeClassifier } from '../UserDatasetUtils';
import UserDatasetDetail from './UserDatasetDetail';
import BigwigGBrowseUploader from './BigwigGBrowseUploader';

const classify = makeClassifier('UserDatasetDetail', 'BigwigDatasetDetail');

class BigwigDatasetDetail extends UserDatasetDetail {
  constructor(props) {
    super(props);
    this.renderTracksSection = this.renderTracksSection.bind(this);
    this.getTracksTableColumns = this.getTracksTableColumns.bind(this);
    this.renderCompatibilitySection =
      this.renderCompatibilitySection.bind(this);
    this.getCompatibilityStatus = this.getCompatibilityStatus.bind(this);
    this.getCompatibilityTableColumns =
      this.getCompatibilityTableColumns.bind(this);
    this.state = {
      ...this.state,
      sequenceId: null,
    };
  }

  componentDidMount() {
    const {
      userDataset,
      config: { projectId },
    } = this.props;
    const { wdkService } = this.context;
    const { dependencies } = userDataset;
    if (!userDataset.projects.includes(projectId)) return;
    let genome;
    // There will only ever be one such dependency in this array
    dependencies.forEach(function (dependency) {
      if (dependency.resourceIdentifier.endsWith('_Genome')) {
        const regex = new RegExp(
          '-' + dependency.resourceVersion + '_(.*)_Genome'
        );
        const genomeList = dependency.resourceIdentifier.match(regex);
        genome = genomeList[1];
      }
    });
    if (genome == null) return;
    wdkService
      .getAnswerJson(
        {
          searchName: 'LongestSeqForAnOrganism',
          searchConfig: {
            parameters: {
              organismNameForFiles: genome,
            },
          },
        },
        {}
      )
      .then((res) => this.setState({ sequenceId: res.records[0].displayName }));
  }

  getTracksTableColumns() {
    const { userDataset, appUrl, config } = this.props;
    const { id, meta, dependencies } = userDataset;
    const name = meta.name;
    const { projectId } = config;

    let genome;
    dependencies.forEach(function (dependency) {
      if (dependency.resourceIdentifier.endsWith('_Genome')) {
        const regex = new RegExp(
          '-' + dependency.resourceVersion + '_(.*)_Genome'
        );
        const genomeList = dependency.resourceIdentifier.match(regex);
        genome = genomeList[1];
      }
    });

    return [
      {
        key: 'datafileName',
        name: 'Filename',
        renderCell: ({ row }) => <code>{row.dataFileName}</code>,
      },
      {
        key: 'main',
        name: 'Genome Browser Link',
        renderCell: ({ row }) => (
          <BigwigGBrowseUploader
            sequenceId={this.state.sequenceId}
            dataFileName={row.dataFileName}
            datasetId={id}
            appUrl={appUrl}
            projectId={projectId}
            genome={genome}
            datasetName={name}
          />
        ),
      },
    ];
  }

  renderTracksSection() {
    const { userDataset, appUrl, projectName, config, fileListing } =
      this.props;
    const installFiles = fileListing.install?.contents
      ?.filter((file) => file.fileName.endsWith('.bw'))
      .map((file) => ({
        dataFileName: file.fileName,
      }));
    const { status } = userDataset;

    const rows =
      installFiles && Array.isArray(installFiles) ? installFiles : [];
    const columns = this.getTracksTableColumns({ userDataset, appUrl });
    const tracksTableState = MesaState.create({ rows, columns });

    const isInstalled =
      status?.import === 'complete' &&
      status?.install?.find((d) => d.projectId === config.projectId)
        ?.dataStatus === 'complete';

    return !rows.length ? null : isInstalled ? (
      <section>
        <h3 className={classify('SectionTitle')}>
          <Icon fa="bar-chart" />
          Genome Browser Tracks
        </h3>
        <div className="TracksTable">
          <Mesa state={tracksTableState} />
        </div>
      </section>
    ) : (
      <section>
        This data set isn't installed to {projectName} or contains no files.
      </section>
    );
  }

  /* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

                                Compatible Table

   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

  renderCompatibilitySection() {
    const { userDataset, config, dataNoun } = this.props;
    const { displayName } = config;

    const compatibilityTableState = MesaState.create({
      columns: this.getCompatibilityTableColumns(userDataset),
      rows: userDataset.dependencies,
    });

    const compatibilityStatus = this.getCompatibilityStatus();

    return (
      <section id="dataset-compatibility">
        <h2>
          Use This {dataNoun.singular} in {displayName}
        </h2>
        <h3>
          <Icon fa="puzzle-piece" />
          Compatibility Information &nbsp;
          <AnchoredTooltip
            content={`The data and genomes listed here are requisite for using the data in this user ${dataNoun.singular.toLowerCase()}.`}
          >
            <div className="HelpTrigger">
              <Icon fa="question-circle" />
            </div>
          </AnchoredTooltip>
        </h3>
        <div style={{ maxWidth: '600px' }}>
          <Mesa state={compatibilityTableState} />
        </div>
        {compatibilityStatus}
      </section>
    );
  }

  getCompatibilityStatus() {
    const { userDataset, config, dataNoun } = this.props;
    const { projectId } = config;

    const { status, projects } = userDataset;

    /**
     * In VDI, we know a dataset is compatible when the site-specific's install status
     * indicates a successful install.
     *
     * We know a dataset is incompatible when the site-specific's install status
     * indicates `missing-dependency`
     */
    const installStatusForCurrentProject = status.install?.find(
      (d) => d.projectId === projectId
    );

    const isTargetingCurrentSite = projects.includes(projectId);
    const isInstalled = [
      userDataset.status.import,
      installStatusForCurrentProject?.metaStatus,
      installStatusForCurrentProject?.dataStatus,
    ].every((status) => status === 'complete');

    const isIncompatible =
      installStatusForCurrentProject?.dataStatus === 'missing-dependency';

    if (!isTargetingCurrentSite || (isTargetingCurrentSite && isIncompatible)) {
      return (
        // if projectIds don't match, then we're not installable and thus incompatible
        // if we're installable but failed due to a missing dependency, we're incompatible
        <p className="danger">
          This {dataNoun.singular.toLowerCase()} is not compatible with{' '}
          <b>{projectId}</b>.
        </p>
      );
    } else if (isInstalled) {
      return (
        // if we've installed successfully and we're installable, we're compatible
        <p className="success">
          This {dataNoun.singular.toLowerCase()} is compatible with{' '}
          <b>{projectId}</b>. It is installed for use.
        </p>
      );
    } else {
      // instead of attempting to provide very granular messaging for when things are neither
      // compatible nor incompatible, let's let the dataset page's Status messaging handle this
      return null;
    }
  }

  getCompatibilityTableColumns() {
    const { userDataset } = this.props;
    const { projects } = userDataset;
    return [
      {
        key: 'project',
        name: 'VEuPathDB Website',
        renderCell() {
          return projects.join(', ');
        },
      },
      {
        key: 'resourceDisplayName',
        name: 'Required Resource',
        renderCell({ row }) {
          const { resourceDisplayName } = row;
          return resourceDisplayName;
        },
      },
      {
        key: 'resourceVersion',
        name: 'Required Resource Release',
        renderCell({ row }) {
          const { resourceVersion } = row;
          return resourceVersion;
        },
      },
    ];
  }

  // See note in the base class, UserDatasetDetail
  /** @return {import("react").ReactNode[]} */
  getPageSections() {
    const [headerSection, fileSection] = super.getPageSections();
    return [
      headerSection,
      this.renderCompatibilitySection,
      this.renderTracksSection,
      fileSection,
    ];
  }
}

export default BigwigDatasetDetail;
