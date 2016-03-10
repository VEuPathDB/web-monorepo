import React from 'react';
import lodash from 'lodash';
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
    return (
      <CollapsibleSection
        id={this.props.name}
        className="eupathdb-GbrowseContext"
        style={this.style}
        headerContent={this.props.displayName}
        isCollapsed={this.state.isCollapsed}
        onCollapsedChange={this.updateCollapsed}
      >
        <iframe src={iframeUrl} onLoad={gbrowseOnLoad} height="500"/>
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

  return (
    <div id={divId}>
      <iframe src={`${url};width=800;embed=1;genepage=1`} onLoad={pbrowseOnLoad} height="500"/>
    </div>
  );
}

let gbrowseScripts = [ '/gbrowse/apiGBrowsePopups.js', '/gbrowse/wz_tooltip.js' ];

function gbrowseOnLoad(event) {
  let iframe = event.target;
  setBaseTarget(iframe);
  injectGbrowseScripts(iframe);
  resizeIframe(iframe);
}

function pbrowseOnLoad(event) {
  let iframe = event.target;
  setBaseTarget(iframe);
  resizeIframe(iframe);
}

function injectGbrowseScripts(iframe) {
  let gbrowseWindow = iframe.contentWindow.window;
  let gbrowseDocumentBody = iframe.contentWindow.document.body;

  gbrowseWindow.wdk = wdk;
  gbrowseWindow.jQuery = jQuery;

  for (let scriptUrl of gbrowseScripts) {
    let script = document.createElement('script');
    script.src = scriptUrl;
    gbrowseDocumentBody.appendChild(script);
  }
}

function resizeIframe(iframe) {
  let height = Math.max(500, iframe.contentWindow.document.body.scrollHeight + 20);
  iframe.style.height = height + 'px';
}

function setBaseTarget(iframe) {
  let base = iframe.contentDocument.querySelector('base');
  if (base == null) {
    base = document.createElement('base');
    iframe.contentDocument.head.appendChild(base);
  }
  base.target = '_top';
}
