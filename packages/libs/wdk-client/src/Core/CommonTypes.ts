import { ComponentType } from 'react';
import { RouteComponentProps } from 'react-router';

import AbstractViewController from './Controllers/AbstractViewController';
import WdkDispatcher from './State/Dispatcher';
import GlobalDataStore from './State/Stores/GlobalDataStore';
import WdkStore from './State/Stores/WdkStore';
import { Action, ActionCreatorResult, ActionCreatorServices } from '../Utils/ActionCreatorUtils';
import { UserDataset } from '../Utils/WdkModel';
import { PluginContext, ClientPlugin, CompositeClientPlugin } from '../Utils/ClientPlugin';


export interface StoreConstructor<T extends WdkStore> {
  new(dispatcher: WdkDispatcher<Action>, channel: string, globalDataStore: GlobalDataStore, services: ActionCreatorServices, locatePlugin: LocatePlugin): T;
}

export interface DispatchAction {
  (action: ActionCreatorResult<Action>): any;
}

export interface MakeDispatchAction {
  (channel: string): DispatchAction
}

export interface Constructor<T> {
  new(...args: any[]): T;
}

export interface Container<T> {
  get(Class: Constructor<T>): T;
}

export interface ViewControllerProps<Store> {
  stores: Container<Store>;
  makeDispatchAction: MakeDispatchAction;
  locatePlugin: LocatePlugin;
}

export type PageControllerProps<Store> = ViewControllerProps<Store> & RouteComponentProps<any>;

export type AbstractViewControllerClass = typeof AbstractViewController;

export interface RouteSpec {
  path: string;
  component: ComponentType<PageControllerProps<WdkStore> | RouteComponentProps<any>>
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
  (type: string): CompositeClientPlugin;
}
