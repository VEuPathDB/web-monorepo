import React from 'react';

type Value = string | number | Date;

interface Props {
  datetime: Value;
}

export function DateTime(props: Props) {
  try {
    const dateObj = new Date(props.datetime);
    const localeString = dateObj.toLocaleString();
    return <div title={localeString}>{localeString}</div>;
  } catch {
    return <div>Unknown</div>;
  }
}
