import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
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
  }
  getTracksTableColumns() {
    const { userDataset, appUrl, config } = this.props;
    const { id, type, meta, dependencies } = userDataset;
    const name = meta.name;
    const { projectId } = config;
    const { seqId } = type && type.data ? type.data : { seqId: null };
    var genome;
    dependencies.forEach(function (dependency) {
      if (dependency.resourceIdentifier.endsWith('_Genome')) {
        var regex = new RegExp(
          '-' + dependency.resourceVersion + '_(.*)_Genome'
        );
        var genomeList = dependency.resourceIdentifier.match(regex);
        genome = genomeList[1];
      }
    });
    return [
      {
        key: 'datafileName',
        name: 'Filename',
        renderCell: ({ row }) => _jsx('code', { children: row.datafileName }),
      },
      {
        key: 'main',
        name: 'Genome Browser Link',
        renderCell: ({ row }) =>
          _jsx(
            BigwigGBrowseUploader,
            Object.assign({ sequenceId: seqId }, row, {
              datasetId: id,
              appUrl: appUrl,
              projectId: projectId,
              genome: genome,
              datasetName: name,
            })
          ),
      },
    ];
  }
  renderTracksSection() {
    const { userDataset, appUrl, projectName } = this.props;
    const { type } = userDataset;
    const { data } = type;
    const rows = data && Array.isArray(data.tracks) ? data.tracks : [];
    const columns = this.getTracksTableColumns({ userDataset, appUrl });
    const tracksTableState = MesaState.create({ rows, columns });
    return !rows.length
      ? null
      : userDataset.isInstalled
      ? _jsxs('section', {
          children: [
            _jsxs(
              'h3',
              Object.assign(
                { className: classify('SectionTitle') },
                {
                  children: [
                    _jsx(Icon, { fa: 'bar-chart' }),
                    'Genome Browser Tracks',
                  ],
                }
              )
            ),
            _jsx(
              'div',
              Object.assign(
                { className: 'TracksTable' },
                { children: _jsx(Mesa, { state: tracksTableState }) }
              )
            ),
          ],
        })
      : _jsxs('section', {
          children: [
            "This data set isn't installed to ",
            projectName,
            ' or contains no files.',
          ],
        });
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
//# sourceMappingURL=BigwigDatasetDetail.js.map
