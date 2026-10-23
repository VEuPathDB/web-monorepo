import { DatasetFormState } from '../../StoreModules';
import { DatasetFormConfig } from '../../Common/Configuration';
import { TextUploadContent, VdiServiceMetadata } from '../Model';
import { ifDefined, Possible } from '../../Utils';
import {
  MANIFEST_NAME,
  SAMPLE_INFO_FIELD_NAME,
  SAMPLE_INFO_MAX_BYTES,
  utf8ByteLength
} from '../utils/rnaseq-rc-data-files';
import { isEmpty } from 'lodash';
import { ifNotEmpty, takeIf } from '../../Utils/ergonomics';
import { getSamplesDescription, UploadContentMap } from '../Model/utility-types';

/**
 * Validate the upload form state, performing basic checks that the user has
 * performed all required client-side-only form steps before attempting an
 * upload.
 */
export function validateFormState(
  { datasetDetails, dataFileSelections }: DatasetFormState,
  formConfig: DatasetFormConfig,
  vdiConfig: VdiServiceMetadata
): Record<string, string[]> {
  const keyedErrors: Record<string, string[]> = {};

  if (
    formConfig.dependencies?.required === true &&
    isEmpty(datasetDetails.dependencies)
  ) {
    keyedErrors['$.details.dependencies'] = ['selection is required'];
  }

  const samplesDescription = getSamplesDescription(dataFileSelections)?.value;

  if (
    samplesDescription != null &&
    utf8ByteLength(samplesDescription) > SAMPLE_INFO_MAX_BYTES
  ) {
    keyedErrors[SAMPLE_INFO_FIELD_NAME] = [
      `too long: ${utf8ByteLength(
        samplesDescription
      ).toLocaleString()} bytes, maximum ${SAMPLE_INFO_MAX_BYTES.toLocaleString()}`,
    ];
  }

  // Only forms that generate a manifest (currently rnaseqrc, via
  // `prepareDataFiles`) reserve this name - other dataset types have no
  // reason to reject a file merely named "manifest.tsv".
  if (formConfig.prepareDataFiles != null) {
    for (const [field, files] of Object.entries(dataFileSelections)) {
      for (const file of files) {
        if (file.name === MANIFEST_NAME) {
          keyedErrors[field] = [
            `"${MANIFEST_NAME}" is a reserved name (used internally for the manifest) - please rename your file`,
          ];
        }
      }
    }
  }

  const allowed = formConfig.dataType.vdiConfig.allowedFileExtensions;
  const archiveTypes = vdiConfig.features.supportedArchiveTypes;

  if (allowed.length > 0) {
    // An empty list means the backend "can't validate" and accepts anything;
    // mirror that rather than rejecting every file (as an empty list would
    // if compared with `.some`).
    for (const [ field, files ] of Object.entries(dataFileSelections)) {
      for (const file of files) {
        if (hasAllowedExtension(file.name, archiveTypes) || hasAllowedExtension(file.name, allowed))
          continue;

        const errorMsg = `"${file.name}" is not an accepted file type - permitted types are ${allowed.join(', ')}`;

        if (Array.isArray(keyedErrors[field])) {
          keyedErrors[field].push(errorMsg)
        } else {
          keyedErrors[field] = [errorMsg];
        }
      }
    }
  }

  return keyedErrors;
}

/**
 * True if `name` ends with one of `allowedExtensions`, case-insensitively.
 *
 * Exported so callers checking the same thing (form validation) share this
 * logic rather than keeping a second, independently-maintained copy that
 * could drift from this one.
 */
export function hasAllowedExtension(
  name: string,
  allowedExtensions: readonly string[]
): boolean {
  const lower = name.toLowerCase();
  return allowedExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
}
