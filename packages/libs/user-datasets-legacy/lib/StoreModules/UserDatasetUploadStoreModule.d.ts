import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { Action } from '../Actions/UserDatasetUploadActions';
import { StateSlice } from './types';
import { UserDatasetUpload } from '../Utils/types';
export declare const key = 'userDatasetUpload';
export type State = {
  uploads?: Array<UserDatasetUpload>;
  badUploadMessage?: {
    message: string;
    timestamp: number;
  };
  badAllUploadsActionMessage?: {
    message: string;
    timestamp: number;
  };
};
export declare function reduce(state: State | undefined, action: Action): State;
export declare const observe: import('redux-observable').Epic<
  Action,
  Action,
  StateSlice,
  EpicDependencies
>;
//# sourceMappingURL=UserDatasetUploadStoreModule.d.ts.map
