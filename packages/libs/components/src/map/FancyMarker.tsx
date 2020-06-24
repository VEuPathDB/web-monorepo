import React, { useState, useCallback } from "react";
import { Marker } from "react-leaflet";
import { FancyMarkerProps } from "./Types";

export default function FancyMarker(props: FancyMarkerProps) {
  return <Marker {...props} title='fancy' />;
}

