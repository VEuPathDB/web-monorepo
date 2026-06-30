import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { JsonPathBuilder } from '../../Utils';
import { UploadButton, UploadErrorBanner } from '../../Common/Forms/Components';
import { MetadataSection, RootDetailsSection } from '../../Common/Forms/Components/Sections';
import { SubmittableState } from '../../Common/Forms/Components/UploadButton';
import { useDatasetFormState } from '../../StoreModules/UserDatasetUploadStoreModule';
import { isDatasetFormValid } from '../../Common/Forms/form-validation';
import { DatasetFormProps } from '../../Common/Forms/DatasetFormProps';

export function UpdateForm(props: DatasetFormProps): ReactElement {
  const metaPath = JsonPathBuilder.Root;

  const [ formIsValid, setFormIsValid ] = useState<boolean>(true);

  // Determine if the upload form should be submittable, and if not, why not.
  // !! This is intentionally not nested ternaries!  The automated code
  // !! formatting in use by some committers makes nested ternaries
  // !! nearly incomprehensible.
  const uploadSubmittable = useMemo(
    () => {
      if (!formIsValid)
        return SubmittableState.Invalid;

      if (props.isSubmitting)
        return SubmittableState.InProgress;

      return SubmittableState.Submittable;
    },
    [ formIsValid, props.isSubmitting ]
  );

  const { datasetDetails, fileUploads } = useDatasetFormState();

  const updateSection = useRef<HTMLElement>(null);

  useEffect(() => {
    setFormIsValid(
      isDatasetFormValid(datasetDetails, props.formConfig, updateSection)
    );
  }, [ datasetDetails, fileUploads, props ]);

  const onSubmit = () => {
    props.actions.submit();
    updateSection.current!.parentElement!.scrollTo(0, 0);
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

export class UpdateFormProps {
}