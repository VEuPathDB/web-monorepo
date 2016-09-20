import {PropTypes} from 'react';
import {once, memoize, debounce} from 'lodash';
import $ from 'jquery';
import { PureComponent } from 'wdk-client/ComponentUtils';
import { Loading } from 'wdk-client/Components';

export let contexts = [
  {
    gbrowse_url: 'GeneModelGbrowseUrl',
    displayName: 'Gene Model',
    anchor: 'GeneModelGbrowseUrl',
    isPbrowse: false
  },
  {
    gbrowse_url: 'SyntenyGbrowseUrl',
    displayName: 'Synteny',
    anchor: 'SyntenyGbrowseUrl',
    isPbrowse: false
  },
  {
    gbrowse_url: 'SnpsGbrowseUrl',
    displayName: 'SNPs',
    anchor: 'SnpsGbrowseUrl',
    isPbrowse: false
  },
  {
    gbrowse_url: 'FeaturesPbrowseUrl',
    displayName: 'Protein Properties',
    anchor: 'ProteinProperties',
    isPbrowse: true
  },
  {
    gbrowse_url: 'ProteomicsPbrowseUrl',
    displayName: 'Proteomics',
    anchor: 'ProteinExpressionPBrowse',
    isPbrowse: true
  },
  {
    gbrowse_url: 'dnaContextUrl',
    displayName: 'Features',
    anchor: 'FeaturesGBrowse',
    isPbrowse: false
  },
  {
    gbrowse_url: 'orfGbrowseImageUrl',
    displayName: 'Genomic Context',
    anchor: 'orfGenomicContext',
    isPbrowse: false
  },
  {
    gbrowse_url: 'snpChipGbrowseImageUrl',
    displayName: 'Genomic Context',
    anchor: 'snpChipGenomicContext',
    isPbrowse: false
  },
  {
    gbrowse_url: 'snpGbrowseImageUrl',
    displayName: 'Genomic Context',
    anchor: 'snpGenomicContext',
    isPbrowse: false
  },
  {
    gbrowse_url: 'spanGbrowseImageUrl',
    displayName: 'Genomic Context',
    anchor: 'spanGenomicContext',
    isPbrowse: false
  }
];

const GbrowseLink = ({ url }) =>
  <div style={{ textAlign: 'center', margin: 6 }}>
    <a href={makeGbrowseLinkUrl(url)} className="eupathdb-BigButton">View in genome browser</a>
  </div>

export function GbrowseContext(props) {
  let { attribute, record } = props;
  let url = record.attributes[attribute.name];
  return (
    <div>
      <GbrowseLink url={url}/>
      <GbrowseImage url={url} includeImageMap={true} />
      <GbrowseLink url={url}/>
    </div>
  );
}

export function ProteinContext(props) {
  let url = props.rowData.ProteinPbrowseUrl;
  return (
    <div className="eupathdb-GbrowseContext">
      <GbrowseLink url={url}/>
      <GbrowseImage url={url} includeImageMap={true} />
      <GbrowseLink url={url}/>
    </div>
  );
}


// RegExps specific to Gbrowse image maps

