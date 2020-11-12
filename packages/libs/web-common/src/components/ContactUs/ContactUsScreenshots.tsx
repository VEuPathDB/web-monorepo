import React, { useCallback, useEffect, useState } from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { ImageUploadDialog } from 'ebrc-client/components/ContactUs/ImageUploadDialog';
import { MAX_ATTACHMENT_SIZE_DESCRIPTION } from 'ebrc-client/selectors/ContactUsSelectors';

import './ContactUsScreenshots.scss';

const cx = makeClassNameHelper('ContactUsScreenshots');

interface Props {
  addScreenshot: (file: File) => void;
  removeScreenshot: (index: number) => void;
  screenshotMetadata: { id: number, file: File }[];
}

const ContactUsScreenshots = ({
  addScreenshot,
  removeScreenshot,
  screenshotMetadata
}: Props) => {
  const [ imageUploadDialogOpen, setImageUploadDialogOpen ] = useState(false);

  const onImageUploadDialogOpen = useCallback(() => {
    setImageUploadDialogOpen(true);
  }, []);

  const onImageUploadDialogSubmit = useCallback((file: File) => {
    setImageUploadDialogOpen(false);
    addScreenshot(file);
  }, [ addScreenshot ]);

  const onImageUploadDialogClose = useCallback(() => {
    setImageUploadDialogOpen(false);
  }, []);

  return (
    <div className={cx()}>
      {
        imageUploadDialogOpen &&
        <ImageUploadDialog
          onSubmit={onImageUploadDialogSubmit}
          onClose={onImageUploadDialogClose}
        />
      }
      Attach up to three screenshots from your clipboard (maximum {MAX_ATTACHMENT_SIZE_DESCRIPTION} per image).
      <div className={cx('--ScreenshotPreviews')}>
        {
          screenshotMetadata.map(
            (screenshotMetadatum, i) => (
              <ScreenshotPreview
                key={screenshotMetadatum.id}
                onRemoveScreenshot={() => {
                  removeScreenshot(i);
                }}
                imageFile={screenshotMetadatum.file}
              />
            )
          )
        }
      </div>
      {
        screenshotMetadata.length < 3 &&
        <button className={`${cx('--AddScreenshot')} btn`} type="button" onClick={onImageUploadDialogOpen}>{
          screenshotMetadata.length === 0
            ? 'Add a screenshot'
            : 'Add another screenshot'
        }</button>
      }
    </div>
  );
}

interface ScreenshotProps {
  imageFile: File;
  onRemoveScreenshot: () => void;
}

function ScreenshotPreview({ imageFile, onRemoveScreenshot }: ScreenshotProps) {
  const [ imageUrl, setImageUrl ] = useState<string | undefined>(undefined);

  useEffect(() => {
    setImageUrl(URL.createObjectURL(imageFile));
  }, [ imageFile ]);

  useEffect(() => () => {
    if (imageUrl != null) {
      URL.revokeObjectURL(imageUrl);
    }
  }, [ imageUrl ] );

  return (
    <div className={cx('--ScreenshotPreview')}>
      <img src={imageUrl} />
      <button className="btn" type="button" onClick={onRemoveScreenshot}>Remove this screenshot</button>
    </div>
  );
}

export default ContactUsScreenshots;
