# Implementation Plan: rnaseq-rc:1.0 Upload Route

## Overview

Create a new dataset type `rnaseq-rc:1.0` with a custom "Description of Samples" textarea field. The upload process will transform user uploads into a .zip containing their data file (.tsv/.tab) and a SamplesDescrip.txt file created from the textarea content.

## Requirements Summary

- User uploads a .tsv/.tab file OR a .zip file via standard file dialog
- User provides "Description of Samples" text in a required textarea field
- VDI receives a single .zip file containing:
  - The user's data file (.tsv or .tab)
  - A SamplesDescrip.txt file (created from textarea OR preserved from uploaded .zip)
- Include reference genome dependency (like rnaseq:1.0)
- If user provides description text and uploads .zip with existing SamplesDescrip.txt, overwrite it
- If user provides no description text and uploads .zip with SamplesDescrip.txt, keep existing file

## Changes Required

### 1. Add JSZip dependency

**File:** `packages/libs/user-datasets/package.json`

- Add `jszip` package
- Add TypeScript types: `@types/jszip`

```json
{
  "dependencies": {
    "jszip": "^3.10.1"
  },
  "devDependencies": {
    "@types/jszip": "^3.4.1"
  }
}
```

### 2. Update dataset type configuration

**File:** `packages/libs/web-common/src/user-dataset-upload-config.tsx`

#### Add to implementedUploadTypes (around line 28-35)

```typescript
const implementedUploadTypes = {
  biom: { name: 'biom', version: '1.0' },
  genelist: { name: 'genelist', version: '1.0' },
  isasimple: { name: 'isasimple', version: '1.0' },
  bigwigfiles: { name: 'bigwigfiles', version: '1.0' },
  rnaseq: { name: 'rnaseq', version: '1.0' },
  rnaseqrc: { name: 'rnaseq-rc', version: '1.0' }, // NEW
  phenotype: { name: 'phenotype', version: '1.0' },
};
```

#### Add to dataset descriptions (around line 59-62)

```typescript
{
  ...implementedUploadTypes.rnaseqrc,
  description: `Upload your RNA-Seq data with sample descriptions into ${projectId}.`,
}
```

#### Create rnaseqRcFormConfigurator function (after rnaseqFormConfigurator)

```typescript
function rnaseqRcFormConfigurator(
  dataType: DatasetTypeConfig
): DatasetFormConfig {
  return {
    dataType,
    verbiage: {
      formTitle: `Upload a ${dataType.vdiConfig.category} Dataset`,
      formInputs: {
        samplesDescription: {
          label: 'Description of Samples',
          helpText: function HelpText() {
            return (
              <div className="formInfo">
                <p>
                  Provide a description of your RNA-Seq samples (e.g., your
                  Methods section). This will be saved as SamplesDescrip.txt in
                  your dataset.
                </p>
              </div>
            );
          },
        },
      },
    },
    dataInputConfig: {
      file: {
        enabled: true,
        helpText: (
          <div>
            <p>Upload your RNA-Seq data file:</p>
            <ul>
              <li>Accepted formats: .tsv, .tab, or .zip</li>
              <li>
                If uploading .zip, it should contain your .tsv or .tab data file
              </li>
              <li>Total uncompressed files cannot be greater than 1GB</li>
            </ul>
          </div>
        ),
      },
    },
    dependencies: {
      required: true,
      renderInput: ReferenceGenomeDependency,
    },
    enableExperimentalOrganism: true,
  };
}
```

#### Register in configuratorMap (around line 81-82)

```typescript
[implementedUploadTypes.rnaseq, rnaseqFormConfigurator],
[implementedUploadTypes.rnaseqrc, rnaseqRcFormConfigurator],  // NEW
```

### 3. Extend form state types

**File:** `packages/libs/user-datasets/src/lib/Service/Model/DatasetDetails.ts` (or wherever PartialDatasetDetails is defined)

Add optional field:

```typescript
export interface PartialDatasetDetails {
  // ... existing fields
  samplesDescription?: string;
}
```

### 4. Create TextAreaInput component

**File (NEW):** `packages/libs/user-datasets/src/lib/Common/Forms/Components/TextAreaInput.tsx`

```typescript
import React, { ReactElement, ReactNode } from 'react';
import { Consumer } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const labelClass = 'required';

export function TextAreaInput<T extends object = object>(props: {
  label: string;
  fieldName: keyof T & string;
  value?: string;
  onChange: Consumer<string>;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  helpText?: ReactNode;
}): ReactElement {
  const helpText = props.helpText ? (
    <div className="column-2">{props.helpText}</div>
  ) : null;

  return (
    <>
      <label
        htmlFor={props.fieldName}
        className={props.required ? labelClass : ''}
      >
        {props.label}
      </label>
      <textarea
        id={props.fieldName}
        name={props.fieldName}
        value={props.value ?? ''}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        rows={props.rows ?? 10}
        maxLength={props.maxLength}
        required={props.required}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      {helpText}
    </>
  );
}
```

