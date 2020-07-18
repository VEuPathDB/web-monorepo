import WdkService, { useWdkEffect } from "wdk-client/Service/WdkService";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { notifyUnhandledError } from "wdk-client/Actions/UnhandledErrorActions";

export interface ServiceCallback<S extends WdkService, T> {
  (service: S): Promise<T>;
}

type WdkServiceCallback<T> = ServiceCallback<WdkService, T>;

/**
 * Use WdkService to extract data from the WDK Service REST API.
 * @param callback Returns a Promise whose resolved value is used
 *                 as the return value of this hook.
 */
export function useWdkService<T>(callback: WdkServiceCallback<T>, deps?: any[]): T | undefined {
  const [ value, setValue ] = useState<T>();
  const dispatch = useDispatch();
  useWdkEffect(wdkService => {
    let doSetValue = true;
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
