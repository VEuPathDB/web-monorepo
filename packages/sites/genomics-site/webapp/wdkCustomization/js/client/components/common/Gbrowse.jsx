import React from 'react';
import lodash from 'lodash';
import $ from 'jquery';
import { Components, ComponentUtils } from 'wdk-client';
import RemoteContent from './RemoteContent';

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
        gbrowse_url: 'spanGbrowseImageUrl',
        displayName: 'Genomic Context',
        anchor: 'spanGenomicContext',
        isPbrowse: false
    },
];

export class GbrowseContext extends ComponentUtils.PureComponent {

  constructor(...args) {
    super(...args);
    this.state = { isCollapsed: false };
    this.style = { display: 'block', width: '100%' };
    this.updateCollapsed = isCollapsed => {
      this.setState({ isCollapsed });
    };
  }

  render() {
    let gbrowseUrl = this.props.record.attributes[this.props.name];
    let iframeUrl = gbrowseUrl + ';width=800;embed=1';
    let mapName = this.props.name + '_map';
    return (
      <CollapsibleSection
        id={this.props.name}
        className="eupathdb-GbrowseContext"
        style={this.style}
        headerContent={this.props.displayName}
        isCollapsed={this.state.isCollapsed}
        onCollapsedChange={this.updateCollapsed}
      >
        <img src={gbrowseUrl} useMap={'#' + mapName}/>
        <GbrowseImageMap url={iframeUrl} name={mapName}/>
        <div>
          <a href={gbrowseUrl.replace('/gbrowse_img/', '/gbrowse/')}>View in genome browser</a>
        </div>
      </CollapsibleSection>
    );
  }

}

export function ProteinContext(props) {
  let url = props.rowData.ProteinPbrowseUrl;
  let divId = props.table.name + "-" + props.rowData.transcript_id
  let mapName = divId + '_map';
  return (
    <div id={divId} className="eupathdb-GbrowseContext">
      <img src={url} useMap={'#' + mapName}/>
      <GbrowseImageMap url={url + ';width=800;embed=1;genepage=1'} name={mapName}/>
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
class GbrowseImageMap extends ComponentUtils.PureComponent {
  constructor(props) {
    super(props);
    this.mapContainerNode = null;
    this.xhr = null;
    this.state = { error: null };
  }

  componentDidMount() {
    loadGbrowseScripts().then(() => this.loadImageMap(this.props));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.xhr && this.xhr.abort();
      this.loadImageMap(nextProps);
    }
  }

  loadImageMap(props) {
    this.xhr = $.get(props.url);
    this.xhr.promise().then(
      data => this.handleImageMapLoad(data),
      jqXhr => this.handleError(jqXhr)
    );
  }

  handleImageMapLoad(data) {
    // We need to parse the area tags from the HTML so we don't load the imgs.
    let areaTagsMatches = data.match(areaTagsRegexp);
    if (areaTagsMatches == null) return;
    let areaTagsHtml = areaTagsMatches[1];
    let container = document.createElement('div');
    container.innerHTML = areaTagsHtml;
    let areas = container.querySelectorAll('area[onmouseover]');
    for (let area of areas) {
      let matches = onMouseOverRegexp.exec(area.getAttribute('onmouseover'));
      if (matches == null) {
        continue;
      }
      let [, pragma = '', content = '' ] = matches;
      if (pragma === 'javascript:') {
        let contentFn = new Function('"use strict"; return ' + content.replace(/^escape\((.*)\)$/, '$1').replace(/\\/g, ''));
        area.setAttribute('title', contentFn.call(area));
      }
      else if (pragma === 'url:') {
        area.setAttribute('data-url', content);
      }
      else {
        area.setAttribute('title', content);
      }
      area.removeAttribute('onmouseover');
      area.onmouseover = null;
    }

    $(this.mapContainerNode)
    .empty()
    .append(areas)
    .find('area')
    .wdkTooltip({
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
        <map name={this.props.name} ref={node => this.mapContainerNode = node}/>
      </div>
    );
  }
}

let loadGbrowseScripts = lodash.once(() => {
  return $.getScript('/gbrowse/apiGBrowsePopups.js');
});
