import { DatasetListEntryShareInfo, InputDatasetType, UserInfo } from "../Service/Types";

export function equalTypes(dt1: InputDatasetType, dt2: InputDatasetType): boolean {
  return dt1.name === dt2.name && dt1.version === dt2.version;
}

export function userDisplayName(user: DatasetListEntryShareInfo): string;
export function userDisplayName(user: UserInfo): string;
export function userDisplayName(user: DatasetListEntryShareInfo | UserInfo): string {
  return user.firstName + " " + user.lastName;
}