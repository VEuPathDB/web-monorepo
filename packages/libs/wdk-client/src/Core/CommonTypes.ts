import { ComponentType } from 'react';
import { RouteComponentProps } from 'react-router';
import { Action } from 'redux';

import { ActionCreatorResult } from 'wdk-client/Core/WdkMiddleware';
import { UserDataset } from 'wdk-client/Utils/WdkModel';
import { CompositeClientPlugin } from 'wdk-client/Utils/ClientPlugin';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface SimpleDispatch {
  (action: Action): void;
}

export interface DispatchAction {
  (action: ActionCreatorResult<Action>): any;
}

export interface ViewControllerProps {
  locatePlugin: LocatePlugin;
}

export type PageControllerProps = ViewControllerProps & RouteComponentProps<any>;

export interface RouteSpec {
  path: string;
  component: ComponentType<PageControllerProps | RouteComponentProps<any>>
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

export interface LocatePlugin {
  <T>(type: string): CompositeClientPlugin<T>;
}
