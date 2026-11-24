import React from 'react';
import { DataNoun } from '../../../../Common/Configuration';
import { DatasetDependency, DatasetGetResponseBody } from '../../../../Service/Model';
import { projectId } from '../../../../config';
import { MesaColumn, MesaStateProps } from '@veupathdb/coreui/lib/components/Mesa/types';
import { useSelector } from 'react-redux';
import { StateSlice } from '../../../../StoreModules/types';
import Mesa, { AnchoredTooltip } from '@veupathdb/coreui/lib/components/Mesa';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';

export type CompatibilityProps = {
  readonly dataNoun: DataNoun;
  readonly dataset: DatasetGetResponseBody;
  readonly isInstalled: boolean;
};

export const Compatibility = ({
  dataNoun,
  dataset,
  isInstalled,
}: CompatibilityProps) => {
  const displayName = useSelector(({ globalData: { config } }: StateSlice) => config!.displayName!);

  const tableState: MesaStateProps<CompatibilityRow> = {
    columns: getTableColumns(dataset),
    rows: dataset.dependencies as Array<CompatibilityRow>,
  };

  const compatibilityStatus = getStatus(dataNoun, dataset, isInstalled);

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
        <Mesa state={tableState} />
      </div>
      {compatibilityStatus}
    </section>
  );
};

type CompatibilityRow = DatasetDependency & { readonly project?: string; }

const getTableColumns = ({ installTargets }: DatasetGetResponseBody): Array<MesaColumn<CompatibilityRow>> =>
  [
    {
      key: 'project',
      name: 'VEuPathDB Website',
      renderCell: () => installTargets.join(', '),
    },
    {
      key: 'resourceDisplayName',
      name: 'Required Resource',
      renderCell: ({ row }) => row.resourceDisplayName,
    },
    {
      key: 'resourceVersion',
      name: 'Required Resource Release',
      renderCell: ({ row }) => row.resourceVersion,
    },
  ];

const getStatus = (
  dataNoun: DataNoun,
  { status, installTargets }: DatasetGetResponseBody,
  isInstalled: boolean,
) => {
  /**
   * In VDI, we know a dataset is compatible when the site-specific's install
   * status indicates a successful install.
   *
   * We know a dataset is incompatible when the site-specific's install status
   * indicates `missing-dependency`
   */
  const currentStatus = status.install
    ?.find((d) => d.installTarget === projectId);

  const isTargetingCurrentSite = isInstalled || installTargets.includes(projectId);

  const isIncompatible = currentStatus?.data?.status === 'missing-dependency';

  if (!isTargetingCurrentSite || (isTargetingCurrentSite && isIncompatible)) {
    return (
      // if projectIds don't match, then we're not installable and thus
      // incompatible.
      //
      // if we're installable but failed due to a missing dependency, we're
      // incompatible
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
    // instead of attempting to provide very granular messaging for when things
    // are neither compatible nor incompatible, let's let the dataset page's
    // Status messaging handle this
    return null;
  }
};
