import {
  ReactElement,
  RefObject,
  useEffect,
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
} from './Components';
import { MetadataSection, RootDetailsSection } from './Sections';
import { DatasetUploadConfig } from '../Configuration';
import { DatasetPostDetails, VdiServiceMetadata } from '../../../Service';
import { JsonPathBuilder, Runnable } from '../../../Utils';
import { BadUpload } from '../../../StoreModules';
import { UploadUrlParams } from './DataModel';

import './UploadForm.scss';
import { UploadWarningModal } from './UploadWarningModal';
import { SubmittableState } from './Components/UploadButton';
import { useUploadFormState } from '../../../StoreModules/UserDatasetUploadStoreModule';
import { isEmpty } from 'lodash';

export interface UploadFormProps extends DatasetUploadConfig {
  readonly baseUrl: string;

  readonly vdiConfig: VdiServiceMetadata;

  readonly actions: {
    readonly submit: Runnable;
    readonly clearUploadError: Runnable;
  };

  readonly isSubmitting: boolean;

  readonly uploadProgress?: number;
  readonly formClassName?: string;
  readonly badUploadState?: BadUpload;

  readonly urlParams: UploadUrlParams;
}

export function UploadForm(props: UploadFormProps): ReactElement {
  const metaPath = JsonPathBuilder.Root.append('details');

  const [formIsValid, setFormIsValid] = useState<boolean>(true);

  // TODO: temporary warning until dataset update form is completed.
  const [showUploadWarning, setShowUploadWarning] = useState(false);

  // Determine if the upload form should be submittable, and if not, why not.
  const uploadSubmittable = !formIsValid
    ? SubmittableState.Invalid
    : props.isSubmitting
    ? SubmittableState.InProgress
    : SubmittableState.Submittable;

  const tempOnSubmit = () => {
    setShowUploadWarning(true);
  };

  const onSubmit = () => {
    setShowUploadWarning(false);
    props.actions.submit();
    window.scrollTo(0, 0);
  };

  const { datasetDetails, fileUploads } = useUploadFormState();

  const uploadSection = useRef<HTMLElement>(null);

  useEffect(() => {
    setFormIsValid(
      calcFormIsValid(datasetDetails, props, uploadSection)
    );
  }, [setFormIsValid, datasetDetails, fileUploads, props]);

  return (
    <section id="dataset-upload" ref={uploadSection}>
      <header>
        <UploadErrorBanner errors={props.badUploadState} />

        <h2>{props.verbiage.formTitle}</h2>
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

      <form className={props.formClassName}>
        <RootDetailsSection
          formProps={props}
          detailsJsonPath={metaPath}
          contentJsonPath={JsonPathBuilder.Root}
          onSubmit={tempOnSubmit}
          submittable={uploadSubmittable}
        />

        <MetadataSection formProps={props} jsonPath={metaPath} />

        <UploadButton onClick={tempOnSubmit} submittable={uploadSubmittable} />

        <SubmissionModal
          submitting={props.isSubmitting}
          uploadProgress={props.uploadProgress ?? 0}
        />
      </form>
      <UploadWarningModal
        visible={showUploadWarning}
        setVisible={setShowUploadWarning}
        runUpload={onSubmit}
      />
    </section>
  );
}

function calcFormIsValid(
  metadata: DatasetPostDetails,
  config: DatasetUploadConfig,
  uploadSection: RefObject<HTMLElement>,
): boolean {
  const allInputsValid = uploadSection.current
    ?.querySelectorAll(':invalid').length === 0;

  const missingDependencies = config.dependencies?.required === true
    && isEmpty(metadata.dependencies);

  return allInputsValid && !missingDependencies;
}
