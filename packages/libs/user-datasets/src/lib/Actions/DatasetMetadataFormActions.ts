import { identity } from 'lodash';

import { InferAction, makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';

import * as vdi from '../Service/Model';

export const overwriteMetaField = makeActionCreator(
  'ud-meta/overwrite-field',
  (
    key: keyof vdi.PartialDatasetDetails,
    value: vdi.PartialDatasetDetails[typeof key],
  ): vdi.PartialDatasetDetails => ({ [key]: value }),
);

export const patchExternalIdentifiers = makeActionCreator(
  'ud-meta/external-identifiers/patch',
  (
    key: keyof vdi.ExternalIdentifiers,
    value: vdi.ExternalIdentifiers[typeof key],
  ): vdi.ExternalIdentifiers => ({ [key]: value }),
);

export const patchContentFlags = makeActionCreator(
  'ud-meta/contentFlags/patch',
  identity<vdi.DatasetMetadataContentFlags>,
);

export type Action =
  | InferAction<typeof overwriteMetaField>
  | InferAction<typeof patchContentFlags>
  | InferAction<typeof patchExternalIdentifiers>;