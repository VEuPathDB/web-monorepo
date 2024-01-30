import React from 'react';
import { Link } from 'react-router-dom';
import { defaultMemoize } from 'reselect';

import {
  CommonResultTable,
  ColumnSettings,
} from '@veupathdb/wdk-client/lib/Components/Shared/CommonResultTable';
import { GenomeViewSequence } from '../../types/genomeSummaryViewTypes';
import {
  GenomeViewFeatureModel,
  GenomeViewRegionModel,
  useIsPortalSite,
} from '../../util/GenomeSummaryViewUtils';

const featureColumnsFactory = defaultMemoize(
  (
    displayName: string,
    recordType: string,
    sequence: GenomeViewSequence,
    isPortalSite: boolean
  ) =>
    [
      !isPortalSite && {
        key: 'sourceId',
        name: displayName,
        renderCell: ({ value: sourceId }: { value: string }) => (
          <Link to={`/record/${recordType}/${sourceId}`} target="_blank">
            <u>{sourceId}</u>
          </Link>
        ),
        sortable: true,
        sortType: 'text',
      },
      {
        key: 'start',
        name: 'Start',
        sortable: true,
        sortType: 'number',
      },
      {
        key: 'end',
        name: 'End',
        sortable: true,
        sortType: 'number',
      },
      // !isPortalSite && {
      //   key: 'sourceId',
      //   name: 'Go To',
      //   renderCell: ({ row: feature }: { row: any }) =>
      //     <Link to={`/jbrowse?loc=${feature.context}&tracks=gene&data=/a/service/jbrowse/tracks/${sequence.organismAbbrev}`} target="_blank">
      //       <u>Genome browser</u>
      //     </Link>,
      //   sortable: true,
      //   sortType: 'text'
      // }
    ].filter(
      (column) => typeof column !== 'boolean'
    ) as ColumnSettings<GenomeViewFeatureModel>[]
);

interface FeatureTableProps {
  region: GenomeViewRegionModel;
  sequence: GenomeViewSequence;
  displayName: string;
  displayNamePlural: string;
  recordType: string;
}

export const FeatureTable: React.SFC<FeatureTableProps> = ({
  region,
  sequence,
  displayName,
  recordType,
}) => {
  const isPortalSite = useIsPortalSite();

  return (
    <CommonResultTable
      rows={region.features}
      columns={featureColumnsFactory(
        displayName,
        recordType,
        sequence,
        isPortalSite
      )}
      emptyResultMessage="No Features present in region"
    />
  );
};
