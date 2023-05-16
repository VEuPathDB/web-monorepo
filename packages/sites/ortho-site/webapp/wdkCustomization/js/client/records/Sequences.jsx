import lodash from 'lodash';
import React, { useMemo, useRef } from 'react';

// function RecordTable_TaxonCounts({ value }: WrappedComponentProps<RecordTableProps>) {
export function RecordTable_Sequences(props) {
  const formRef = useRef(null);

  function toggleAll(checked) {
    const node = formRef.current;
    if (node == null) return;
    for (const input of node.querySelectorAll('input[name="msa_full_ids"]')) {
      input.checked = checked;
    }
  }

  const sortedValue = useSortedValue(props.value);

  return (
    <form
      ref={formRef}
      action="/cgi-bin/msaOrthoMCL"
      target="_blank"
      method="post"
    >
      <input type="hidden" name="project_id" value="OrthoMCL" />

      <props.DefaultComponent {...props} value={sortedValue} />
      <input
        type="button"
        name="CheckAll"
        value="Check All"
        onClick={() => toggleAll(true)}
      />
      <input
        type="button"
        name="UnCheckAll"
        value="Uncheck All"
        onClick={() => toggleAll(false)}
      />
      <br />
      <p>
        Please note: selecting a large number of proteins will take several
        minutes to align.
      </p>
      <div id="userOptions">
        <p>
          Output format: &nbsp;
          <select name="clustalOutFormat">
            <option value="clu">Mismatches highlighted</option>
            <option value="fasta">FASTA</option>
            <option value="phy">PHYLIP</option>
            <option value="st">STOCKHOLM</option>
            <option value="vie">VIENNA</option>
          </select>
        </p>
        <input type="submit" value="Run Clustal Omega for selected proteins" />
      </div>
    </form>
  );
}

function useSortedValue(value) {
  return useMemo(() => lodash.sortBy(value, 'sort_key'), [value]);
}
