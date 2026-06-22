import {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

import {
  GlobeIcon,
  SubmissionModal,
  UploadButton,
  UploadErrorBanner,
} from '../../Common/Forms/Components';
import { MetadataSection, RootDetailsSection } from '../../Common/Forms/Components/Sections';
import { JsonPathBuilder } from '../../Utils';

import '../../Common/Forms/DatasetForm.scss';
import { SubmittableState } from '../../Common/Forms/Components/UploadButton';
import { useDatasetFormState } from '../../StoreModules/UserDatasetUploadStoreModule';
import { DatasetFormProps } from '../../Common/Forms/DatasetFormProps';
import { isDatasetFormValid } from '../../Common/Forms/form-validation';

export function UploadForm(props: DatasetFormProps): ReactElement {
  const metaPath = JsonPathBuilder.Root.append('details');

  const [formIsValid, setFormIsValid] = useState<boolean>(true);

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
    [formIsValid, props.isSubmitting]
  );

  const onSubmit = () => {
    props.actions.submit();
    window.scrollTo(0, 0);
  };

  const { datasetDetails, fileUploads } = useDatasetFormState();

  const uploadSection = useRef<HTMLElement>(null);

  useEffect(() => {
    setFormIsValid(
      isDatasetFormValid(datasetDetails, props.formConfig, uploadSection)
    );
  }, [setFormIsValid, datasetDetails, fileUploads, props]);

  return (
    <section id="dataset-upload" ref={uploadSection}>
      <header>
        <UploadErrorBanner errors={props.badUploadState} />

        <h2>{props.formConfig.verbiage.formTitle}</h2>
        <p>
          <i>Build a home for your dataset and start exploring</i>
        </p>

        <Banner
          banner={{
            type: 'info',
            message: (
              <>
                Before uploading your dataset, please ensure your{' '}
                <span style={{ fontWeight: 'bold' }}>files are formatted </span>{' '}
                according to the instructions listed in the{' '}
                <Link
                  to={{ pathname: `${props.baseUrl}/help` }}
                  style={{ fontWeight: 'bold' }}
                >
                  "My datasets help"
                </Link>{' '}
                tab.
              </>
            ),
          }}
        />
        <Banner
          banner={{
            type: 'info',
            message: (
              <>
                Click the browser reload button to{' '}
                <span style={{ fontWeight: 'bold' }}>
                  reset the upload form
                </span>
                .
              </>
            ),
          }}
        />
        <Banner
          banner={{
            type: 'warning',
            message: (
              <>
                <span className="important-info-bold">
                  If you plan to make this a Public Dataset, all sections marked
                  with a <GlobeIcon />
                  must be completed before upload.{' '}
                </span>{' '}
                Otherwise, the dataset will remain private and accessible only
                to you and collaborators you explicitly invite.
              </>
            ),
          }}
        />
      </header>

      <form>
        <RootDetailsSection
          formProps={props}
          detailsJsonPath={metaPath}
          contentJsonPath={JsonPathBuilder.Root}
          onSubmit={onSubmit}
          submittable={uploadSubmittable}
          showVisibilities={false}
          showDataInputs={true}
        />

        <MetadataSection formProps={props} jsonPath={metaPath} />

        <UploadButton onClick={onSubmit} submittable={uploadSubmittable} />

        <SubmissionModal
          submitting={props.isSubmitting}
          uploadProgress={props.uploadProgress ?? 0}
        />
      </form>
    </section>
  );
}
