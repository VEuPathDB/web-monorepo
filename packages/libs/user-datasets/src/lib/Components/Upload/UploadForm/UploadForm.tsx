import { FormEvent, ReactElement, useEffect, useState } from 'react';
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

function calcFormIsValid(e: Element): boolean {
  return e.querySelectorAll(':invalid').length === 0;
}

export function UploadForm(props: UploadFormProps): ReactElement {
  const metaPath = JsonPathBuilder.Root.append('details');

  const [formIsValid, setFormIsValid] = useState<boolean>(true);

  // TODO: temporary warning until dataset update form is completed.
  const [showUploadWarning, setShowUploadWarning] = useState(false);

  // Disable the upload buttons if the form is invalid, or an upload is already
  // in progress.
  const disableUpload = !formIsValid || props.isSubmitting;

  const tempOnSubmit = () => {
    setShowUploadWarning(true);
  };

  const onSubmit = () => {
    setShowUploadWarning(false);
    props.actions.submit();
    window.scrollTo(0, 0);
  };

  const onFormChange = (e: FormEvent) =>
    setFormIsValid(calcFormIsValid(e.currentTarget));

  useEffect(() => {
    setFormIsValid(
      calcFormIsValid(document.getElementById(DatasetUploadSectionID)!)
    );
  }, [setFormIsValid]);

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

      <form className={props.formClassName} onChange={onFormChange}>
        <RootDetailsSection
          formProps={props}
          detailsJsonPath={metaPath}
          contentJsonPath={JsonPathBuilder.Root}
          onSubmit={tempOnSubmit}
          disableSubmit={disableUpload}
        />

        <MetadataSection formProps={props} jsonPath={metaPath} />

        <UploadButton onClick={tempOnSubmit} disabled={disableUpload} />

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
