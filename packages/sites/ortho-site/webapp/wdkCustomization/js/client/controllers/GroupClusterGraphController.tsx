import React from 'react';

interface Props {
  groupName: string;
}

export function GroupClusterGraphController(props: Props) {
  return <div>A cluster graph display for {props.groupName} will be rendered here</div>;
}
