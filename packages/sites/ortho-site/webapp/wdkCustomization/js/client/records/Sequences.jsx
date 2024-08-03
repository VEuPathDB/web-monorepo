import lodash from 'lodash';
import React, { useMemo, useRef, useState, useCallback } from 'react';

// function RecordTable_TaxonCounts({ value }: WrappedComponentProps<RecordTableProps>) {
export function RecordTable_Sequences(props) {
  const formRef = useRef(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const sortedValue = useSortedValue(props.value);

  const isRowSelected = useCallback(
    ({ full_id }) => selectedRowIds.includes(full_id),
    [selectedRowIds]
  );

  const onRowSelect = useCallback(
    ({ full_id }) => setSelectedRowIds(selectedRowIds.concat(full_id)),
    [selectedRowIds]
  );

  const onRowDeselect = useCallback(
    ({ full_id }) =>
      setSelectedRowIds(selectedRowIds.filter((id) => id !== full_id)),
    [selectedRowIds]
  );

  const onMultipleRowSelect = useCallback(
    (rows) =>
      setSelectedRowIds(
        selectedRowIds.concat(rows.map((row) => row['full_id']))
      ),
    [selectedRowIds]
  );

  const onMultipleRowDeselect = useCallback(
    (rows) =>
      setSelectedRowIds(
        selectedRowIds.filter((row) => rows.includes(row['full_id']))
      ),
    [selectedRowIds]
  );

  if (props.value.length === 0) {
    return <props.DefaultComponent {...props} value={sortedValue} />;
  } else {
    const orthoTableProps = {
      options: {
        isRowSelected,
        selectedNoun: 'protein',
        selectedPluralNoun: 'proteins',
      },
      eventHandlers: {
        onRowSelect,
        onRowDeselect,
        onMultipleRowSelect,
        onMultipleRowDeselect,
      },
      actions: [
        {
          selectionRequired: false,
          element() {
            return null;
          },
          callback: () => null,
        },
      ],
    };

    return (
      <form
        ref={formRef}
        action="/cgi-bin/msaOrthoMCL"
        target="_blank"
        method="post"
      >
        <input type="hidden" name="project_id" value="OrthoMCL" />
        {selectedRowIds.map((id) => (
          <input key={id} type="hidden" name="msa_full_ids" value={id} />
        ))}
        <props.DefaultComponent
          {...props}
          value={sortedValue}
          orthoTableProps={orthoTableProps}
        />
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
          <input
            type="submit"
            value="Run Clustal Omega for selected proteins"
          />
        </div>
      </form>
    );
  }
}

function useSortedValue(value) {
  return useMemo(() => lodash.sortBy(value, 'sort_key'), [value]);
}
