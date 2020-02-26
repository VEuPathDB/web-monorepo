import WdkService, { useWdkEffect } from "wdk-client/Service/WdkService";
import { useState } from "react";

interface WdkServiceCallback<T> {
  (wdkService: WdkService): Promise<T>;
}

/**
 * Use WdkService to extract data from the WDK Service REST API.
 * @param callback Returns a Promise whose resolved value is used
 *                 as the return value of this hook.
 */
export function useWdkService<T>(callback: WdkServiceCallback<T>): T | undefined {
  const [ value, setValue ] = useState<T>();
  const [ active, setActive ] = useState(true);
  useWdkEffect(wdkService => {
    callback(wdkService).then(
      value => {
        if (active) setValue(value);
      },
      error => {
        if (active) {
          wdkService.submitErrorIfNot500(error);        }
      });
    return () => { setActive(false) }
  }, [callback])
  return value;
}
