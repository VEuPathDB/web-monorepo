import {PropTypes} from 'react';
import lodash from 'lodash';
import $ from 'jquery';
import { Components, ComponentUtils } from 'wdk-client';

let { CollapsibleSection } = Components;

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
    displayName: 'Protein Features',
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

export function GbrowseContext(props) {
  let url = props.record.attributes[props.name];
  return (
    <CollapsibleSection
      id={props.name}
      className="eupathdb-GbrowseContext"
      style={{display: 'block', width: '100%' }}
      headerContent={props.displayName}
      isCollapsed={props.isCollapsed}
      onCollapsedChange={props.onCollapsedChange}
    >
      <GbrowseImage url={url} includeImageMap={true} />
      <div>
        <a href={url.replace('/gbrowse_img/', '/gbrowse/')}>View in genome browser</a>
      </div>
    </CollapsibleSection>
  );
}

export function ProteinContext(props) {
  let url = props.rowData.ProteinPbrowseUrl;
  let divId = props.table.name + "-" + props.rowData.transcript_id
  return (
    <div id={divId} className="eupathdb-GbrowseContext">
      <GbrowseImage url={url} includeImageMap={true} />
      <div>
        <a href={url.replace('/gbrowse_img/', '/gbrowse/')}>View in genome browser</a>
      </div>
    </div>
  );
}


// RegExps specific to Gbrowse image maps

/** Image map mouseover regexp */
const onMouseOverRegexp = /GBubble\.showTooltip\(event,'(\w+:)?(.*)'.*$/;
/** Regexp to get inner html of a map element */
const areaTagsRegexp = /<map [^>]*>([\s\S]*)<\/map>/;


/**
 * Helper Component that loads and parses a Gbrowse image map in order to provide
 * custom tooltips, etc. This is needed to avoid loading Prototype.js in the
 * page, which breaks many parts of the app in subtle ways.
 */
export class GbrowseImage extends ComponentUtils.PureComponent {
  constructor(props) {
    super(props);
    this.containerNode = null;
    this.xhr = null;
    this.state = { error: null };
  }

  componentDidMount() {
    loadGbrowseScripts().then(() => this.loadImage(this.props));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.xhr && this.xhr.abort();
      this.loadImage(nextProps);
    }
  }

  loadImage(props) {
    this.xhr = get(props.url + ';width=800;embed=1;genepage=1');
    this.xhr.promise().then(
      data => this.handleImageLoad(data),
      jqXhr => this.handleError(jqXhr)
    );
  }

  handleImageLoad(data) {
    let $container = $(this.containerNode).empty();
    let nodes = $.parseHTML(data);
    let img = nodes.find(node => node.nodeName === 'IMG');

    if (!this.props.includeImageMap) {
      img.removeAttribute('usemap');
      $container.append(img);
    }

    else {
      let map = nodes.find(node => node.nodeName === 'MAP');
      $container.append(img).append(map)
      .find('area[onmouseover]')
      .attr('gbrowse-onmouseover', function() {
        let onmouseoverValue = this.getAttribute('onmouseover');
        this.removeAttribute('onmouseover');
        this.onmouseover = null;
        return onmouseoverValue;
      })
      .wdkTooltip({
        content: {
          text(event, api) {
            let matches = onMouseOverRegexp.exec(this.attr('gbrowse-onmouseover'));
            if (matches == null) {
              return;
            }
            let [, pragma = '', content = '' ] = matches;
            if (pragma === 'javascript:') {
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
          }
        },
        position: {
          my: 'bottom center',
          at: 'center center',
          effect: false
        },
        style: {
          classes: 'qtip-bootstrap eupathdb-GbrowseImageMapTooltip',
          tip: { height: 12, width: 18 }
        }
      });
    }
  }

  handleError(jqXHR) {
    let { statusText } = jqXHR;
    if (statusText === 'abort') return;
    let error = 'Unable to load mouseover details for tracks.';
    this.setState({ error })
    console.error('Error: %s. %o', error, jqXHR);
  }

  renderError() {
    if (this.state.error) {
      return (
        <div style={{ color: 'red', fontStyle: 'italic', padding: '12px 0' }}>Error: {this.state.error}</div>
      )
    }
  }

  render() {
    return (
      <div>
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

let loadGbrowseScripts = lodash.once(() => {
  return $.getScript('/gbrowse/apiGBrowsePopups.js');
});

let get = lodash.memoize($.get.bind($));
