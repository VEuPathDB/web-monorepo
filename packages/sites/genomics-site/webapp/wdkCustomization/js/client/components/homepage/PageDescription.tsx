import React from 'react';

import { Link } from 'wdk-client/Components';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';

import { makeVpdbClassNameHelper } from './Utils';

import './PageDescription.scss';

const cx = makeVpdbClassNameHelper('PageDescription');

const PORTAL_SITE_PROJECT_ID = 'EuPathDB';

export const PageDescription = () => {
  const config = useWdkService(wdkService => wdkService.getConfig(), []);

  const SiteDescription = (config?.projectId && customSiteDescriptions[config?.projectId]) || DefaultComponentSiteDescription;

  return (
    <div className={cx('')}>
      <SiteDescription projectId={config?.projectId} displayName={config?.displayName} />
    </div>
  );
};

interface DescriptionProps {
  projectId: string | undefined;
  displayName: string | undefined;
}

// As necessary, add entries for custom site descriptions, keyed by project id
const customSiteDescriptions: Record<string, React.ComponentType<DescriptionProps>> = {
  [PORTAL_SITE_PROJECT_ID]: PortalSiteDescription
};

function DefaultComponentSiteDescription ({ displayName }: DescriptionProps) {
  return (
    <p>
      As part of the VEuPathDB
      {' '}
      <a href="https://www.niaid.nih.gov/research/bioinformatics-resource-centers" target="_blank">Bioinformatics Resource Center</a>,
      {' '}
      <span className={cx('--DisplayName')}>{displayName}</span>
      {' '}
      provides genomic, phenotypic, and population-centric data to the scientific community for <Link to="/search/organism/GenomeDataTypes/result">these organisms</Link>.
    </p>
  );
};

function PortalSiteDescription({ displayName }: DescriptionProps) {
  return (
    <p>
      The <span className={cx('--DisplayName')}>{displayName}</span>
      {' '}
      <a href="https://www.niaid.nih.gov/research/bioinformatics-resource-centers" target="_blank">Bioinformatics Resource Center</a>
      {' '}
      makes genomic, phenotypic, and population-centric data accessible to the scientific community. VEuPathDB provides support for <Link to="/search/organism/GenomeDataTypes/result">these organisms</Link>.
      <p></p>This project is funded in part by the US National Institute of Allergy and Infectious Diseases (Contract HHSN272201400027C).
    </p>
  );
};
