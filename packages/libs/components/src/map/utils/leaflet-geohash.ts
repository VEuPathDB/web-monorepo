export function leafletZoomLevelToGeohashLevel(
  leafletZoomLevel: number
): number {
  // this was copied from eda
  // consider not rounding when addressing https://github.com/VEuPathDB/web-monorepo/issues/895 ?
  const roundedZoomLevel = Math.round(leafletZoomLevel);
  if (roundedZoomLevel <= 2) return 1;
  if (roundedZoomLevel <= 5) return 2;
  if (roundedZoomLevel <= 8) return 3;
  if (roundedZoomLevel <= 11) return 4;
  if (roundedZoomLevel <= 14) return 5;
  return 6;
}

export function tinyLeafletZoomLevelToGeohashLevel(
  leafletZoomLevel: number
): number {
  if (leafletZoomLevel <= 1) return 1;
  if (leafletZoomLevel <= 3) return 2;
  if (leafletZoomLevel <= 5) return 3;
  if (leafletZoomLevel <= 8) return 4;
  if (leafletZoomLevel <= 11) return 5;
  return 6;
}
