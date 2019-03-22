import React from 'react';

import { PubmedIdEntry } from 'wdk-client/Views/UserCommentForm/PubmedIdEntry';

import { PubmedPreview } from 'wdk-client/Utils/WdkUser';
import { Loading } from 'wdk-client/Components';

interface PubmedIdPreviewProps {
  onClose: () => void;
  previewData?: PubmedPreview;
  className?: string;
}

export const PubmedIdPreview: React.SFC<PubmedIdPreviewProps> = ({
  onClose,
  previewData,
  className
}) => (
  previewData
    ? (
      <div className={className}>
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
      </div>
    )
    : <Loading />
);
