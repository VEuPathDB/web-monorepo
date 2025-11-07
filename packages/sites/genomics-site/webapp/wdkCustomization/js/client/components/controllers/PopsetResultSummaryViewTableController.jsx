import React from 'react';
import { projectId } from '../../config';
import { ResultTableSummaryViewPlugin } from '@veupathdb/wdk-client/lib/Plugins';
import { ClustalAlignmentForm } from '@veupathdb/web-common/lib/components';

const buttonHelp = `Please select at least two isolates to run Clustal Omega. Note: only isolates from a single page will be aligned.
The result is an alignment of the locus that was used to type the isolates.
(Increase the 'Rows per page' to increase the number that can be aligned).`;

export default ResultTableSummaryViewPlugin.withOptions({
  tableActions: [
    {
      element: (selectedRecords) => (
        <ClustalAlignmentForm
          action="/cgi-bin/isolateAlignment"
          sequenceCount={selectedRecords.length}
          sequenceType="isolates"
        >
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="type" />
          <input type="hidden" name="sid" />
          <input type="hidden" name="start" />
          <input type="hidden" name="end" />
          <input
            type="hidden"
            name="isolate_ids"
            value={selectedRecords
              .map((record) => record.attributes.primary_key)
              .join(',')}
          />
          <button
            className="btn"
            disabled={selectedRecords.length < 2}
            title={
              selectedRecords.length < 2
                ? buttonHelp
                : 'Run Clustal Omega alignment'
            }
          >
            Run Clustal Omega
          </button>
        </ClustalAlignmentForm>
      ),
    },
  ],
});
