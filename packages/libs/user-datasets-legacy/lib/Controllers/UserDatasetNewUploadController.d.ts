/// <reference types="react" />
import { DatasetUploadTypeConfigEntry } from '../Utils/types';
interface Props<T extends string = string> {
  baseUrl: string;
  datasetUploadType: DatasetUploadTypeConfigEntry<T>;
  urlParams: Record<string, string>;
}
export default function UserDatasetUploadController({
  baseUrl,
  datasetUploadType,
  urlParams,
}: Props): JSX.Element;
export {};
//# sourceMappingURL=UserDatasetNewUploadController.d.ts.map
