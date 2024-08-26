import React from 'react';
import { JbrowseIframe } from '@veupathdb/web-common/lib/components/JbrowseIframe';

const JBrowseLinkContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  margin: '25px',
  textAlign: 'center',
};

/**
 * Each entry below is used in two scenarios:
 *
 *   1. To display a thumbnail in the overview section of a record page
 *   2. To Render a gbrowse image in the place of an attribute on the record page.
 *
 * The structure of an entry is as follows:
 *
 *   type Context = {
 *     // The name of the attribute with the gbrowse url.
 *     gbrowse_url: string;
 *
 *     // The name of the section (category, attribute, or table) to link to
 *     anchor: string;
 *
 *     // The display name to show for the thumbnail.
 *     displayName: string;
 *
 *     // Flag to indicate if a thumbnail should be used.
 *     // If not present, true is assumed.
 *     includeInThumbnails?: boolean;
 *
 *     // Flag to indicate if context is for pbrowse.
 *     // This was used to filter out pbrowse contexts if gene was
 *     // not protein coding. This is not necessary any more since
 *     // the category tree is pruned based on that, and we only show
 *     // contexts that are in the category tree.
 *     isPbrowse: boolean;
 *   }
 */
export let contexts = [
  {
    gbrowse_url: 'GeneModelGbrowseUrl',
    displayName: 'Gene Model',
    anchor: 'GeneModelGbrowseUrl',
    isPbrowse: false,
    includeInThumbnails: false,
  },
  {
    gbrowse_url: 'GeneModelApolloUrl',
    displayName: 'Apollo',
    anchor: 'GeneModelApolloUrl',
    isPbrowse: false,
    includeInThumbnails: false,
  },
  {
    gbrowse_url: 'SyntenyGbrowseUrl',
    displayName: 'Synteny',
    anchor: 'SyntenyGbrowseUrl',
    isPbrowse: false,
  },
  {
    gbrowse_url: 'BlatAlignmentsGbrowseUrl',
    displayName: 'Blat Alignments',
    anchor: 'BlatAlignmentsGbrowseUrl',
    isPbrowse: false,
  },
  {
    gbrowse_url: 'SnpsGbrowseUrl',
    displayName: 'SNPs',
    anchor: 'SnpsGbrowseUrl',
    isPbrowse: false,
  },
  {
    gbrowse_url: 'FeaturesPbrowseUrl',
    displayName: 'Protein Properties',
    anchor: 'ProteinProperties',
    isPbrowse: true,
  },
  {
    gbrowse_url: 'ProteomicsPbrowseUrl',
    displayName: 'Proteomics',
    anchor: 'ProteinExpressionPBrowse',
    isPbrowse: true,
  },
  {
    gbrowse_url: 'dnaContextUrl',
    displayName: 'Features',
    anchor: 'FeaturesGBrowse',
    isPbrowse: false,
  },
  {
    gbrowse_url: 'jbrowseUrl',
    displayName: 'Genomic Context',
    anchor: 'orfGenomicContext',
    isPbrowse: false,
  },
  {
    gbrowse_url: 'snpChipGbrowseImageUrl',
    displayName: 'Genomic Context',
    anchor: 'snpChipGenomicContext',
    isPbrowse: false,
  },
  {
    gbrowse_url: 'snpGbrowseImageUrl',
    displayName: 'Genomic Context',
    anchor: 'snpGenomicContext',
    isPbrowse: false,
  },
  {
    gbrowse_url: 'spanGbrowseImageUrl',
    displayName: 'Genomic Context',
    anchor: 'spanGenomicContext',
    isPbrowse: false,
  },
];

const JbrowseLink = ({ url }) => (
  <div style={JBrowseLinkContainerStyle}>
    <a
      href={url}
      className="eupathdb-BigButton"
      target="_blank"
      rel="noreferrer"
    >
      View in JBrowse genome browser
    </a>
  </div>
);

const ApolloJbrowseLink = ({ url, urlApollo }) => (
  <div style={JBrowseLinkContainerStyle}>
    <a
      href={url}
      className="eupathdb-BigButton"
      target="_blank"
      rel="noreferrer"
    >
      View in JBrowse genome browser
    </a>
    <a
      href={urlApollo}
      className="eupathdb-BigButton"
      target="_blank"
      rel="noreferrer"
    >
      &emsp;&emsp;&emsp;&emsp;Annotate in Apollo&emsp;&emsp;&emsp;&emsp;
    </a>
  </div>
);

const PbrowseJbrowseLink = ({ url }) => (
  <div style={JBrowseLinkContainerStyle}>
    <a href={url} className="eupathdb-BigButton">
      View in protein browser
    </a>
  </div>
);

