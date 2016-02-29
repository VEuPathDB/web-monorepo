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
];


let gbrowseScripts = [ '/gbrowse/apiGBrowsePopups.js', '/gbrowse/wz_tooltip.js' ]

let injectScripts = lodash.once(function injectScripts() {
  for (let scriptUrl of gbrowseScripts) {
    let script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);
  }
});

export class GbrowseContext extends ComponentUtils.PureComponent {

  constructor(...args) {
    super(...args);
    this.state = { isCollapsed: true };
    this.style = { display: 'block', width: '100%' };

    this.updateCollapsed = isCollapsed => {
      this.setState({ isCollapsed });
    };
  }

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
        style={this.style}
        headerContent={this.props.displayName}
        isCollapsed={this.state.isCollapsed}
        onCollapsedChange={this.updateCollapsed}
      >
        <RemoteContent url={iframeUrl} onLoad={injectScripts} />
      </CollapsibleSection>
    );
  }

}

export function ProteinContext(props) {
  let url = props.rowData.ProteinPbrowseUrl;
  let divId = props.table.name + "-" + props.rowData.transcript_id

  return (
    <div id={divId}>
      <RemoteContent url={`${url};width=800;embed=1;genepage=1`} />
    </div>
  );
}
