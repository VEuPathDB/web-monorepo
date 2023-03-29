import { MouseEventHandler, useState } from 'react';
import { format, parse } from 'date-fns';

// Components
import { Copy } from '@veupathdb/coreui';
import { FloatingButton } from '@veupathdb/coreui';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

// Definitions
import { DownloadTabStudyRelease } from './types';
import { colors, Paragraph } from '@veupathdb/coreui';

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
  const [hoveredState, setHoveredState] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    pageX: 0,
    pageY: 0,
  });
  const classes = useStyles();

  const citation = getCitationString({
    partialCitationData,
    release,
  });

  const copyCitation = () => {
    writeTextToClipboard(stripHTML(citation));
  };

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const { pageX, pageY } = event;
    setTooltipPosition({ pageX, pageY });
  };

  const computeStyleFn = (data: any) => {
    return {
      ...data,
      styles: {
        ...data.styles,
        left: `${tooltipPosition.pageX + 5}px`,
        top: `${tooltipPosition.pageY + 5}px`,
      },
    };
  };

  return (
    <Paragraph
      color={colors.gray[600]}
      styleOverrides={{ margin: 0 }}
      textSize="medium"
    >
      <span style={{ fontWeight: 500 }}>Dataset Citation: </span>
      <Tooltip
        title="Copy citation to clipboard"
        onMouseMove={handleMouseMove}
        classes={{ tooltip: classes.tooltip }}
        PopperProps={{
          modifiers: {
            computeStyle: {
              fn: computeStyleFn,
              gpuAcceleration: true,
            },
          },
        }}
      >
        <span
          onMouseOver={() => (hoveredState ? undefined : setHoveredState(true))}
          onMouseLeave={() =>
            !hoveredState ? undefined : setHoveredState(false)
          }
          onClick={copyCitation}
          style={{
            cursor: 'pointer',
            textDecoration: hoveredState ? 'underline' : undefined,
          }}
        >
          {safeHtml(citation)}
          <div
            style={{ display: 'inline-block', position: 'relative', top: 3 }}
          >
            <FloatingButton
              icon={Copy}
              text=""
              onPress={copyCitation}
              size="small"
              tooltip=""
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
      </Tooltip>
    </Paragraph>
  );
}
