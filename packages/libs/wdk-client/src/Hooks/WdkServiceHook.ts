import WdkService, { useWdkEffect } from "wdk-client/Service/WdkService";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { notifyUnhandledError } from "wdk-client/Actions/UnhandledErrorActions";

export interface ServiceCallback<S extends WdkService, T> {
  (service: S): Promise<T>;
}

type WdkServiceCallback<T> = ServiceCallback<WdkService, T>;

function wdkServiceHookFactory(clearValueBeforeServiceCallback: boolean) {
  return function<T>(callback: WdkServiceCallback<T>, deps?: any[]): T | undefined {
    const [ value, setValue ] = useState<T>();
    const dispatch = useDispatch();
    useWdkEffect(wdkService => {
      let doSetValue = true;
      if (clearValueBeforeServiceCallback) {
        setValue(undefined);
      }
      callback(wdkService).then(
        value => {
          if (doSetValue) setValue(value);
        },
        error => {
          if (doSetValue) {
            wdkService.submitErrorIfNot500(error);
            dispatch(notifyUnhandledError(error));
          }
        });
      return () => { doSetValue = false; }
    }, deps)
    return value;
  }
}

/**
 * Use WdkService to extract data from the WDK Service REST API.
 * @param callback Returns a Promise whose resolved value is used
 *                 as the return value of this hook.
 */
export const useWdkService = wdkServiceHookFactory(false);

/**
 * Works as "useWdkService" does, save it returns a value of
 * "undefined" whenever the "callback" is invoked
 * @param callback Returns a Promise whose resolved value is used
 *                 as the return value of this hook.
 */
export const useWdkServiceWithRefresh = wdkServiceHookFactory(true);
