import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Dialog } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import {
  MAX_ATTACHMENT_SIZE,
  MAX_ATTACHMENT_SIZE_DESCRIPTION
} from 'ebrc-client/selectors/ContactUsSelectors';

import './ImageUploadDialog.scss';

const cx = makeClassNameHelper('ImageUploadDialog');

interface Props {
  onSubmit: (file: File) => void;
  onClose: () => void;
}

export function ImageUploadDialog({ onSubmit, onClose }: Props) {
  const { imageFile, imageUrl } = useImageFromClipboard();

  const onClickOk = useCallback(() => {
    if (imageFile != null) {
      if (imageFile.size > MAX_ATTACHMENT_SIZE) {
        alert(`Please upload a screenshot which is no larger than ${MAX_ATTACHMENT_SIZE_DESCRIPTION}`);
      } else {
        onSubmit(imageFile);
      }
    }
  }, [ onSubmit, imageFile ]);

  return (
    <Dialog open modal className={cx()} title="Add A Screenshot From Your Clipboard" onClose={onClose}>
      <div className={cx('--PasteZone')}>
        {
          imageUrl == null
            ? <p className={cx('--Instructions')}>Paste a screenshot into this window using Ctrl/Cmd + V</p>
            : <img src={imageUrl} />
        }
      </div>
      <div className={cx('--Footer')}>
        <button className="btn" disabled={imageFile == null} onClick={onClickOk} type="button">OK</button>
        <button className="btn" onClick={onClose} type="button">Cancel</button>
      </div>
    </Dialog>
  );
}

function useImageFromClipboard() {
  const [ pastedImage, setPastedImage ] = useState<File | undefined>(undefined);
  const [ pastedImageUrl, setPastedImageUrl ] = useState<string | undefined>(undefined);

  const handlePaste = useCallback((event: Event) => {
    if (
      event instanceof ClipboardEvent &&
      event.clipboardData?.items != null
    ) {
      const pastedItems = [...event.clipboardData.items];
      const pastedImageItem = pastedItems.find(({ type }) => type.startsWith('image'));

      if (pastedImageItem == null) {
        alert("No image was found in your clipboard. You can add a screenshot to your clipboard using your computer's 'Print Screen' functionality.");
        return;
      }

      const pastedImageFile = pastedImageItem.getAsFile();

      if (pastedImageFile != null) {
        setPastedImage(pastedImageFile);
        setPastedImageUrl(URL.createObjectURL(pastedImageFile));
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste, false);

    return () => {
      window.removeEventListener('paste', handlePaste, false);
    };
  }, []);

  useEffect(() => () => {
    if (pastedImageUrl != null) {
      URL.revokeObjectURL(pastedImageUrl);
    }
  }, [ pastedImageUrl ]);

  return {
    imageFile: pastedImage,
    imageUrl: pastedImageUrl
  };
}
