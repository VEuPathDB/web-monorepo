import { JsonPathBuilder } from '../../Utils';
import {
  VDI_MULTIPART_DATA_FILE,
  VDI_MULTIPART_DATA_PROP_FILE,
  VDI_MULTIPART_DOC_FILE,
} from '../../Service/Model/request-types';

/**
 * JSON-Path field name for HTML file inputs representing dataset data files.
 */
export const FIELD_NAME_DATA_FILE = JsonPathBuilder.Root.append(VDI_MULTIPART_DATA_FILE);

/**
 * JSON-Path field name for HTML file inputs representing dataset supplementary
 * documents.
 */
export const FIELD_NAME_DOC_FILE = JsonPathBuilder.Root.append(VDI_MULTIPART_DOC_FILE);

/**
 * JSON-Path field name for HTML file inputs representing dataset data
 * properties or annotation files.
 */
export const FIELD_NAME_DATA_PROP_FILE = JsonPathBuilder.Root.append(VDI_MULTIPART_DATA_PROP_FILE);

export const FIELD_NAME_SAMPLE_INFO = JsonPathBuilder.Root.append('samplesDescription');
