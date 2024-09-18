import { ReactNode } from 'react';
import { DatasetUploadPageConfig, DataNoun } from '../Utils/types';
interface Props {
  baseUrl: string;
  helpRoute: string;
  uploadPageConfig: DatasetUploadPageConfig;
  urlParams: Record<string, string>;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  dataNoun: DataNoun;
}
declare function UserDatasetsWorkspace(props: Props): JSX.Element;
export default UserDatasetsWorkspace;
//# sourceMappingURL=UserDatasetsWorkspace.d.ts.map
