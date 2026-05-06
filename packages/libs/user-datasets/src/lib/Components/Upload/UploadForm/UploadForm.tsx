import { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

import { SubmissionModal, UploadButton, UploadErrorBanner } from './Components';
import { MetadataSection, RootDetailsSection } from './Sections';
import { DatasetUploadConfig } from '../Configuration';
import {
  DatasetPostDetails,
  DatasetUploads,
  VdiServiceMetadata,
} from '../../../Service';
import { Consumer, JsonPathBuilder } from '../../../Utils';
import { BadUpload } from '../../../StoreModules';

export interface UploadFormProps extends DatasetUploadConfig {
  readonly baseUrl: string;

  readonly vdiConfig: VdiServiceMetadata;

  readonly actions: {
    readonly submit: Consumer<UploadFormState>;
    readonly clearUploadError: () => void;
  };

  readonly isSubmitting: boolean;

  readonly uploadProgress?: number;
  readonly formClassName?: string;
  readonly badUploadState?: BadUpload;

  readonly urlParams: Record<string, string>;

  readonly formState: UploadFormState;
  readonly setFormState: Consumer<UploadFormState>;
}

export interface UploadFormState {
  readonly metadata: DatasetPostDetails;
  readonly uploads: DatasetUploads;
}

export function UploadForm(props: UploadFormProps): ReactElement {
  const metaPath = JsonPathBuilder.Root.append('details');

  const setMetadata = (metadata: DatasetPostDetails) =>
    props.setFormState({ ...props.formState, metadata });
  const setUploads = (uploads: DatasetUploads) =>
    props.setFormState({ ...props.formState, uploads });

  const onSubmit = () => props.actions.submit(props.formState);

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
      </header>

      <form className={props.formClassName}>
        <RootDetailsSection
          formProps={props}
          detailsJsonPath={metaPath}
          contentJsonPath={JsonPathBuilder.Root}
          datasetMeta={props.formState.metadata}
          setDatasetMeta={setMetadata}
          uploads={props.formState.uploads}
          setUploads={setUploads}
          onSubmit={onSubmit}
        />

        <MetadataSection
          formProps={props}
          datasetMeta={props.formState.metadata}
          setDatasetMeta={setMetadata}
          jsonPath={metaPath}
        />

        <UploadButton onClick={onSubmit} />

        <SubmissionModal
          submitting={props.isSubmitting}
          uploadProgress={props.uploadProgress ?? 0}
        />
      </form>
    </section>
  );
}
