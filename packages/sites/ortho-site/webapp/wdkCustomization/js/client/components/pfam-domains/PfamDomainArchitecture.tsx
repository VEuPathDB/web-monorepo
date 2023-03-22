import React from 'react';

import { PfamDomain } from 'ortho-client/components/pfam-domains/PfamDomain';

import './PfamDomainArchitecture.scss';

interface Props {
  length: number;
  domains: { start: number, end: number, pfamId: string }[];
  style?: React.CSSProperties;
}

export interface Domain {
  start: number;
  end: number;
  pfamId: string;
};

export function PfamDomainArchitecture({ length, domains, style }: Props) {
  return (
    <div className="PfamDomainArchitecture" style={style}>
      <div className="ProteinGraph"></div>
      {
        domains.map(
          domain => (
            <PfamDomain
              key={`${domain.pfamId}}-${domain.start}-${domain.start}`}
              pfamId={domain.pfamId}
              title={makeDomainTitle(domain)}
              style={makeDomainPositionStyling(length, domain)}
            />
          )
        )
      }
    </div>
  );
}

function makeDomainTitle({ start, end, pfamId }: Domain) {
  return `${pfamId} (location: [${start} - ${end}])`;
}

function makeDomainPositionStyling(architectureLength: number, { start, end }: Domain): React.CSSProperties {
  const domainLength = end - start + 1;

  const domainWidth = `${(domainLength / architectureLength) * 100}%`;
  const domainLeft = `${(start / architectureLength) * 100}%`;

  return {
    width: domainWidth,
    left: domainLeft
  };
}
