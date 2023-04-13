import { format, parse } from 'date-fns';

// Components
import { Copy } from '@veupathdb/coreui';
import { FloatingButton } from '@veupathdb/coreui';

// Definitions
import { DownloadTabStudyRelease } from './types';
import { colors, Paragraph, H5 } from '@veupathdb/coreui';

// Utils
import {
  writeTextToClipboard,
  stripHTML,
} from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeStyles } from '@material-ui/core';

export type CitationDetails = {
  partialCitationData: {
    studyContacts: string;
    studyDisplayName: string;
    projectDisplayName: string;
    citationUrl: string;
  };
  release: DownloadTabStudyRelease;
};

export function getCitationString({
  partialCitationData,
  release,
}: CitationDetails) {
  const { studyContacts, studyDisplayName, projectDisplayName, citationUrl } =
    partialCitationData;

  /**
   * In the event an error occurs while parsing or formatting the date, we fall back
   * on the release date format provided from the backend
   */
  let citationDate;
  try {
    const parsedReleaseDate = parse(
      release.date ?? '',
      'yyyy-MMM-dd',
      new Date()
    );
    citationDate = format(parsedReleaseDate, 'dd MMMM yyyy');
  } catch {
    citationDate = release.date ?? 'date unknown';
  }
  return `${studyContacts}. Dataset: ${studyDisplayName}. ${projectDisplayName}. ${citationDate}, Release ${release.releaseNumber} (${citationUrl})`;
}

const useStyles = makeStyles(() => ({
  tooltip: {},
}));

export default function StudyCitation({
  partialCitationData,
  release,
}: CitationDetails) {
  const citation = getCitationString({
    partialCitationData,
    release,
  });

  const copyCitation = () => {
    writeTextToClipboard(stripHTML(citation));
  };

  return (
    <>
      <H5 additionalStyles={{ marginBottom: 0, marginTop: 20 }}>
        Dataset Citation:{' '}
      </H5>
      <Paragraph
        color={colors.gray[600]}
        styleOverrides={{ margin: 0 }}
        textSize="medium"
      >
        Please cite that you accessed data via{' '}
        {partialCitationData.projectDisplayName}. The citation below can be used
        to reference the latest version of the data. Citations for previous data
        versions can be found under each release.
      </Paragraph>
      <Paragraph
        color={colors.gray[600]}
        styleOverrides={{ margin: 0 }}
        textSize="medium"
      >
        <span>
          <i>{safeHtml(citation)}</i>
          <div
            style={{ display: 'inline-block', position: 'relative', top: 3 }}
          >
            <FloatingButton
              icon={Copy}
              text=""
              onPress={copyCitation}
              size="small"
              tooltip="Copy citation to clipboard"
              themeRole="primary"
              styleOverrides={{
                container: {
                  height: 17,
                  paddingLeft: 10,
                  paddingRight: 10,
                },
              }}
            />
          </div>
        </span>
      </Paragraph>
    </>
  );
}
