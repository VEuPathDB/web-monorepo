import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

export const makeVpdbClassNameHelper = (suffix: string) =>
  makeClassNameHelper(`vpdb-${suffix}`);
