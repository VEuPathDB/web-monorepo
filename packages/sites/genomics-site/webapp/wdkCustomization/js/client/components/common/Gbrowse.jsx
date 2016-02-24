import React from 'react';
import { Components } from 'wdk-client';

let { CollapsibleSection } = Components;

export let contexts = [
    {
        gbrowse_url: 'GeneModelGbrowseUrl',
        displayName: 'Gene Model',
        thumbnail: false
    },
    {
        gbrowse_url: 'SyntenyGbrowseUrl',
        displayName: 'Synteny',
        thumbnail: true
    },
    {
        gbrowse_url: 'SnpsGbrowseUrl',
        displayName: 'SNPs',
        thumbnail: true
    },
];

let gbrowseScripts = [ '/gbrowse/apiGBrowsePopups.js', '/gbrowse/wz_tooltip.js' ]

export let GbrowseContext = React.createClass({

  getInitialState() {
    return {
      isCollapsed: true
    };
  },

  render() {

      let gbrowseUrl = this.props.record.attributes[this.props.name];
  //    let lowerGeneId = source_id.toLowerCase();

    let queryParams = {
      width: 800,
      embed: 1,
  //    h_feat: `${lowerGeneId}@yellow`,
    };

    let queryParamString = Object.keys(queryParams).reduce((str, key) => `${str};${key}=${queryParams[key]}` , '');
        let iframeUrl = `${gbrowseUrl};${queryParamString}`;

    return (
      <CollapsibleSection
        id={this.props.name}
        className="eupathdb-GbrowseContext"
        style={{ display: 'block', width: '100%' }}
        headerContent={this.props.displayName}
        isCollapsed={this.state.isCollapsed}
        onCollapsedChange={isCollapsed => this.setState({ isCollapsed })}
      >
        <iframe src={iframeUrl} seamless style={{ width: '100%', border: 'none' }} onLoad={gbrowseOnload}/>
      </CollapsibleSection>
    );
  }

});

export function ProteinContext(props) {
    let url = props.rowData.ProteinPropsPbrowseUrl;
    let divId = "protein-features-" + props.rowData.transcript_id

  return (
      <div id={divId}>
      <strong>Protein Features</strong>
      <iframe
        src={`${url};width=800;embed=1;genepage=1`}
        seamless
        style={{ width: '100%', border: 'none' }}
        onLoad={resizeIframe}
      />
    </div>
  );
}

function gbrowseOnload(event) {
  let iframe = event.target;
  setBaseTarget(iframe);
  injectGbrowseScripts(iframe);
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
  iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 20 + 'px';
}

function setBaseTarget(iframe) {
  let base = iframe.contentDocument.querySelector('base');
  if (base == null) {
    base = document.createElement('base');
    iframe.contentDocument.head.appendChild(base);
  }
  base.target = '_top';
}
