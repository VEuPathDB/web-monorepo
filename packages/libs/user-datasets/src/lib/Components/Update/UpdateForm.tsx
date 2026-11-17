import React from 'react';
import { ifDefined, JsonPathBuilder } from '../../Utils';
import { UploadButton, UploadErrorBanner } from '../../Common/Forms/Components';
import {
  MetadataSection,
  RootDetailsSection,
} from '../../Common/Forms/Components/Sections';
import { SubmittableState } from '../../Common/Forms/Components/UploadButton';
import { useDatasetFormState } from '../../StoreModules/UserDatasetUploadStoreModule';
import { isDatasetFormValid } from '../../Common/Forms/form-validation';
import { DatasetFormProps } from '../../Common/Forms/DatasetFormProps';
import { isEmpty, isEqual } from 'lodash';
import { DatasetGetResponseBody, PartialDatasetDetails } from '../../Service';
import { hasUploads, newDatasetUploads } from '../../Service/Model/utility-types';
import { useDatasetMetadata } from '../../Common/Forms/Hooks/dataset-metadata-hooks';

export interface UpdateFormProps extends DatasetFormProps {
  readonly originalDataset: DatasetGetResponseBody;
  readonly originalDetails: PartialDatasetDetails;
  readonly scrollContainerRef: React.RefObject<HTMLElement>;
}

export function UpdateForm({
  originalDataset,
  originalDetails,
  scrollContainerRef,
  ...props
}: UpdateFormProps): React.ReactElement {
  const metaPath = JsonPathBuilder.Root;

  const formState = useDatasetFormState();
  const datasetDetails = useDatasetMetadata();
  const fileUploads = React.useMemo(
    () => newDatasetUploads(formState),
    [formState]
  );

  const [formIsValid, setFormIsValid] = React.useState<boolean>(true);

  const userHasChangedSomething = React.useMemo(
    () => hasUploads(fileUploads) || !isEqual(datasetDetails, originalDetails),
    [datasetDetails, originalDetails, fileUploads]
  );

  // Determine if the upload form should be submittable, and if not, why not.
  // !! This is intentionally not nested ternaries!  The automated code
  // !! formatting in use by some committers makes nested ternaries
  // !! nearly incomprehensible.
  const uploadSubmittable = React.useMemo(
    () => {
      if (!formIsValid) {
        return SubmittableState.Invalid;
      }

      if (props.isSubmitting) {
        return SubmittableState.InProgress;
      }

      if (!userHasChangedSomething) {
        return SubmittableState.NothingToDo;
      }

      return SubmittableState.Submittable;
    },
    [formIsValid, props.isSubmitting, userHasChangedSomething],
  );

  const updateSection = React.useRef<HTMLElement>(null);

  const isMissingDatasetProperties = React.useMemo(
    () => datasetDetails?.visibility === 'public'
      && props.formConfig.dataType.vdiConfig.usesDataProperties
      && isEmpty(fileUploads.dataPropertiesFiles)
      && isEmpty(originalDataset.files.datasetProperties),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [datasetDetails]
  );

  React.useEffect(
    () => setFormIsValid(
      ifDefined(
        datasetDetails,
        dd => isDatasetFormValid(dd, props.formConfig, updateSection) && !isMissingDatasetProperties
      ) ?? false,
    ),
    // formState covers relevant state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [datasetDetails, props, isMissingDatasetProperties]
  );

  const rawSubmit = props.actions.submit;

  const onSubmit = React.useCallback(
    () => {
      rawSubmit();
      scrollContainerRef.current?.scroll(0, 0);
    },
    [rawSubmit, scrollContainerRef],
  );

  return (
    <section id="dataset-update" ref={updateSection}>
      {props.badUploadState && (
        <header>
          <UploadErrorBanner errors={props.badUploadState} />
        </header>
      )}

      <form>
        <RootDetailsSection
          formProps={props}
          detailsJsonPath={metaPath}
          contentJsonPath={JsonPathBuilder.Root}
          onSubmit={onSubmit}
          submittable={uploadSubmittable}
          showVisibilities={true}
          showDataInputs={false}
          uploadButtonText="Update Dataset"
          requireDatasetPropertiesFile={isMissingDatasetProperties}
        />

        <MetadataSection
          formProps={props}
          jsonPath={metaPath}
          openMetaImport={props.actions.openMetaImportModal}
        />

        <UploadButton
          onClick={onSubmit}
          submittable={uploadSubmittable}
          buttonText="Update Dataset"
        />
      </form>
    </section>
  );
}
