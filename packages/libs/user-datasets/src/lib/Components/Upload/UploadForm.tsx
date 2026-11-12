import React from 'react';
import { Link } from 'react-router-dom';
import { Refresh } from '@material-ui/icons';

import Banner, { BannerProps } from '@veupathdb/coreui/lib/components/banners/Banner';

import {
  ActionKind,
  DatasetFormButton,
  SubmittableState,
  UploadButton,
  UploadErrorBanner,
} from '../../Common/Forms/Components';
import {
  MetadataSection,
  RootDetailsSection,
} from '../../Common/Forms/Components/Sections';
import { JsonPathBuilder } from '../../Utils';

import '../../Common/Forms/DatasetForm.scss';
import { useDatasetFormState } from '../../StoreModules/UserDatasetUploadStoreModule';
import { DatasetFormProps } from '../../Common/Forms/DatasetFormProps';
import { isDatasetFormValid } from '../../Common/Forms/form-validation';

function InfoBanner({ baseUrl }: { baseUrl: string }): React.ReactElement {
  const bannerConfig: BannerProps = React.useMemo(
    () => ({
      type: 'info',
      message: (
        <>
          Before uploading your dataset, please be sure your{' '}
          <span style={{ fontWeight: 'bold' }}>files are formatted </span>{' '}
          according to the instructions listed in the{' '}
          <Link
            to={{ pathname: `${baseUrl}/help` }}
            style={{ fontWeight: 'bold' }}
          >
            "My datasets help"
          </Link>{' '}
          tab.
        </>
      ),
    }),
    [baseUrl],
  );

  return <Banner banner={bannerConfig} />;
}

export function UploadForm(props: DatasetFormProps): React.ReactElement {
  const metaPath = JsonPathBuilder.Root.append('details');

  const [formIsValid, setFormIsValid] = React.useState<boolean>(true);

  // Determine if the upload form should be submittable, and if not, why not.
  // !! This is intentionally not nested ternaries!  The automated code
  // !! formatting in use by some committers makes nested ternaries
  // !! nearly incomprehensible.
  const uploadSubmittable = React.useMemo(() => {
    if (!formIsValid) return SubmittableState.Invalid;

    if (props.isSubmitting) return SubmittableState.InProgress;

    return SubmittableState.Submittable;
  }, [formIsValid, props.isSubmitting]);

  const onSubmit = () => {
    props.actions.submit();
    window.scrollTo(0, 0);
  };

  const formState = useDatasetFormState();

  const uploadSection = React.useRef<HTMLElement>(null);

  React.useEffect(() => setFormIsValid(
    isDatasetFormValid(formState.datasetDetails, props.formConfig, uploadSection)
  ), [setFormIsValid, formState, props]);

  return (
    <section id="dataset-upload" ref={uploadSection}>
      <header>
        {props.badUploadState && (
          <UploadErrorBanner errors={props.badUploadState} />
        )}

        <div className="title-with-button">
          <h2>{props.formConfig.verbiage.formTitle}</h2>
          <DatasetFormButton onClick={window.location.reload} kind={ActionKind.Tertiary}>
            <Refresh style={{ fontSize: '1.2em' }} />
            &nbsp;Reset
          </DatasetFormButton>
        </div>
        <p className="section-description-h2">
          <i>Provide a home for your dataset and start exploring.</i>
        </p>

        {props.formConfig.dataType.name === 'genelist' ? (
          <p>
            <i>
              (Gene lists user datasets can also be generated from a search
              strategy results section: click on the "Send to" menu near the
              "Download" button, and choose the "My Datasets" option to install
              the gene list in My Datasets.)
            </i>
            <br />
            <br />
          </p>
        ) : null}

        <InfoBanner baseUrl={props.baseUrl} />
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

        <MetadataSection
          formProps={props}
          jsonPath={metaPath}
          openMetaImport={props.actions.openMetaImportModal}
        />

        <UploadButton onClick={onSubmit} submittable={uploadSubmittable} />
      </form>
    </section>
  );
}
