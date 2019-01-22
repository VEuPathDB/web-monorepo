import { Action } from 'redux';

import { ActionCreatorResult } from 'wdk-client/Core/WdkMiddleware';
import { UserDataset } from 'wdk-client/Utils/WdkModel';


export interface SimpleDispatch {
  (action: Action): void;
}

export interface DispatchAction {
  (action: ActionCreatorResult<Action>): any;
}

export interface MesaColumn {
  key: string;
  name?: string;
  type?: string;
  sortable?: boolean;
  filterable?: boolean;
  helpText?: string;
  style?: any;
  className?: string;
  width?: any;
  renderCell?: any;
  renderHeading?: any;
  wrapCustomHeadings?: any;
}

export interface MesaDataCellProps {
  row: UserDataset;
  column: MesaColumn;
  rowIndex: number;
  columnIndex: number;
  inline?: boolean;
}


export interface MesaSortObject {
  columnKey: string;
  direction: string;
};
