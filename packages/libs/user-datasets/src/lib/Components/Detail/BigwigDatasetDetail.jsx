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

  getPageSections() {
    const [headerSection, compatSection, fileSection] = super.getPageSections();
    return [
      headerSection,
      compatSection,
      this.renderTracksSection,
      fileSection,
    ];
  }
}

export default BigwigDatasetDetail;
