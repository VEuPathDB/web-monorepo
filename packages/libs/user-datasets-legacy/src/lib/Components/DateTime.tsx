import React from 'react';

type Value = string | number | Date;

interface Props {
  datetime: Value;
}

export function DateTime(props: Props) {
  try {
    const dateObj = new Date(props.datetime);
    const isoString = dateObj.toISOString();
    const [_, date = 'Unknown', time = ''] =
      dateObj.toISOString().match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*/) ?? [];
    return (
      <div title={isoString}>
        {date} {time}
      </div>
    );
  } catch {
    return <div>Unknown</div>;
  }
}
