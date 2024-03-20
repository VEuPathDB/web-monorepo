import React, { useState } from 'react';
import TreeTable from '@veupathdb/components/lib/components/tidytree/TreeTable';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { useOrthoService } from 'ortho-client/hooks/orthoService';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { parseNewick } from 'patristic';
import { AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { MesaColumn } from '../../../../../../../libs/coreui/lib/components/Mesa/types';
import { groupBy } from 'lodash';
import { PfamDomainArchitecture } from 'ortho-client/components/pfam-domains/PfamDomainArchitecture';
import { extractPfamDomain } from 'ortho-client/records/utils';

type RowType = Record<string, AttributeValue>;

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const [searchQuery, setSearchQuery] = useState('');

  const groupName = props.record.id.find(
    ({ name }) => name === 'group_name'
  )?.value;

  if (!groupName) {
    throw new Error('groupName is required but was not found in the record.');
  }

  const treeResponse = useOrthoService(
    (orthoService) => orthoService.getGroupTree(groupName),
    [groupName]
  );

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  const mesaColumns: MesaColumn<RowType>[] = props.table.attributes
    .map(({ name, displayName }) => ({
      key: name,
      name: displayName,
    }))
    // and remove a raw HTML checkbox field - we'll use Mesa's built-in checkboxes for this
    // and an object-laden 'sequence_link' field - the ID seems to be replicated in the full_id field
    .filter(({ key }) => key !== 'clustalInput' && key !== 'sequence_link');

  const mesaRows = props.value;

  // deal with Pfam domain architectures
  const proteinPfams = props.record.tables['ProteinPFams'];
  const rowsByAccession = groupBy(proteinPfams, 'full_id');

  //  const maxLength = useMemo(
  //    () => mesaRows.reduce(
  //      (max, current) => {
  //	const length = Number(current['protein_length']);
  //	return length > max ? length : max;
  //      }, 0)
  //  , [ mesaRows ]);

  mesaColumns.unshift({
    key: 'pfamArchitecture',
    name: 'Domain architecture (all drawn to 100% length)',
    renderCell: (cellProps) => {
      const proteinId = cellProps.row.full_id as string;
      const flatPfamData = rowsByAccession[proteinId];
      if (flatPfamData && flatPfamData.length > 0) {
        const pfamDomains = flatPfamData.flatMap(extractPfamDomain);
        const proteinLength = Number(
          flatPfamData[0]['protein_length'] as string
        );
        return (
          <PfamDomainArchitecture
            style={{ width: '150px', top: '10px' }}
            length={proteinLength}
            domains={pfamDomains}
          />
        );
      } else {
        return <span>no PFAM domains</span>;
      }
    },
  });

  if (treeResponse == null) return <Loading />;

  // do some validation on the tree w.r.t. the table

  // should this be async? it's potentially expensive
  const tree = parseNewick(treeResponse.newick);
  const leaves = tree.getLeaves();

  // sort the table in the same order as the tree's leaves
  const sortedRows = leaves
    .map(({ id }) => mesaRows.find(({ full_id }) => full_id === id))
    .filter((row): row is RowType => row != null);

  const filteredRows =
    searchQuery !== ''
      ? sortedRows.filter((row) =>
          (row.description as string).match(new RegExp(searchQuery, 'i'))
        )
      : undefined;

  if (leaves.length !== sortedRows.length)
    return (
      <div>Tree and protein list mismatch, please contact the helpdesk</div>
    );

  const mesaState = {
    options: {
      isRowSelected: (row: RowType) =>
        highlightedNodes.includes(row.full_id as string),
      toolbar: true,
      searchPlaceholder:
        'Type to filter the table. (Description column only at the moment!!) The tree will not be shown while filtering.',
    },
    uiState: {
      searchQuery,
    },
    rows: sortedRows,
    filteredRows,
    columns: mesaColumns,
    eventHandlers: {
      onRowSelect: (row: RowType) =>
        setHighlightedNodes((prev) => [...prev, row.full_id as string]),
      onRowDeselect: (row: RowType) =>
        setHighlightedNodes((prev) => prev.filter((id) => id !== row.full_id)),
      onSearch: (query: string) => {
        setSearchQuery(query);
      },
    },
  };

  const treeProps = {
    data: treeResponse.newick,
    width: 200,
    highlightMode: 'monophyletic' as const,
    highlightedNodeIds: highlightedNodes,
  };

  const rowHeight = 45;
  const clustalDisabled =
    highlightedNodes == null || highlightedNodes.length < 2;

  return (
    <>
      <TreeTable
        rowHeight={rowHeight}
        treeProps={treeProps}
        tableProps={mesaState}
        hideTree={!!filteredRows}
      />
      <form action="/cgi-bin/msaOrthoMCL" target="_blank" method="post">
        <input type="hidden" name="project_id" value="OrthoMCL" />
        {highlightedNodes.map((id) => (
          <input type="hidden" name="msa_full_ids" value={id} key={id} />
        ))}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="submit" disabled={clustalDisabled}>
              Run Clustal Omega for selected proteins
            </button>
            {clustalDisabled && (
              <span>(You must select at least two proteins.)</span>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
