import { DatasetListShareUser, DatasetUser } from './types';

export function datasetUserFullName(
  user: DatasetUser | DatasetListShareUser
): string {
  if (user.firstName && user.lastName)
    return user.firstName + ' ' + user.lastName;

  if (user.firstName) return user.firstName;

  if (user.lastName) return user.lastName;

  return 'unknown user';
}
