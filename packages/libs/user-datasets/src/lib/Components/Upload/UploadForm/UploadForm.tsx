import { ReactElement } from 'react';
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

  const onSubmit = () => {
    props.actions.submit();
    window.scrollTo(0, 0);
  };

  return (
    <section id="dataset-upload">
      <header>
        <UploadErrorBanner errors={props.badUploadState} />

        <h2>{props.verbiage.formTitle}</h2>

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
                You will need to complete the <b>Core Dataset Information</b>{' '}
                and provide a valid <b>Variable Annotations file</b> before
                publishing as a{' '}
                <b>
                  <i>Community-contributed dataset</i>
                </b>
                . Until then, you can still explore, analyze, and privately
                share the dataset using dataExplorer.
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
          onSubmit={onSubmit}
        />

        <MetadataSection formProps={props} jsonPath={metaPath} />

        <UploadButton onClick={onSubmit} />

        <SubmissionModal
          submitting={props.isSubmitting}
          uploadProgress={props.uploadProgress ?? 0}
        />
      </form>
    </section>
  );
}
