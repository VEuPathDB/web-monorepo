import React from 'react';
import { projectId } from '../../config';
import { ResultTableSummaryViewPlugin } from '@veupathdb/wdk-client/lib/Plugins';

const title =
`Please select at least two isolates to run Clustal Omega. Note: only isolates from a single page will be aligned. 
The result is an alignment of the locus that was used to type the isolates.
(Increase the 'Rows per page' to increase the number that can be aligned).`;


export default ResultTableSummaryViewPlugin.withOptions({
  tableActions: [
    {
      element: (selectedRecords) => (
        <form action="/cgi-bin/isolateAlignment" target="_blank" method="post">
          <input type="hidden" name="project_id" value={projectId}/>
          <input type="hidden" name="type"/>
          <input type="hidden" name="sid"/>
          <input type="hidden" name="start"/>
          <input type="hidden" name="end"/>
          <input type="hidden" name="isolate_ids" value={selectedRecords.map(record => record.attributes.primary_key).join(',')}/>
          <button
            className="btn"
            disabled={selectedRecords.length < 2}
            title={title}
          >Run Clustal Omega</button>
        </form>
      )
    }
  ]
});
