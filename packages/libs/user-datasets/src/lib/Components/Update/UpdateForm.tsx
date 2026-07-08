import React, {
  ReactElement,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { JsonPathBuilder } from '../../Utils';
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
import { DatasetUploads, PartialDatasetDetails } from '../../Service';
import { hasUploads } from '../../Service/Model/utility-types';
import { DatasetTypeConfig } from '../../Common/Configuration';

export interface UpdateFormProps extends DatasetFormProps {
  readonly originalDetails: PartialDatasetDetails;
  readonly scrollContainerRef: RefObject<HTMLElement>;
}

export function UpdateForm(props: UpdateFormProps): ReactElement {
  const metaPath = JsonPathBuilder.Root;

  const { datasetDetails, fileUploads } = useDatasetFormState();

  const [formIsValid, setFormIsValid] = useState<boolean>(true);

  const userHasChangedSomething = useMemo(
    () =>
      hasUploads(fileUploads) ||
      !isEqual(datasetDetails, props.originalDetails),
    [fileUploads, datasetDetails, props.originalDetails]
  );

  // Determine if the upload form should be submittable, and if not, why not.
  // !! This is intentionally not nested ternaries!  The automated code
  // !! formatting in use by some committers makes nested ternaries
  // !! nearly incomprehensible.
  const uploadSubmittable = useMemo(() => {
    if (!formIsValid) return SubmittableState.Invalid;

    if (props.isSubmitting) return SubmittableState.InProgress;

    if (!userHasChangedSomething) return SubmittableState.NothingToDo;

    return SubmittableState.Submittable;
  }, [formIsValid, props.isSubmitting, userHasChangedSomething]);

  const updateSection = useRef<HTMLElement>(null);

  useEffect(() => {
    setFormIsValid(
      isDatasetFormValid(datasetDetails, props.formConfig, updateSection) &&
        !isMissingDatasetProperties(props.formConfig.dataType, fileUploads)
    );
  }, [datasetDetails, fileUploads, props]);

  const onSubmit = () => {
    props.actions.submit();
    props.scrollContainerRef.current?.scroll(0, 0);
  };

  return (
    <section id="dataset-update" ref={updateSection}>
      <header>
        <UploadErrorBanner errors={props.badUploadState} />
      </header>

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
        />

        <MetadataSection formProps={props} jsonPath={metaPath} />

        <UploadButton
          onClick={onSubmit}
          submittable={uploadSubmittable}
          buttonText="Update Dataset"
        />
      </form>
    </section>
  );
}

function isMissingDatasetProperties(
  type: DatasetTypeConfig,
  files: DatasetUploads
): boolean {
  return (
    type.vdiConfig.usesDataProperties && isEmpty(files.dataPropertiesFiles)
  );
}
