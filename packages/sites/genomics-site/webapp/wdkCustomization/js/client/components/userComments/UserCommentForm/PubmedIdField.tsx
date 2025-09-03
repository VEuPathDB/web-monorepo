import React from 'react';
import { PubmedPreview } from '../../../types/userCommentTypes';
import {
  TextBox,
  HelpIcon,
  BetaIcon,
} from '@veupathdb/wdk-client/lib/Components';
import { PubmedIdPreview } from './PubmedIdPreview';
import { PubmedIdSearchField } from './PubmedIdSearchField';
import { useSelector } from 'react-redux';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

interface PubMedIdsFieldProps {
  geneId: string | undefined;
  idsField: string;
  searchField: string;
  onIdsChange: (value: string) => void;
  onSearchFieldChange: (value: string) => void;
  openPreview: () => void;
  previewOpen: boolean;
  onClosePreview: () => void;
  previewData?: PubmedPreview;
}

export const PubMedIdsField: React.FunctionComponent<PubMedIdsFieldProps> = ({
  geneId,
  idsField,
  searchField,
  onIdsChange,
  onSearchFieldChange,
  openPreview,
  previewOpen,
  onClosePreview,
  previewData,
}) => {
  const projectId = useSelector(
    (state: RootState) => state.globalData.config?.projectId
  );

  return (
    <div className="wdk-PubMedIdsField">
      <div className="wdk-PubMedIdInputField">
        <TextBox value={idsField} onChange={onIdsChange} />

        <HelpIcon>
          <ul>
            <li>
              {' '}
              First, find the publication in{' '}
              <a href="http://www.ncbi.nlm.nih.gov/pubmed">PubMed</a> based on
              author or title.
            </li>
            <li>
              Enter one or more IDs in the box above separated by ','s (Example:
              18172196,10558988).
            </li>
            <li>
              Click 'Preview' to see information about these publications.
            </li>
          </ul>
        </HelpIcon>
        <div>
          <button
            className="wdk-PubMedIdOpenPreviewButton"
            type="button"
            onClick={openPreview}
          >
            Preview
          </button>{' '}
          the article details of the PubMed ID(s) above
        </div>
        {previewOpen && (
          <PubmedIdPreview
            className="wdk-PubMedIdPreview"
            onClose={onClosePreview}
            previewData={previewData}
          />
        )}
      </div>
      <PubmedIdSearchField
        className="wdk-PubMedIdSearchField"
        query={searchField}
        onChange={onSearchFieldChange}
      />
      {geneId && projectId && (
        <div>
          <h4>
            🤖 AI-extracted annotations <BetaIcon />
          </h4>
          <ul>
            {(() => {
              const validIds = idsField
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id !== '' && /^\d+$/.test(id));

              if (validIds.length === 0) {
                return (
                  <li key="placeholder">
                    Enter valid PubMed ID(s) in the field above
                  </li>
                );
              }

              return validIds.map((id, index) => {
                const url = `https://pgb.liv.ac.uk/~tony/ai_summary/?db=${projectId}&id=${id}&gene=${geneId}`;
                const link_text = `${geneId} function from full-text of PubMed ${id}`;
                return (
                  <li key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {link_text}
                    </a>
                  </li>
                );
              });
            })()}
          </ul>
          <p>
            <i>Opens new tabs. Requires fully open-access papers.</i>
          </p>
        </div>
      )}
    </div>
  );
};
