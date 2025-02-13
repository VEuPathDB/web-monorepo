import { ComponentType, ReactNode } from 'react';
import { DatasetUploadTypeConfig, DataNoun } from '../Utils/types';
import { UserDatasetDetailProps } from './UserDatasetDetailController';
interface Props<T1 extends string = string, T2 extends string = string> {
  availableUploadTypes?: T1[];
  detailsPageTitle: string;
  helpRoute: string;
  uploadTypeConfig: DatasetUploadTypeConfig<T2>;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  detailComponentsByTypeName?: Record<
    string,
    ComponentType<UserDatasetDetailProps>
  >;
  dataNoun: DataNoun;
}
export declare function UserDatasetRouter<
  T1 extends string,
  T2 extends string
>({
  availableUploadTypes,
  detailsPageTitle,
  helpRoute,
  uploadTypeConfig,
  workspaceTitle,
  helpTabContents,
  detailComponentsByTypeName,
  dataNoun,
}: Props<T1, T2>): JSX.Element;
export {};
//# sourceMappingURL=UserDatasetRouter.d.ts.map
