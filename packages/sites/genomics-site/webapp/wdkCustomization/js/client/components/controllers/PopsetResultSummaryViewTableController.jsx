import { projectId } from '../../config';
import { ResultTableSummaryViewPlugin } from 'wdk-client/Plugins';

const title =
`Please select at least two isolates to run Clustal Omega. Note: only isolates from a single page will be aligned. 
The result is an alignment of the locus that was used to type the isolates.
(Increase the page size in 'Advanced Paging' to increase the number that can be aligned).`;


export default ResultTableSummaryViewPlugin.withTableActions([
  {
    element: (selectedRecords) => {
      const ids = selectedRecords
        .map(record => record.attributes.primary_key)
        .join(',');
      const href = `/cgi-bin/isolateAlignment?project_id=${projectId};type=undefined;sid=undefined;start=undefined;end=undefined;isolate_ids=${ids}`;
      return (
        <button
          type="button"
          className="btn"
          disabled={selectedRecords.length < 2}
          title={title}
          onClick={() => window.open(href, '_blank')}
        >Run Clustal Omega</button>
      );
    }
  }
]);
