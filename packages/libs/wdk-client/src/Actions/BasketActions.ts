import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { PrimaryKey } from "wdk-client/Utils/WdkModel";

export const requestUpdateBasket = makeActionCreator(
    'requestUpdateBasket',
    (status: boolean, recordClassName: string, primaryKeys: Set<PrimaryKey>) => ({ status, recordClassName,  primaryKeys})
    );
    
export const fulfillUpdateBasket = makeActionCreator(
        'fulfillUpdateBasket',
        (status: boolean, recordClassName: string, primaryKeys: Set<PrimaryKey>) => ({ status, recordClassName,  primaryKeys})
        );
        
export type Action =
    InferAction<typeof requestUpdateBasket>
    | InferAction<typeof fulfillUpdateBasket>