### 5. Modify RootDetailsSection component

**File:** `packages/libs/user-datasets/src/lib/Common/Forms/Components/Sections/Definition/RootDetailsSection.tsx`

#### Add import

```typescript
import { TextAreaInput } from '../../TextAreaInput';
```

#### Add after summary InputPair (around line 119)

```typescript
{
  formConfig.verbiage.formInputs?.samplesDescription && (
    <TextAreaInput
      label={formConfig.verbiage.formInputs.samplesDescription.label}
      fieldName="samplesDescription"
      value={datasetDetails.samplesDescription}
      onChange={(v) =>
        setMetadata({ ...datasetDetails, samplesDescription: v })
      }
      required={true}
      rows={15}
      helpText={
        typeof formConfig.verbiage.formInputs.samplesDescription.helpText ===
        'function'
          ? formConfig.verbiage.formInputs.samplesDescription.helpText()
          : formConfig.verbiage.formInputs.samplesDescription.helpText
      }
    />
  );
}
```

### 6. Create file transformation utility

**File (NEW):** `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-file-transformer.ts`

```typescript
import JSZip from 'jszip';

/**
 * Transforms an RNAseq-RC upload file into a .zip containing:
 * - The user's data file (.tsv or .tab)
 * - A SamplesDescrip.txt file created from the provided description
 *
 * @param file - User's uploaded file (.tsv, .tab, or .zip)
 * @param samplesDescription - Text content for SamplesDescrip.txt (optional)
 * @returns A .zip File containing the data file and SamplesDescrip.txt
 */
export async function transformRnaSeqRcUpload(
  file: File,
  samplesDescription?: string
): Promise<File> {
  const zip = new JSZip();
  const fileName = file.name.toLowerCase();

  // Check if user uploaded a .zip file
  if (fileName.endsWith('.zip')) {
    // Load the existing zip
    const existingZip = await JSZip.loadAsync(file);

    // Copy all files except SamplesDescrip.txt
    const copyPromises: Promise<void>[] = [];
    existingZip.forEach((relativePath, zipEntry) => {
      if (relativePath !== 'SamplesDescrip.txt' && !zipEntry.dir) {
        copyPromises.push(
          zipEntry.async('blob').then((blob) => {
            zip.file(relativePath, blob);
          })
        );
      }
    });
    await Promise.all(copyPromises);

    // Add SamplesDescrip.txt if description provided
    if (samplesDescription) {
      const samplesDescripBlob = new Blob([samplesDescription], {
        type: 'text/plain',
      });
      zip.file('SamplesDescrip.txt', samplesDescripBlob);
    } else {
      // Keep existing SamplesDescrip.txt if present and no new description
      const existingSamplesDescrip = existingZip.file('SamplesDescrip.txt');
      if (existingSamplesDescrip) {
        const blob = await existingSamplesDescrip.async('blob');
        zip.file('SamplesDescrip.txt', blob);
      }
    }
  } else if (fileName.endsWith('.tsv') || fileName.endsWith('.tab')) {
    // User uploaded a plain .tsv or .tab file
    // Add the data file to the zip
    zip.file(file.name, file);

    // Create and add SamplesDescrip.txt
    const samplesDescripContent = samplesDescription || '';
    const samplesDescripBlob = new Blob([samplesDescripContent], {
      type: 'text/plain',
    });
    zip.file('SamplesDescrip.txt', samplesDescripBlob);
  } else {
    throw new Error(
      `Unsupported file type: ${file.name}. Please upload a .tsv, .tab, or .zip file.`
    );
  }

  // Generate the final zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFileName = file.name.endsWith('.zip')
    ? file.name
    : file.name.replace(/\.(tsv|tab)$/i, '.zip');

  return new File([zipBlob], zipFileName, { type: 'application/zip' });
}
```

### 7. Modify UploadFormController

**File:** `packages/libs/user-datasets/src/lib/Components/Upload/UploadFormController.tsx`

#### Add import

```typescript
import { transformRnaSeqRcUpload } from '../../Service/utils/rnaseq-rc-file-transformer';
```

#### Modify submitAction function (around line 69-133)

Add transformation logic before calling `submitNewDataset`:

