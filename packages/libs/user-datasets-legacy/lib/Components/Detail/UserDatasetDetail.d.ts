export default UserDatasetDetail;
declare class UserDatasetDetail extends React.Component<any, any, any> {
  constructor(props: any);
  state: {
    sharingModalOpen: boolean;
  };
  onMetaSave(key: any): (value: any) => any;
  isMyDataset(): any;
  validateKey(key: any): void;
  handleDelete(): void;
  getAttributes(): (
    | {
        className: string;
        attribute: any;
        value: JSX.Element;
      }
    | {
        attribute: string;
        value: any;
        className?: undefined;
      }
    | null
  )[];
  renderAttributeList(): JSX.Element;
  renderHeaderSection(): JSX.Element;
  renderDatasetActions(): JSX.Element;
  renderCompatibilitySection(): JSX.Element;
  getCompatibilityTableColumns(): (
    | {
        key: string;
        name: string;
        renderCell({ row }: { row: any }): any;
      }
    | {
        key: string;
        name: string;
      }
  )[];
  openSharingModal(): void;
  renderFileSection(): JSX.Element;
  closeSharingModal(): void;
  getFileTableColumns(): (
    | {
        key: string;
        name: string;
        renderCell({ row }: { row: any }): JSX.Element;
        width?: undefined;
        headingStyle?: undefined;
      }
    | {
        key: string;
        name: string;
        renderCell({ row }: { row: any }): string;
        width?: undefined;
        headingStyle?: undefined;
      }
    | {
        key: string;
        name: string;
        width: string;
        headingStyle: {
          textAlign: string;
        };
        renderCell({ row }: { row: any }): JSX.Element;
      }
  )[];
  renderDetailsSection(): JSX.Element;
  renderAllDatasetsLink(): JSX.Element;
  /** @return {import("react").ReactNode[]} */
  getPageSections(): import('react').ReactNode[];
  render(): JSX.Element;
}
declare namespace UserDatasetDetail {
  export { WdkDependenciesContext as contextType };
}
import React from 'react';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
//# sourceMappingURL=UserDatasetDetail.d.ts.map
