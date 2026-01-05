import React from 'react';

export type NumberedHeaderProps = {
  number: number;
  text: string;
  color?: string;
};

export default function NumberedHeader(props: NumberedHeaderProps) {
  const color = props.color ?? 'black';
  const height = 25;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          flexShrink: 0,
          width: height,
          height: height,
          lineHeight: height + 'px',
          color: color,
          border: '2px solid ' + color,
          borderRadius: height,
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          boxSizing: 'content-box',
          userSelect: 'none',
        }}
      >
        {props.number}
      </div>
      <div
        style={{
          display: 'inline-block',
          flex: 1,
          marginLeft: 5,
          paddingTop: '2px',
          lineHeight: height + 'px',
          color: color,
          fontSize: 16,
          fontWeight: 'bold',
        }}
      >
        {props.text}
      </div>
    </div>
  );
}
