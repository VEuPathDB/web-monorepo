import React from 'react';
import * as Gbrowse from '../common/Gbrowse';

let { ComponentUtils } = Wdk.client;

export function RecordAttributionSection(props) {
  return (
    <div>
      <h3>Record Attribution</h3>
      {ComponentUtils.renderAttributeValue(props.record.attributes.description)}
    </div>
  )
}

export function RecordAttribute(props) {
    let context = Gbrowse.contexts.find(context => context.gbrowse_url === props.name);
    if (context != null) {
      return ( <Gbrowse.GbrowseContext {...props} context={context} /> );
  }

  return ( <props.DefaultComponent {...props}/> );
}

