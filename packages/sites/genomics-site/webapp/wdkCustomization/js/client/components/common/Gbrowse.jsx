import $ from 'jquery';
import { once, debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { httpGet } from '@veupathdb/web-common/lib/util/http';
import { JbrowseIframe } from '@veupathdb/web-common/lib/components/JbrowseIframe';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import newFeatureImage from '@veupathdb/wdk-client/lib/Core/Style/images/new-feature.png';

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
    <a href={url} className="eupathdb-BigButton" target="_blank">
      View in JBrowse genome browser
    </a>
  </div>
);

const ApolloJbrowseLink = ({ url, urlApollo }) => (
  <div style={JBrowseLinkContainerStyle}>
    <a href={url} className="eupathdb-BigButton" target="_blank">
      View in JBrowse genome browser
    </a>
    <a href={urlApollo} className="eupathdb-BigButton" target="_blank">
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
  let urlApollo = record.attributes[attribute.name];
  let jbrowseUrlMinimal = '';
  let jbrowseUrlFull = '';
  let apolloUrlFull = '';
  let apolloHelp = '';
  let isInApollo = '';
  let jbrowseUrl = record.attributes.jbrowseLink;
  let jbrowseCommonUrl = record.attributes.jbrowseUrl;

  if (attribute.name == 'GeneModelGbrowseUrl') {
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
    attribute.name == 'SyntenyGbrowseUrl' ||
    attribute.name == 'BlatAlignmentsGbrowseUrl' ||
    attribute.name == 'SnpsGbrowseUrl'
  ) {
    if (attribute.name == 'SyntenyGbrowseUrl') {
      jbrowseUrlMinimal = record.attributes.syntenyJbrowseUrl;
      jbrowseUrlFull = record.attributes.syntenyJbrowseFullUrl;
    }
    if (attribute.name == 'BlatAlignmentsGbrowseUrl') {
      jbrowseUrlMinimal = record.attributes.blatJbrowseUrl;
      jbrowseUrlFull = record.attributes.blatJbrowseFullUrl;
    }
    if (attribute.name == 'SnpsGbrowseUrl') {
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

  if (attribute.name == 'snpJbrowseUrl' || attribute.name == 'spanJbrowseUrl') {
    return (
      <div>
        <JbrowseIframe jbrowseUrl={url} height="400" />
        <br></br>
      </div>
    );
  }
  if (attribute.name == 'dnaContextUrl') {
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
  if (attribute.name == 'snpGbrowseImageUrl') {
    jbrowseUrlFull = record.attributes.snpGbrowseImageUrl;
    return (
      <div>
        <JbrowseIframe jbrowseUrl={jbrowseUrlFull} height="500" />
      </div>
    );
  }
  if (attribute.name == 'snpChipGbrowseImageUrl') {
    jbrowseUrlFull = record.attributes.snpChipGbrowseImageUrl;
    return (
      <div>
        <JbrowseIframe jbrowseUrl={jbrowseUrlFull} height="300" />
      </div>
    );
  }
  if (attribute.name == 'spanGbrowseImageUrl') {
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
  let url = props.rowData.ProteinPbrowseUrl;
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

// RegExps specific to Gbrowse image maps

/** Image map mouseover regexp */
const onMouseOverRegexp = /GBubble\.showTooltip\(event,'(\w+:)?(.*)'.*$/;

const loadingHeight = 50;

let gbrowse_img_id = 1;

/**
 * Helper Component that loads and parses a Gbrowse image map in order to provide
 * custom tooltips, etc. This is needed to avoid loading Prototype.js in the
 * page, which breaks many parts of the app in subtle ways.
 */
export class GbrowseImage extends PureComponent {
  constructor(props) {
    super(props);
    this.containerNode = null;
    this.request = null;
    this.gbrowse_img_id = gbrowse_img_id++;
    this.img = null;
    this.map = null;
    this.mapCoordsCache = null;
    this.state = { error: null, loading: true };
    this.scaleImageMap = debounce(this.scaleImageMap.bind(this), 250);
  }

  componentDidMount() {
    loadGbrowseScripts().then(
      () => this.loadImage(this.props),
      (error) => this.setState({ error })
    );
    window.addEventListener('resize', this.scaleImageMap);
    window.addEventListener('focus', this.scaleImageMap);
    window.addEventListener('click', this.scaleImageMap);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.gbrowse_img_id = gbrowse_img_id++;
      this.request && this.request.abort();
      this.setState({ loading: true });
      $(this.containerNode).find('area').qtip('destroy', true);
      this.loadImage(nextProps);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.scaleImageMap);
    window.removeEventListener('focus', this.scaleImageMap);
    window.removeEventListener('click', this.scaleImageMap);
    $(this.containerNode).find('area').qtip('destroy', true);
    this.request && this.request.abort();
  }

  loadImage(props) {
    this.request = httpGet(
      props.url.replace('/cgi-bin/', '/fcgi-bin/') +
        ';width=800;embed=1;genepage=1'
    );
    this.request.promise().then(
      (data) => this.handleImageLoad(data),
      (jqXhr) => this.handleError(jqXhr)
    );
  }

  handleImageLoad(data) {
    let $container = $(this.containerNode).empty();
    let nodes = $.parseHTML(data);
    let img = (this.img = nodes.find((node) => node.nodeName === 'IMG'));

    img.className = 'eupathdb-GbrowseImage';

    img.addEventListener('load', () => {
      this.setState({ loading: false });
    });

    if (!this.props.includeImageMap) {
      img.removeAttribute('usemap');
      $container.append(img);
    } else {
      let map = (this.map = nodes.find((node) => node.nodeName === 'MAP'));
      map.id += '__' + this.gbrowse_img_id;
      map.name += '__' + this.gbrowse_img_id;
      img.useMap += '__' + this.gbrowse_img_id;
      $container
        .append(img)
        .append(map)
        .find('area[onmouseover]')
        .attr('gbrowse-onmouseover', function () {
          let onmouseoverValue = this.getAttribute('onmouseover');
          this.removeAttribute('onmouseover');
          this.onmouseover = null;
          return onmouseoverValue;
        })
        .qtip({
          content: {
            text(event, api) {
              let matches = onMouseOverRegexp.exec(
                this.attr('gbrowse-onmouseover')
              );
              if (matches == null) {
                return;
              }
              let [, pragma = '', content = ''] = matches;
              if (pragma === 'javascript:') {
                // FIXME inject helpers here?
                let contentFn = new Function(
                  '"use strict"; return ' +
                    content.replace(/^escape\((.*)\)$/, '$1').replace(/\\/g, '')
                );
                return contentFn.call(this.get(0));
              } else if (pragma === 'url:') {
                httpGet(content)
                  .promise()
                  .then(
                    (data) =>
                      api.set('content.text', data).reposition(event, false),
                    (xhr, status, error) =>
                      api
                        .set('content.text', status + ': ' + error)
                        .reposition(event, false)
                  );
              } else {
                return content;
              }
            },
            title: 'Track details', // adds the top border that the close button resides within
            button: true, // close button
          },
          position: {
            my: 'bottom center',
            at: 'center center',
            effect: false,
            target: 'event',
            viewport: $(window),
            adjust: {
              method: 'shift',
            },
          },
          show: {
            solo: true,
            delay: 500,
          },
          hide: {
            fixed: true,
            delay: 2000,
          },
          style: {
            classes: 'qtip-bootstrap eupathdb-GbrowseImageMapTooltip',
            tip: { height: 12, width: 18 },
          },
        });

      this.mapCoordsCache = [];
      for (let area of map.querySelectorAll('area')) {
        this.mapCoordsCache.push(area.getAttribute('coords'));
      }

      img.addEventListener('load', this.scaleImageMap);
    }
  }

  handleError(jqXHR) {
    let { statusText } = jqXHR;
    if (statusText === 'abort') return;
    let error = 'Unable to load mouseover details for tracks.';
    this.setState({ error });
    console.error('Error: %s. %o', error, jqXHR);
    this.setState({ loading: false });
  }

  scaleImageMap() {
    if (this.img == null || this.map == null) return;
    let { height, width, naturalHeight, naturalWidth } = this.img;
    let heightScale = height / naturalHeight;
    let widthScale = width / naturalWidth;
    let index = 0;
    for (let area of this.map.querySelectorAll('area')) {
      let orignalCoords = this.mapCoordsCache[index++];
      let coords = orignalCoords
        .split(/\s*,\s*/)
        .map(
          (coord, i) => Number(coord) * (i % 2 === 0 ? widthScale : heightScale)
        ) // only works for shape="rect"
        .join(',');
      area.setAttribute('coords', coords);
    }
  }

  renderError() {
    if (this.state.error) {
      return (
        <div style={{ color: 'red', fontStyle: 'italic', padding: '12px 0' }}>
          Error: {this.state.error}
        </div>
      );
    }
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <div style={{ position: 'relative', height: loadingHeight }}>
          <Loading />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.renderLoading()}
        {this.renderError()}
        <div ref={(node) => (this.containerNode = node)} />
      </div>
    );
  }
}

GbrowseImage.propTypes = {
  url: PropTypes.string.isRequired,
  includeImageMap: PropTypes.bool,
};

GbrowseImage.defaultProps = {
  includeImageMap: false,
};

let loadGbrowseScripts = once(() => {
  return new Promise(function (resolve, reject) {
    $.getScript('/gbrowse/apiGBrowsePopups.js').then(
      () => resolve(),
      (jqxhr, settings, exception) => reject(String(exception))
    );
  });
});

/** Gbrowse url track separator */
const TRACKS_SEPARATOR = '%1E';

/** Regexp to match `l` param. Captures value of `l` in match group 1 */
const TRACKS_PARAM_REGEXP = /([?;])l=([^;]+)/;

/** Regexp to match `genepage` param. */
const GENEPAGE_PARAM_REGEXP = /[?;]genepage=1/;

/**
 * Remove subtracks from track identifier. We do this since using the Gbrowse
 * 'embed' command does not support subtracks. See #23506.
 */
function removeSubtracks(track) {
  return track.replace(/\/.*$/, '');
}

/**
 * Function passed to replace function used with `TRACKS_PARAM_REGEXP`
 * that will reverse tracks order.
 */
function tracksReplacer(_, prefix, tracks) {
  return (
    prefix +
    'enable=' +
    tracks
      .split(TRACKS_SEPARATOR)
      .map(removeSubtracks)
      .reverse()
      .join(TRACKS_SEPARATOR)
  );
}

/**
 * Replace the query param `l` with `enable` so that listed tracks are merged
 * with user's existing tracks, and replace `gbrowse_img` with `gbrowse`;
 */
function makeGbrowseLinkUrl(url) {
  return url
    .replace(TRACKS_PARAM_REGEXP, tracksReplacer)
    .replace(GENEPAGE_PARAM_REGEXP, '')
    .replace('/gbrowse_img/', '/gbrowse/');
}

function replaceWithFullUrl(url) {
  return url
    .replace('/geneAnnotationTracks/', '/tracks/')
    .replace('/syntenyTracks/', '/tracks/')
    .replace('/geneticVariationTracks/', '/tracks/')
    .replace('/blatAlignmentTracks/', '/tracks/')
    .replace('/syntenyTracks/', '/tracks/');
}
