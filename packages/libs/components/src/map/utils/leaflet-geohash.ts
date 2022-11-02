export function leafletZoomLevelToGeohashLevel(
  leafletZoomLevel: number
): number {
  switch (leafletZoomLevel) {
    case 1:
    case 2:
      return 1;
    case 3:
    case 4:
    case 5:
      return 2;
    case 6:
    case 7:
    case 8:
      return 3;
    case 9:
    case 10:
    case 11:
      return 4;
    case 12:
    case 13:
    case 14:
      return 5;
    case 15:
    case 16:
    case 17:
      return 6;
    default:
      return 6;
  }
}

export function tinyLeafletZoomLevelToGeohashLevel(
  leafletZoomLevel: number
): number {
  switch (leafletZoomLevel) {
    case 0:
    case 1:
      return 1;
    case 2:
    case 3:
      return 2;
    case 4:
    case 5:
      return 3;
    case 6:
    case 7:
    case 8:
      return 4;
    case 9:
    case 10:
    case 11:
      return 5;
    case 12:
    case 13:
    case 14:
      return 6;
    default:
      return 6;
  }
}
