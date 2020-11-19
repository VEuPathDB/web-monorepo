import React from 'react';

type TooltipContentProps = {
  colorSwatch?: string | undefined;
  data: { [key: string]: string | number | undefined };
};

export default function TooltipContent({
  colorSwatch,
  data,
}: TooltipContentProps) {
  return (
    <div>
      {Object.entries(data).map((entry) => (
        <div>
          <span
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontWeight: 700,
            }}
          >{`${entry[0]}: `}</span>
          <span
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
            {entry[1]}
          </span>
        </div>
      ))}
    </div>
  );
}
