import { InputDatasetType } from "../Service/Types/io-types";

export function equalTypes(dt1: InputDatasetType, dt2: InputDatasetType): boolean {
  return dt1.name === dt2.name && dt1.version === dt2.version;
}