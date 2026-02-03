import React from 'react';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import {
  AnchoredTooltip,
  Mesa,
  MesaState,
} from '@veupathdb/coreui/lib/components/Mesa';

import { makeClassifier } from '../UserDatasetUtils';
import UserDatasetDetail, { DetailViewProps } from './UserDatasetDetail';
import BigwigGBrowseUploader from './BigwigGBrowseUploader';
import { DatasetDependency, DatasetDetails } from '../../Utils/types';
import { MesaColumn } from "@veupathdb/coreui/lib/components/Mesa/types";
import { WdkDependencies } from "@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect";

const classify = makeClassifier('UserDatasetDetail', 'BigwigDatasetDetail');

interface CompatibilityTableRow extends DatasetDependency {
  project: string;
}

interface TracksSectionRow {
  dataFileName: string;
  main?: any;
}

interface ComponentStateType extends Record<string, any> {
  sequenceId?: string;
}

class BigwigDatasetDetail extends UserDatasetDetail {
  constructor(props: DetailViewProps) {
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
    const { wdkService } = this.context! as WdkDependencies;
    const { dependencies } = userDataset;
    if (!userDataset.installTargets.includes(projectId)) return;
    let genome;
    // There will only ever be one such dependency in this array
    dependencies.forEach(function (dependency) {
      if (dependency.resourceIdentifier.endsWith('_Genome')) {
        const regex = new RegExp(
          '-' + dependency.resourceVersion + '_(.*)_Genome'
        );
        const genomeList = dependency.resourceIdentifier.match(regex);
        genome = genomeList?.[1];
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

  getTracksTableColumns(): Array<MesaColumn<TracksSectionRow>> {
    const { userDataset, config } = this.props;
    const { datasetId: id, name, dependencies } = userDataset;
    const { projectId } = config;

    let genome: string | undefined;
    dependencies.forEach(function (dependency) {
      if (dependency.resourceIdentifier.endsWith('_Genome')) {
        const regex = new RegExp(
          '-' + dependency.resourceVersion + '_(.*)_Genome'
        );
        const genomeList = dependency.resourceIdentifier.match(regex);
        genome = genomeList?.[1];
      }
    });

    return [
      {
        key: 'dataFileName',
        name: 'Filename',
        renderCell: ({ row }) => <code>{row.dataFileName}</code>,
      },
      {
        key: 'main',
        name: 'Genome Browser Link',
        renderCell: ({ row }) => (
          <BigwigGBrowseUploader
            sequenceId={(this.state as ComponentStateType).sequenceId}
            dataFileName={row.dataFileName}
            datasetId={id}
            projectId={projectId}
            genome={genome}
            datasetName={name}
          />
        ),
      },
    ];
  }

  renderTracksSection() {
    const { userDataset, config } = this.props;
    const { displayName: projectName } = config;

    const rows: Array<TracksSectionRow> = userDataset.files.install
      ?.contents
      ?.filter((file) => file.fileName.endsWith('.bw'))
      ?.map((file) => ({
        dataFileName: file.fileName,
      })) ?? [];

    const { status } = userDataset;

    const columns = this.getTracksTableColumns();
    const tracksTableState = MesaState.create({ rows, columns });

    const isInstalled =
      status?.import?.status === 'complete' &&
      status?.install?.find((d) => d.installTarget === config.projectId)
        ?.data?.status === 'complete';

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

    const { status, installTargets: projects } = userDataset;

    /**
     * In VDI, we know a dataset is compatible when the site-specific's install status
     * indicates a successful install.
     *
     * We know a dataset is incompatible when the site-specific's install status
     * indicates `missing-dependency`
     */
    const installStatusForCurrentProject = status.install?.find(
      (d) => d.installTarget === projectId
    );

    const isTargetingCurrentSite = projects.includes(projectId);
    const isInstalled = [
      userDataset.status.import,
      installStatusForCurrentProject?.meta?.status,
      installStatusForCurrentProject?.data?.status,
    ].every((status) => status === 'complete');

    const isIncompatible =
      installStatusForCurrentProject?.data?.status === 'missing-dependency';

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

  getCompatibilityTableColumns({ installTargets: projects }: DatasetDetails): Array<MesaColumn<CompatibilityTableRow>> {
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