```typescript
async function submitAction() {
  const { datasetDetails, fileUploads } = formState;

  // Clear previous errors
  dispatch(clearBadUpload());

  // Validate form
  if (!validateFormState(formState, formConfig)) {
    dispatch(
      receiveBadUpload({
        message: 'Please fix the errors in the form before submitting.',
        errors: {},
      })
    );
    return;
  }

  setSubmitting(true);

  try {
    // Transform file for rnaseq-rc:1.0
    let finalFileUploads = fileUploads;

    if (
      formConfig.dataType.name === 'rnaseq-rc' &&
      formConfig.dataType.version === '1.0' &&
      fileUploads.dataFiles &&
      fileUploads.dataFiles.length > 0
    ) {
      const transformedFile = await transformRnaSeqRcUpload(
        fileUploads.dataFiles[0],
        datasetDetails.samplesDescription
      );

      // Create a new FileList-like array with the transformed file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(transformedFile);

      finalFileUploads = {
        ...fileUploads,
        dataFiles: dataTransfer.files,
      };
    }

    // Submit to VDI
    await submitNewDataset({
      service: wdkService.vdi,
      details: {
        type: formConfig.dataType,
        ...filterDatasetDetails(datasetDetails),
      },
      uploads: finalFileUploads,
      onProgress: (loaded, total) => {
        dispatch(trackUploadProgress({ loaded, total }));
      },
      onSuccess: () => {
        setSubmitting(false);
        // Navigate to dataset detail page
      },
      onError: (error) => {
        setSubmitting(false);
        dispatch(receiveBadUpload(error));
      },
    });
  } catch (error) {
    setSubmitting(false);
    dispatch(
      receiveBadUpload({
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred during file transformation.',
        errors: {},
      })
    );
  }
}
```

### 8. Update DatasetFormVerbiage type

**File:** `packages/libs/user-datasets/src/lib/Common/Configuration/DatasetFormConfig.ts`

Update the `DatasetFormVerbiage` interface to include custom fields:

```typescript
export interface DatasetFormVerbiage {
  readonly formTitle?: string;
  readonly formInputs?: {
    readonly datasetProperties?: FormInputVerbiage;
    readonly samplesDescription?: FormInputVerbiage; // NEW
  };
}

export interface FormInputVerbiage {
  readonly label: string;
  readonly helpText?: ReactNode | (() => ReactNode);
}
```

## Testing Checklist

### Manual Testing

- [ ] Upload .tsv file with description text → verify .zip contains .tsv + SamplesDescrip.txt
- [ ] Upload .tab file with description text → verify .zip contains .tab + SamplesDescrip.txt
- [ ] Upload .zip file with description text → verify SamplesDescrip.txt is overwritten
- [ ] Upload .zip with existing SamplesDescrip.txt, no description text → verify file is preserved
- [ ] Upload .zip without SamplesDescrip.txt, no description text → verify no SamplesDescrip.txt added
- [ ] Verify reference genome selection is required
- [ ] Verify description textarea is required (form won't submit without it)
- [ ] Verify file validation rejects unsupported file types
- [ ] Verify successful upload to VDI and dataset creation

### Edge Cases

- [ ] Very large description text (test maxLength if needed)
- [ ] Empty description text vs no description (should both work)
- [ ] .zip with multiple files → verify all are preserved + SamplesDescrip.txt added/overwritten
- [ ] Special characters in description text
- [ ] File size limits respected

## Implementation Order

1. Add JSZip dependency and install
2. Create TextAreaInput component
3. Create file transformation utility
4. Update type definitions (DatasetFormVerbiage, PartialDatasetDetails)
5. Update user-dataset-upload-config.tsx (add type, configurator)
6. Modify RootDetailsSection to render textarea
7. Modify UploadFormController to call transformer
8. Test thoroughly

## Files to Create/Modify Summary

### New Files

- `packages/libs/user-datasets/src/lib/Common/Forms/Components/TextAreaInput.tsx`
- `packages/libs/user-datasets/src/lib/Service/utils/rnaseq-rc-file-transformer.ts`

### Modified Files

- `packages/libs/user-datasets/package.json`
- `packages/libs/web-common/src/user-dataset-upload-config.tsx`
- `packages/libs/user-datasets/src/lib/Components/Upload/UploadFormController.tsx`
- `packages/libs/user-datasets/src/lib/Common/Forms/Components/Sections/Definition/RootDetailsSection.tsx`
- `packages/libs/user-datasets/src/lib/Common/Configuration/DatasetFormConfig.ts`
- `packages/libs/user-datasets/src/lib/Service/Model/DatasetDetails.ts` (or equivalent)

## Key Implementation Details

### Text → File Conversion

The critical step that converts textarea string to SamplesDescrip.txt file:

```typescript
const textContent = samplesDescription || '';
const blob = new Blob([textContent], { type: 'text/plain' });
const txtFile = new File([blob], 'SamplesDescrip.txt', { type: 'text/plain' });
```

### File Transformation Flow

1. User fills form with description + uploads .tsv/.tab or .zip
2. On submit, `UploadFormController` detects rnaseq-rc:1.0 type
3. Calls `transformRnaSeqRcUpload(file, description)`
4. Transformer creates/modifies .zip with data file + SamplesDescrip.txt
5. Returns new .zip File object
6. Controller submits .zip to VDI via standard upload flow

### VDI Receives

- Single .zip file containing:
  - User's data file (.tsv or .tab)
  - SamplesDescrip.txt (from textarea or preserved from original .zip)
