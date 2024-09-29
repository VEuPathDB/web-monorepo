import React from 'react';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import {
  DataNoun,
  UserDataset,
  UserDatasetMeta,
  UserDatasetShare,
} from '../../Utils/types';
import './UserDatasetList.scss';
interface Props {
  baseUrl: string;
  user: User;
  location: any;
  projectId: string;
  projectName: string;
  userDatasets: UserDataset[];
  filterByProject: boolean;
  shareUserDatasets: (
    userDatasetIds: number[],
    recipientUserIds: number[]
  ) => any;
  unshareUserDatasets: (
    userDatasetIds: number[],
    recipientUserIds: number[]
  ) => any;
  removeUserDataset: (dataset: UserDataset) => any;
  updateUserDatasetDetail: (
    userDataset: UserDataset,
    meta: UserDatasetMeta
  ) => any;
  updateProjectFilter: (filterByProject: boolean) => any;
  quotaSize: number;
  dataNoun: DataNoun;
}
interface State {
  selectedRows: number[];
  uiState: {
    sort: MesaSortObject;
  };
  searchTerm: string;
  sharingModalOpen: boolean;
  editingCache: any;
}
interface MesaDataCellProps {
  row: UserDataset;
  column: MesaColumn<UserDataset>;
  rowIndex: number;
  columnIndex: number;
  inline?: boolean;
}
declare class UserDatasetList extends React.Component<Props, State> {
  constructor(props: Props);
  isRowSelected(row: UserDataset): boolean;
  isMyDataset(dataset: UserDataset): boolean;
  onSearchTermChange(searchTerm: string): void;
  onMetaAttributeSaveFactory(
    dataset: UserDataset,
    attrKey: string
  ): (value: string) => any;
  renderSharedWithCell(cellProps: MesaDataCellProps): string | null;
  renderStatusCell(cellProps: MesaDataCellProps): JSX.Element;
  renderOwnerCell(cellProps: MesaDataCellProps): JSX.Element;
  getColumns(): any[];
  onRowSelect(row: UserDataset): void;
  onRowDeselect(row: UserDataset): void;
  onMultipleRowSelect(rows: UserDataset[]): void;
  onMultipleRowDeselect(rows: UserDataset[]): void;
  onSort(column: MesaColumn<UserDataset>, direction: string): void;
  getEventHandlers(): {
    onSort: (
      column: MesaColumn<
        UserDataset,
        keyof UserDataset,
        | string
        | number
        | boolean
        | UserDatasetMeta
        | {
            resourceDisplayName: string;
            resourceIdentifier: string;
            resourceVersion: string;
          }[]
        | {
            name: string;
            size: number;
          }[]
        | string[]
        | UserDatasetShare[]
        | {
            name: string;
            display: string;
            version: string;
          }
        | undefined
      >,
      direction: string
    ) => void;
    onRowSelect: (row: UserDataset) => void;
    onRowDeselect: (row: UserDataset) => void;
    onMultipleRowSelect: (rows: UserDataset[]) => void;
    onMultipleRowDeselect: (rows: UserDataset[]) => void;
  };
  getTableActions(): {
    callback: (rows: UserDataset[]) => void;
    element: JSX.Element;
    selectionRequired: boolean;
  }[];
  getTableOptions(): {
    isRowSelected: (row: UserDataset) => boolean;
    showToolbar: boolean;
    renderEmptyState(): JSX.Element;
  };
  filterAndSortRows(rows: UserDataset[]): UserDataset[];
  filterRowsBySearchTerm(
    rows: UserDataset[],
    searchTerm?: string
  ): UserDataset[];
  getColumnSortValueMapper(
    columnKey: string | null
  ):
    | ((data: UserDataset, index: number) => string)
    | ((data: any, index: number) => any);
  sortRowsByColumnKey(rows: UserDataset[], sort: MesaSortObject): UserDataset[];
  closeSharingModal(): void;
  openSharingModal(): void;
  toggleProjectScope(newValue: boolean): void;
  render(): JSX.Element;
}
export default UserDatasetList;
//# sourceMappingURL=UserDatasetList.d.ts.map
