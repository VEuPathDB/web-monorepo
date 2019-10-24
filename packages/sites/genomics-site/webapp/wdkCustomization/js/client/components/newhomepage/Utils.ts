import { makeClassNameHelper } from "wdk-client/Utils/ComponentUtils";

export const makeVpdbClassNameHelper = (baseClassName: string) => makeClassNameHelper(`vpdb-${baseClassName}`);
