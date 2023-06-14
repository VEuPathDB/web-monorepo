import { SVGProps } from 'react';
// Currently same as DonutMarkers
export function BubbleMarkers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      id="Layer_1"
      x={0}
      y={0}
      viewBox="0 0 110.222 36.826"
      {...props}
    >
      <style>
        {
          '.st5,.st6,.st7,.st8{fill:none;stroke:#C3C2C2;stroke-width:5.4029;stroke-miterlimit:10}.st6,.st7,.st8{stroke:#7f7f7f}.st7,.st8{stroke:#4d4d4e}.st8{stroke:#262626}'
        }
      </style>
      <circle cx={55.078} cy={17.749} r={11.374} className="st5" />
      <circle cx={18.243} cy={17.749} r={11.374} className="st5" />
      <circle cx={91.914} cy={17.749} r={11.374} className="st5" />
      <path
        d="M43.733 18.565a11.325 11.325 0 0 0 2.477 6.307M11.35 8.7a11.356 11.356 0 0 0-4.482 9.049c0 2.679.926 5.142 2.477 7.086M84.971 26.76a11.325 11.325 0 0 0 6.942 2.364c6.282 0 11.374-5.092 11.374-11.374 0-.211-.006-.42-.017-.628"
        className="st6"
      />
      <path
        d="M45.646 24.109a11.363 11.363 0 0 0 9.432 5.015 11.37 11.37 0 0 0 10.001-5.953M8.811 24.109a11.363 11.363 0 0 0 9.432 5.015c6.282 0 11.374-5.092 11.374-11.374 0-2.734-.965-5.243-2.572-7.205M103.288 17.749a11.37 11.37 0 0 0-5.674-9.845"
        className="st7"
      />
      <path
        d="M64.425 24.233a11.324 11.324 0 0 0 2.028-6.484c0-6.282-5.092-11.374-11.374-11.374M28.12 12.105a11.37 11.37 0 0 0-9.877-5.73M97.831 8.033a11.325 11.325 0 0 0-5.918-1.659"
        className="st8"
      />
    </svg>
  );
}
