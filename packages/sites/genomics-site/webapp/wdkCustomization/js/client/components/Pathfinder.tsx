import React from 'react';

import './Pathfinder.scss';

interface Props {
  src: string;
}

export default function Pathfinder(props: Props) {
  return (
    <iframe
      title="PathFinder"
      src={props.src}
      width="100%"
      height="100%"
      allowFullScreen
    ></iframe>
  );
}
