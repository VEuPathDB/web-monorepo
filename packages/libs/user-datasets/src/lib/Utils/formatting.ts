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

export function formatFileSize(bytes: number, form: 'metric' | 'binary' = 'metric'): string {
  const div = form === 'metric' ? 1000 : 1024;
  let mag = 0;

  while (bytes > div && mag < 3) {
    bytes /= div;
    mag++;
  }

  const suffix = form === 'metric' ? 'B' : 'iB';
  let prefix = '';

  switch (mag) {
    case 0:
      return `${bytes}${suffix}`;

    case 1:
      prefix = 'K';
      break;

    case 2:
      prefix = 'M';
      break;

    case 3:
    default:
      prefix = 'G';
      break;
  }

  return `${Math.floor(bytes)}${prefix}${suffix}`;
}