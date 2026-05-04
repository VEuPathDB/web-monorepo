import { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';

import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

import { SubmissionModal, UploadButton, UploadErrorBanner } from "./Components";
import { MetadataSection, RootDetailsSection } from './Sections';
import { DatasetUploadConfig } from "../Configuration";
import { DatasetPostDetails } from "../../../Service";
import { DatasetUploads } from '../../../Service/model/utility-types';
import { BadUpload } from '../../../StoreModules/UserDatasetUploadStoreModule';
import { BiConsumer, JsonPathBuilder } from '../../../Utils';
import { VdiServiceMetadata } from "../../../Service/model/response-decoders";

export interface UploadFormProps extends DatasetUploadConfig {
  readonly baseUrl: string;

  readonly vdiConfig: VdiServiceMetadata;

  readonly actions: {
    readonly submit: BiConsumer<DatasetPostDetails, DatasetUploads>;
    readonly clearUploadError: () => void;
  };

  readonly isSubmitting: boolean;

  readonly uploadProgress?: number;
  readonly formClassName?: string;
  readonly badUploadState?: BadUpload;

  readonly urlParams: Record<string, string>;
}

export function UploadForm(props: UploadFormProps): ReactElement {
  const metaPath = JsonPathBuilder.Root.append('details');

  const [metadata, setMetadata] = useState<DatasetPostDetails>({});

  const [uploads, setUploads] = useState<DatasetUploads>({});

  const onSubmit = () => props.actions.submit(metadata, uploads);

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
          datasetMeta={metadata}
          setDatasetMeta={setMetadata}
          uploads={uploads}
          setUploads={setUploads}
          onSubmit={onSubmit}
        />

        <MetadataSection
          formProps={props}
          datasetMeta={metadata}
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
