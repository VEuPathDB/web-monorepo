import React from 'react';

import { Dialog } from '../../../../Components';

interface WordCloudModalProps {
  imgUrl: string;
  open: boolean;
  onClose: () => void;
}

export const WordCloudModal: React.SFC<WordCloudModalProps> = ({
  imgUrl,
  open,
  onClose
}) => (
  <Dialog open={open} draggable onClose={onClose}>
    <div style={{ width: 700, height: 400 }}>
      <img src={imgUrl} />
    </div>
    <p>
      This word cloud was created using the P-values and the full terms from the Enrichment analysis via a program called GOSummaries
    </p>
    <p>
      If you would like to download this image please <a href={imgUrl}>Click Here</a>
    </p>
  </Dialog>
);