interface ZoomLevelToGeoHashLevel {
    zoomLevel: number
}

export default function ZoomLevelToGeoHashLevel({zoomLevel}: ZoomLevelToGeoHashLevel) {
    const zoomLevelToGeohashLevelDefs = [
        1, // 0
        1, // 1
        1, // 2
        1, // 3
        2, // 4
        2, // 5
        2, // 6
        3, // 7
        3, // 8
        3, // 9
        4, // 10
        4, // 11
        4, // 12
        5, // 13
        5, // 14
        5, // 15
        6, // 16
        6, // 17
        7  // 18
    ];
    return(zoomLevelToGeohashLevelDefs[zoomLevel])
}