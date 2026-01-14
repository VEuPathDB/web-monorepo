import React, { Fragment } from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { makeVpdbClassNameHelper } from './Utils';

import './PageDescription.scss';

const cx = makeVpdbClassNameHelper('PageDescription');

export const PageDescription = () => {
  const config = useWdkService((wdkService) => wdkService.getConfig(), []);

  const SiteDescription =
    (config?.projectId && customSiteDescriptions[config?.projectId]) ||
    DefaultComponentSiteDescription;

  return (
    <div className={cx('')}>
      <SiteDescription
        projectId={config?.projectId}
        displayName={config?.displayName}
      />
    </div>
  );
};

interface DescriptionProps {
  projectId: string | undefined;
  displayName: string | undefined;
}

// As necessary, add entries for custom site descriptions, keyed by project id
const customSiteDescriptions: Record<
  string,
  React.ComponentType<DescriptionProps>
> = {};

function DefaultComponentSiteDescription({ displayName }: DescriptionProps) {
  return (
    <Fragment>
      <p>
        VEuPathDB makes genomic, phenotypic, and population-centric data
        accessible to the scientific community.{' '}
        <span className={cx('--DisplayName')}>{displayName}</span> provides
        support for{' '}
        <Link to="/search/organism/GenomeDataTypes/result">
          these organisms
        </Link>
        .
      </p>
      <p>
        This project is funded by voluntary subscriptions from users; bridge
        funding from Coefficient Giving and a Wellcome Trust discretionary
        award; additional support from the Universities of Pennsylvania and
        Georgia; collaborative research grants (Wellcome Trust Discovery Award,
        BBR24, AccelNet Design/NSF); and charitable donations.
      </p>
    </Fragment>
  );
}
