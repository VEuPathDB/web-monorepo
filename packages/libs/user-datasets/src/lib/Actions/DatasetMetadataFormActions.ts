import { identity } from 'lodash';

import { InferAction, makeActionCreator } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';

import * as vdi from '../Service/Model';


export const overwriteMetaField = makeActionCreator(
  'ud-meta/overwrite-field',
  (key: keyof vdi.PartialDatasetDetails, value: vdi.PartialDatasetDetails[typeof key]) => ({ [key]: value })
);

export const updateContacts = makeActionCreator(
  'ud-meta/update-contacts',
  identity<ReadonlyArray<vdi.PartialDatasetContact>>,
);

export const updatePublications = makeActionCreator(
  'ud-meta/update-publications',
  identity<ReadonlyArray<vdi.PartialDatasetPublication>>,
);

export const updateSources = makeActionCreator(
  'ud-meta/update-sources',
  identity<ReadonlyArray<vdi.PartialDatasetSource>>,
);

export const updateExternalDOIs = makeActionCreator(
  'ud-meta/update-ext-dois',
  identity<ReadonlyArray<vdi.DOIReference>>,
);

export const updateExternalHyperlinks = makeActionCreator(
  'ud-meta/update-ext-links',
  identity<ReadonlyArray<vdi.DatasetHyperlink>>,
);

export const updateExternalBioprojectIds = makeActionCreator(
  'ud-meta/update-ext-bioprojects',
  identity<ReadonlyArray<vdi.BioProjectId>>,
);

export const updateCharacteristics = makeActionCreator(
  'ud-meta/update-characteristics',
  identity<vdi.PartialCharacteristics>,
);

export const updateContentFlags = makeActionCreator(
  'ud-meta/update-content-flags',
  identity<vdi.DatasetMetadataContentFlags>,
);

export type Action =
  | InferAction<typeof overwriteMetaField>
  | InferAction<typeof updateCharacteristics>
  | InferAction<typeof updateContacts>
  | InferAction<typeof updateContentFlags>
  | InferAction<typeof updateExternalBioprojectIds>
  | InferAction<typeof updateExternalDOIs>
  | InferAction<typeof updateExternalHyperlinks>
  | InferAction<typeof updatePublications>
  | InferAction<typeof updateSources>;