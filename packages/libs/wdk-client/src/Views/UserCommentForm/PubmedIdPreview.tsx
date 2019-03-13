import React from 'react';

import { PubmedIdEntry } from 'wdk-client/Views/UserCommentForm/PubmedIdEntry';

import { PubmedPreview } from 'wdk-client/Utils/WdkUser';
import { Loading } from 'wdk-client/Components';

interface PubmedIdPreviewProps {
  onClose: () => void;
  previewData?: PubmedPreview;
}

export const PubmedIdPreview: React.SFC<PubmedIdPreviewProps> = ({
  onClose,
  previewData
}) => (
  previewData
    ? (
      <>
        <a href="#" onClick={event => {
          event.preventDefault();
          onClose();
        }}>
          <i className="fa fa-times" />
        </a>
        {
          previewData.map((previewDatum, index) => (
            <PubmedIdEntry 
              key={index}
              {...previewDatum}
            />
          ))
        }
      </>
    )
    : <Loading />
);
