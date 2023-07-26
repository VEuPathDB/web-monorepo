import React, { useMemo } from 'react';

import { assignColors } from 'ortho-client/utils/pfamDomain';

import './PfamDomain.scss';

interface Props {
  pfamId: string;
  style?: React.CSSProperties;
  title?: string;
}

export function PfamDomain({ pfamId, style, title }: Props) {
  const colors = useMemo(() => assignColors(pfamId), [pfamId]);

  return (
    <div className="PfamDomain" style={style} title={title}>
      {colors.map((color, i) => (
        <div className="Band" key={i} style={{ backgroundColor: color }}></div>
      ))}
    </div>
  );
}
