interface ZoomLevelToGeoHashLevel {
    zoomLevel: number
}

export default function ZoomLevelToGeoHashLevel({zoomLevel}: ZoomLevelToGeoHashLevel) {
    // const zoomLevelToGeohashLevelDefs: {0: number} = {
    //     0: 1,
    //     1: 1,
    //     2: 1,
    //     3: 1,
    //     4: 2,
    //     5: 2,
    //     6: 2,
    //     7: 3,
    //     8: 3,
    //     9: 3,
    //     10: 4,
    //     11: 4,
    //     12: 4,
    //     13: 5,
    //     14: 5,
    //     15: 5,
    //     16: 6,
    //     17: 6,
    //     18: 7
    // };
    console.log(zoomLevel);
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