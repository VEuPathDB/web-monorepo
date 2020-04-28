import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

export const makeVpdbClassNameHelper = (suffix: string) => makeClassNameHelper(`vpdb-${suffix}`);
