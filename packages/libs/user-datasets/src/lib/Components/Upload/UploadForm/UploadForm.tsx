import { ReactElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

import { SubmissionModal, UploadButton, UploadErrorBanner } from './Components';
import { MetadataSection, RootDetailsSection } from './Sections';
import { DatasetUploadConfig } from '../Configuration';
import { VdiServiceMetadata } from '../../../Service';
import { JsonPathBuilder, Runnable } from '../../../Utils';
import { BadUpload } from '../../../StoreModules';
import { UploadUrlParams } from './DataModel';

import './UploadForm.scss';
import { UploadWarningModal } from './UploadWarningModal';
import { CommunityAccess } from '../../Misc/CommunityAccess';
import { SubmittableState } from './Components/UploadButton';
import { useUploadFormState } from '../../../StoreModules/UserDatasetUploadStoreModule';

const DatasetUploadSectionID = 'dataset-upload';

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
    : (props.isSubmitting
      ? SubmittableState.InProgress
      : SubmittableState.Submittable);

  const tempOnSubmit = () => {
    setShowUploadWarning(true);
  };

  const onSubmit = () => {
    setShowUploadWarning(false);
    props.actions.submit();
    window.scrollTo(0, 0);
  };

  const { datasetDetails, fileUploads } = useUploadFormState();

  useEffect(() => {
    setFormIsValid(
      calcFormIsValid(document.getElementById(DatasetUploadSectionID)!)
    );
  }, [setFormIsValid, datasetDetails, fileUploads]);

  return (
    <section id={DatasetUploadSectionID}>
      <header>
        <UploadErrorBanner errors={props.badUploadState} />

        <h2>{props.verbiage.formTitle}</h2>
        <p>
          <i>Build a home for your dataset and start exploring</i>
        </p>

        <Banner
          banner={{
            type: 'warning',
            message: (
              <>
                Before uploading your dataset, please ensure your data is
                formatted according to the instructions listed in the{' '}
                <Link to={{ pathname: `${props.baseUrl}/help` }}>
                  "Help" tab
                </Link>
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
                <span className="important-info">
                  If you plan to make this dataset discoverable through{' '}
                  <CommunityAccess />, all sections marked with a globe icon
                  must be completed before upload.
                </span>{' '}
                Datasets uploaded with only a name, summary, and data files will
                be restricted to personal use and sharing with selected
                collaborators.
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

function calcFormIsValid(e: Element): boolean {
  return e.querySelectorAll(':invalid').length === 0;
}