/** Image map mouseover regexp */
const onMouseOverRegexp = /GBubble\.showTooltip\(event,'(\w+:)?(.*)'.*$/;


/**
 * Helper Component that loads and parses a Gbrowse image map in order to provide
 * custom tooltips, etc. This is needed to avoid loading Prototype.js in the
 * page, which breaks many parts of the app in subtle ways.
 */
export class GbrowseImage extends PureComponent {
  constructor(props) {
    super(props);
    this.containerNode = null;
    this.xhr = null;
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
      this.xhr && this.xhr.abort();
      this.loadImage(nextProps);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.scaleImageMap);
    window.removeEventListener('focus', this.scaleImageMap);
    window.removeEventListener('click', this.scaleImageMap);
  }

  loadImage(props) {
    this.setState({ loading: true });
    this.xhr = get(props.url.replace('/cgi-bin/', '/fcgi-bin/') + ';width=800;embed=1;genepage=1');
    this.xhr.promise().then(
      data => this.handleImageLoad(data),
      jqXhr => this.handleError(jqXhr)
    );
  }

  handleImageLoad(data) {
    let $container = $(this.containerNode).empty();
    let nodes = $.parseHTML(data);
    let img = this.img = nodes.find(node => node.nodeName === 'IMG');
    img.className = 'eupathdb-GbrowseImage';

    if (!this.props.includeImageMap) {
      img.removeAttribute('usemap');
      $container.append(img);
    }

    else {
      let map = this.map = nodes.find(node => node.nodeName === 'MAP');
      $container.append(img).append(map)
      .find('area[onmouseover]')
      .attr('gbrowse-onmouseover', function() {
        let onmouseoverValue = this.getAttribute('onmouseover');
        this.removeAttribute('onmouseover');
        this.onmouseover = null;
        return onmouseoverValue;
      })
      .qtip({
        content: {
          text(event, api) {
            let matches = onMouseOverRegexp.exec(this.attr('gbrowse-onmouseover'));
            if (matches == null) {
              return;
            }
            let [, pragma = '', content = '' ] = matches;
            if (pragma === 'javascript:') {
              // FIXME inject helpers here?
              let contentFn = new Function('"use strict"; return ' + content.replace(/^escape\((.*)\)$/, '$1').replace(/\\/g, ''));
              return contentFn.call(this.get(0));
            }
            else if (pragma === 'url:') {
              get(content).then(
                (data) => api.set('content.text', data),
                (xhr, status, error) => api.set('content.text', status + ': ' + error)
              );
            }
            else {
              return content;
            }
          },
          title: 'Track details', // adds the top border that the close button resides within
          button: true // close button
        },
        position: {
          my: 'bottom center',
          at: 'center center',
          effect: false,
          target: 'event',
          viewport: $(window),
          adjust: {
            method: 'shift'
          }
        },
        show: {
          solo: true,
          delay: 100
        },
        hide: {
          fixed: true,
          delay: 2000
        },
        style: {
          classes: 'qtip-bootstrap eupathdb-GbrowseImageMapTooltip',
          tip: { height: 12, width: 18 }
        }
      });

      this.mapCoordsCache = [];
      for (let area of map.querySelectorAll('area')) {
        this.mapCoordsCache.push(area.getAttribute('coords'));
      }

      img.addEventListener('onload', this.scaleImageMap);
    }
    this.setState({ loading: false });
  }

  handleError(jqXHR) {
    let { statusText } = jqXHR;
    if (statusText === 'abort') return;
    let error = 'Unable to load mouseover details for tracks.';
    this.setState({ error })
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
      .map((coord, i) => Number(coord) * (i % 2 === 0 ? widthScale : heightScale)) // only works for shape="rect"
      .join(',');
      area.setAttribute('coords', coords);
    }
  }

  renderError() {
    if (this.state.error) {
      return (
        <div style={{ color: 'red', fontStyle: 'italic', padding: '12px 0' }}>Error: {this.state.error}</div>
      )
    }
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <div style={{ position: 'relative', height: 50 }}>
          <Loading/>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.renderLoading()}
        {this.renderError()}
        <div ref={node => this.containerNode = node}/>
      </div>
    );
  }
}

GbrowseImage.propTypes = {
  url: PropTypes.string.isRequired,
  includeImageMap: PropTypes.bool
};

GbrowseImage.defaultProps = {
  includeImageMap: false
};

let loadGbrowseScripts = once(() => {
  return new Promise(function(resolve, reject) {
    $.getScript('/gbrowse/apiGBrowsePopups.js').then(
      () => resolve(),
      (jqxhr, settings, exception) => reject(String(exception))
    );
  });
});

let get = memoize($.get.bind($));


/** Gbrowse url track separator */
const TRACKS_SEPARATOR = '%1E';

/** Regexp to match `l` param. Captures value of `l` in match group 1 */
const TRACKS_PARAM_REGEXP = /([?;])l=([^;]+)/;

/** Regexp to match `genepage` param. */
const GENEPAGE_PARAM_REGEXP = /[?;]genepage=1/;

/**
 * Function passed to replace function used with `TRACKS_PARAM_REGEXP`
 * that will reverse tracks order.
 */
function tracksReplacer(_, prefix, tracks) {
  return prefix + 'enable=' +
    (tracks
      .split(TRACKS_SEPARATOR)
      .reverse()
      .join(TRACKS_SEPARATOR));
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
