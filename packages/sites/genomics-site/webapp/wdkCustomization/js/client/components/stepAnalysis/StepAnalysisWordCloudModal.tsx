import React from 'react';

import { Dialog } from '@veupathdb/wdk-client/lib/Components';

interface WordCloudModalProps {
  imgUrl: string;
  open: boolean;
  onClose: () => void;
  toolName: string;
}

export const WordCloudModal: React.FunctionComponent<WordCloudModalProps> = ({
  imgUrl,
  open,
  onClose,
  toolName,
}) => (
  <Dialog
    open={open}
    resizable
    draggable
    allowKeyboardMoving={true}
    onClose={onClose}
    title={`Word Cloud of ${toolName} Results`}
    description="Floating, keyboard-positionable dialog containing a word cloud representation of the results. Press M to enter keyboard-positioning mode."
    className="word-cloud-modal"
  >
    <img src={imgUrl} />
    <p>Top 40 most significant GO terms</p>
    <p>
      If you would like to download this image please{' '}
      <a href={imgUrl}>Click Here</a>
    </p>
  </Dialog>
);
