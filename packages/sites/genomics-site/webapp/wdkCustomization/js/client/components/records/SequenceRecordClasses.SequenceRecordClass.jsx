import React from 'react';
let { ComponentUtils } = Wdk.client;

export function RecordAttributionSection(props) {
  return (
    <div>
      <h3>Record Attribution</h3>
      {ComponentUtils.renderAttributeValue(props.record.attributes.description)}
    </div>
  )
}

