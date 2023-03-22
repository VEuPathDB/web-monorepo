import React from "react";
import { IconProps } from "./types";
import Arrow from "./Arrow";
import CaretDown from "./CaretDown";
import CaretUp from "./CaretUp";
import DoubleArrow from "./DoubleArrow";
import Cancel from "./Cancel";

export { IconProps, Arrow, CaretDown, CaretUp, DoubleArrow, Cancel };

interface Props extends Required<IconProps> {
  children: React.ReactElement;
}

const Icon = ({ width, height, color, extraCSS, children }: Props) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    version="1.1"
    fill={color}
    css={{ ...extraCSS }}
  >
    {children}
  </svg>
);

export default Icon;
