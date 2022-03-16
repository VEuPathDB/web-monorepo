export function makeClassifier(...classNames) {
  return (substyle = null) =>
    classNames
      .map((className) => `${className}${substyle ? '-' + substyle : ''}`)
      .join(' ');
}

export const quotaSize = 10737418240; // 10 G

export function normalizePercentage(value) {
  return Math.floor(value * 100) / 100;
}

export function textCell(prop, transform) {
  const getValue =
    typeof transform === 'function' ? transform : (value) => value;
  return ({ row }) => (prop in row ? <span>{getValue(row[prop])}</span> : null);
}

export function getDownloadUrl(datasetId, filename) {
  if (typeof datasetId !== 'number')
    throw new TypeError(
      `Can't build downloadUrl; invalid datasetId given (${datasetId}) [${typeof datasetId}]`
    );
  if (typeof filename !== 'string')
    throw new TypeError(
      `Can't build downloadUrl; invalid filename given (${filename}) [${typeof filename}]`
    );

  return `/service/users/current/user-datasets/${datasetId}/user-datafiles/${filename}`;
}