export function GbrowseContext(props) {
  let { attribute, record } = props;
  let url = record.attributes[attribute.name];
  let jbrowseUrlMinimal = '';
  let jbrowseUrlFull = '';
  let apolloUrlFull = '';
  let apolloHelp = '';
  let isInApollo = '';
  let jbrowseCommonUrl = record.attributes.jbrowseUrl;

  if (attribute.name === 'GeneModelGbrowseUrl') {
    jbrowseUrlMinimal = record.attributes.geneJbrowseUrl;
    jbrowseUrlFull = record.attributes.geneJbrowseFullUrl;
    apolloUrlFull = record.attributes.geneApolloFullUrl;
    apolloHelp = record.attributes.apolloHelp;
    isInApollo = record.attributes.apolloIdCheck;
    if (isInApollo !== '' && isInApollo !== null) {
      return (
        <div>
          <p>
            This gene is available in <b>Apollo</b> for community annotation. To
            find out more about Apollo, please visit{' '}
            <a href={apolloHelp}>this help page.</a>
          </p>
          <ApolloJbrowseLink url={jbrowseUrlFull} urlApollo={apolloUrlFull} />
          <JbrowseIframe jbrowseUrl={jbrowseUrlMinimal} height="400" />
          <ApolloJbrowseLink url={jbrowseUrlFull} urlApollo={apolloUrlFull} />
        </div>
      );
    } else {
      return (
        <div>
          <JbrowseLink url={jbrowseUrlFull} />
          <JbrowseIframe jbrowseUrl={jbrowseUrlMinimal} height="400" />
          <JbrowseLink url={jbrowseUrlFull} />
        </div>
      );
    }
  }
  if (
    attribute.name === 'SyntenyGbrowseUrl' ||
    attribute.name === 'BlatAlignmentsGbrowseUrl' ||
    attribute.name === 'SnpsGbrowseUrl'
  ) {
    if (attribute.name === 'SyntenyGbrowseUrl') {
      jbrowseUrlMinimal = record.attributes.syntenyJbrowseUrl;
      jbrowseUrlFull = record.attributes.syntenyJbrowseFullUrl;
    }
    if (attribute.name === 'BlatAlignmentsGbrowseUrl') {
      jbrowseUrlMinimal = record.attributes.blatJbrowseUrl;
      jbrowseUrlFull = record.attributes.blatJbrowseFullUrl;
    }
    if (attribute.name === 'SnpsGbrowseUrl') {
      jbrowseUrlMinimal = record.attributes.snpsJbrowseUrl;
      jbrowseUrlFull = record.attributes.snpsJbrowseFullUrl;
    }
    return (
      <div>
        <JbrowseLink url={jbrowseUrlFull} />
        <JbrowseIframe jbrowseUrl={jbrowseUrlMinimal} height="500" />
        <JbrowseLink url={jbrowseUrlFull} />
      </div>
    );
  }

  if (
    attribute.name === 'snpJbrowseUrl' ||
    attribute.name === 'spanJbrowseUrl'
  ) {
    return (
      <div>
        <JbrowseIframe jbrowseUrl={url} height="400" />
        <br></br>
      </div>
    );
  }
  if (attribute.name === 'dnaContextUrl') {
    jbrowseUrlFull = record.attributes.jbrowseUrl;
    jbrowseUrlMinimal = record.attributes.dnaContextUrl;
    return (
      <div>
        <JbrowseLink url={jbrowseUrlFull} />
        <JbrowseIframe jbrowseUrl={jbrowseUrlMinimal} height="250" />
        <JbrowseLink url={jbrowseUrlFull} />
      </div>
    );
  }
  if (attribute.name === 'snpGbrowseImageUrl') {
    jbrowseUrlFull = record.attributes.snpGbrowseImageUrl;
    return (
      <div>
        <JbrowseIframe jbrowseUrl={jbrowseUrlFull} height="500" />
      </div>
    );
  }
  if (attribute.name === 'snpChipGbrowseImageUrl') {
    jbrowseUrlFull = record.attributes.snpChipGbrowseImageUrl;
    return (
      <div>
        <JbrowseIframe jbrowseUrl={jbrowseUrlFull} height="300" />
      </div>
    );
  }
  if (attribute.name === 'spanGbrowseImageUrl') {
    jbrowseUrlFull = record.attributes.spanGbrowseImageUrl;
    return (
      <div>
        <JbrowseIframe jbrowseUrl={jbrowseUrlFull} height="500" />
      </div>
    );
  }

  return (
    <div>
      <JbrowseLink url={jbrowseCommonUrl} />
      <JbrowseIframe jbrowseUrl={jbrowseUrlMinimal} height="500" />
      <JbrowseLink url={jbrowseCommonUrl} />
    </div>
  );
}

export function ProteinContext(props) {
  let jbrowseUrl = props.rowData.pJbrowseUrl;
  let jbrowseUrlMinimal = props.rowData.proteinJbrowseUrl;
  return (
    <div>
      <PbrowseJbrowseLink url={jbrowseUrl} />
      <JbrowseIframe jbrowseUrl={jbrowseUrlMinimal} height="500" />
      <PbrowseJbrowseLink url={jbrowseUrl} />
    </div>
  );
}
