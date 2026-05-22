import { DatasetListShareUser, DatasetUser } from '../Service';

export function datasetUserFullName(user: DatasetUser | DatasetListShareUser): string {
  if (user.firstName && user.lastName)
    return user.firstName + ' ' + user.lastName;

  if (user.firstName)
    return user.firstName;

  if (user.lastName)
    return user.lastName;

  return 'unknown user';
}

export function formatFileSize(
  bytes: number,
  form: 'metric' | 'binary' = 'metric'
): string {
  const div = form === 'metric' ? 1000 : 1024;
  let mag = 0;
  let quo = bytes;

  while (quo > div && mag < 4) {
    quo /= div;
    mag++;
  }

  const suffix = form === 'metric' ? 'B' : 'iB';
  let prefix = '';

  switch (mag) {
    case 0:
      return `${bytes}B`;

    case 1:
      prefix = 'K';
      break;

    case 2:
      prefix = 'M';
      break;

    case 3:
      prefix = 'G';
      break;

    case 4:
    default:
      prefix = 'T';
      break;
  }

  // remove insignificant decimal places
  const formattedNum = quo.toFixed(2)
    .toString()
    .match(/^\d+(?:\.[1-9]{1,2})?/);

  return (
    (formattedNum ? formattedNum[0] : Math.floor(quo).toString()) +
    prefix +
    suffix
  );
}
