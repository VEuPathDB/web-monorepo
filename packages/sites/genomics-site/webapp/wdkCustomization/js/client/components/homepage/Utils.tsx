import { makeClassNameHelper } from "wdk-client/Utils/ComponentUtils";

export const makeVpdbClassNameHelper = (suffix: string, ...modifiers: any[]) => makeClassNameHelper(`vpdb-${suffix}`);
