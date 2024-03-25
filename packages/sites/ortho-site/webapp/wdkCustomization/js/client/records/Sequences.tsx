import React, { useMemo, useState } from 'react';
import TreeTable from '@veupathdb/components/lib/components/tidytree/TreeTable';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { useOrthoService } from 'ortho-client/hooks/orthoService';
import {
  Loading,
  RealTimeSearchBox,
} from '@veupathdb/wdk-client/lib/Components';
import { parseNewick } from 'patristic';
import { AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { MesaColumn } from '../../../../../../../libs/coreui/lib/components/Mesa/types';
import { groupBy } from 'lodash';
import { PfamDomainArchitecture } from 'ortho-client/components/pfam-domains/PfamDomainArchitecture';
import { extractPfamDomain } from 'ortho-client/records/utils';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

type RowType = Record<string, AttributeValue>;

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const [searchQuery, setSearchQuery] = useState('');
  const safeSearchRegexp = useMemo(
    () => createSafeSearchRegExp(searchQuery),
    [searchQuery]
  );

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

  mesaColumns.unshift({
    key: 'pfamArchitecture',
    name: 'Domain architecture (all drawn to same length)',
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

  // do some validation on the tree w.r.t. the table

  // should this be async? it's potentially expensive
  const tree = useMemo(
    () => treeResponse && parseNewick(treeResponse.newick),
    [treeResponse]
  );
  const leaves = useMemo(() => tree?.getLeaves(), [tree]);

  // sort the table in the same order as the tree's leaves
  const sortedRows = useMemo(
    () =>
      leaves
        ?.map(({ id }) => mesaRows.find(({ full_id }) => full_id === id))
        .filter((row): row is RowType => row != null),
    [leaves, mesaRows]
  );

  // can't memoize this easily after the early return for null treeResponse above :-(
  const filteredRows = useMemo(
    () =>
      searchQuery !== ''
        ? sortedRows?.filter((row) => rowMatch(row, safeSearchRegexp))
        : undefined,
    [searchQuery, safeSearchRegexp, sortedRows]
  );

  if (treeResponse == null || leaves == null || sortedRows == null)
    return <Loading />;

  if (leaves?.length !== sortedRows?.length)
    return (
      <Banner
        banner={{
          type: 'warning',
          message:
            'Tree and protein list mismatch, please contact the helpdesk',
        }}
      />
    );

  const mesaState = {
    options: {
      isRowSelected: (row: RowType) =>
        highlightedNodes.includes(row.full_id as string),
    },
    rows: sortedRows,
    filteredRows,
    columns: mesaColumns,
    eventHandlers: {
      onRowSelect: (row: RowType) =>
        setHighlightedNodes((prev) => [...prev, row.full_id as string]),
      onRowDeselect: (row: RowType) =>
        setHighlightedNodes((prev) => prev.filter((id) => id !== row.full_id)),
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
      <RealTimeSearchBox
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        delayMs={0}
        className="wdk-RecordFilterSearchBox"
        placeholderText="Search this table..."
      />
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

function rowMatch(row: RowType, query: RegExp): boolean {
  return (
    Object.values(row).find((value) => {
      if (value != null) {
        if (typeof value === 'string') return value.match(query);
        else if (
          typeof value === 'object' &&
          'displayText' in value &&
          typeof value.displayText === 'string'
        )
          return value.displayText.match(query);
      }
      return false;
    }) !== undefined
  );
}

function createSafeSearchRegExp(input: string): RegExp {
  try {
    // Attempt to create a RegExp from the user input directly
    return new RegExp(input, 'i');
  } catch (error) {
    // If an error occurs (e.g., invalid RegExp), escape the input and create a literal search RegExp
    const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escapedInput, 'i');
  }
}
