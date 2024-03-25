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
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import Mesa from '../../../../../../../libs/coreui/lib/components/Mesa';
import { PfamDomain } from 'ortho-client/components/pfam-domains/PfamDomain';

type RowType = Record<string, AttributeValue>;
const CorePeripheralFilterStates = ['both', 'core', 'peripheral'] as const;
type CorePeripheralFilterState = typeof CorePeripheralFilterStates[number];

const CorePeripheralFilterStateLabels: Record<
  CorePeripheralFilterState,
  string
> = {
  both: 'Core & Peripheral',
  core: 'Core only',
  peripheral: 'Peripheral only',
};

const treeWidth = 200;

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const [searchQuery, setSearchQuery] = useState('');
  const safeSearchRegexp = useMemo(
    () => createSafeSearchRegExp(searchQuery),
    [searchQuery]
  );

  const [corePeripheralFilterState, setCorePeripheralFilterState] =
    useState<CorePeripheralFilterState>('both');

  const [pfamFilterIds, setPfamFilterIds] = useState<string[]>([]);

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

  const accessionToPfamIds = useMemo(
    () =>
      proteinPfams.reduce((map, row) => {
        const full_id = row['full_id'] as string;
        if (!map.has(full_id)) map.set(full_id, new Set<string>());
        map.set(full_id, map.get(full_id)!.add(row['accession'] as string));
        return map;
      }, new Map<string, Set<string>>()),
    [proteinPfams]
  );

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
      searchQuery !== '' || corePeripheralFilterState !== 'both'
        ? sortedRows?.filter(
            (row) =>
              (searchQuery === '' || rowMatch(row, safeSearchRegexp)) &&
              (corePeripheralFilterState === 'both' ||
                ((row['core_peripheral'] as string) ?? '').toLowerCase() ===
                  (corePeripheralFilterState as string))
          )
        : undefined,
    [searchQuery, safeSearchRegexp, sortedRows, corePeripheralFilterState]
  );

  // now filter the tree if needed.
  const filteredTree = useMemo(() => {
    if (leaves == null || tree == null || filteredRows?.length === 0) return;

    if (filteredRows != null && filteredRows.length < leaves.length) {
      // must work on a copy of the tree because it's destructive
      const treeCopy = tree.clone();
      let leavesRemoved = false;

      do {
        const leavesCopy = treeCopy.getLeaves();
        leavesRemoved = false; // Reset flag for each iteration

        leavesCopy.forEach((leaf) => {
          if (!filteredRows.find(({ full_id }) => full_id === leaf.id)) {
            leaf.remove(true); // remove leaf and remove any dangling ancestors
            leavesRemoved = true; // A leaf was removed, so set flag to true
          }
        });
      } while (leavesRemoved); // Continue looping if any leaf was removed

      return treeCopy;
    }
    return tree;
  }, [tree, leaves, filteredRows]);

  // make a newick string from the filtered tree if needed
  const finalNewick = useMemo(() => {
    if (filteredTree === tree && treeResponse != null) {
      return treeResponse.newick; // no filtering so return what we read from the back end
    } else if (
      filteredTree != null &&
      filteredRows != null &&
      filteredRows.length > 0
    ) {
      return filteredTree.toNewick(); // make new newick data from the filtered tree
    } else return;
  }, [filteredTree, treeResponse, tree, filteredRows]);

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
    data: finalNewick,
    width: treeWidth,
    highlightMode: 'monophyletic' as const,
    highlightedNodeIds: highlightedNodes,
  };

  const rowHeight = 45;
  const clustalDisabled =
    highlightedNodes == null || highlightedNodes.length < 2;

  const pfamMesaState = {
    options: {
      isRowSelected: (row: RowType) =>
        pfamFilterIds.includes(row.accession as string),
    },
    rows: props.record.tables['PFams'],
    columns: [
      {
        key: 'accession',
        name: 'PFam accession',
      },
      {
        key: 'symbol',
        name: 'Symbol',
      },
      {
        key: 'description',
        name: 'Description',
      },
      {
        key: 'num_proteins',
        name: 'Count',
        helpText: 'Number of proteins that contain this domain',
      },
      {
        key: 'legend',
        name: 'Legend',
        renderCell: (cellProps: { row: RowType }) => {
          const pfamId = cellProps.row.accession as string;
          const symbol = cellProps.row.symbol as string;
          return <PfamDomain pfamId={pfamId} title={`${pfamId} (${symbol})`} />;
        },
      },
    ],
    eventHandlers: {
      onRowSelect: (row: RowType) =>
        setPfamFilterIds((prev) => [...prev, row.accession as string]),
      onRowDeselect: (row: RowType) =>
        setPfamFilterIds((prev) => prev.filter((id) => id !== row.accession)),
    },
  };

  return (
    <>
      <div
        style={{
          marginLeft: treeWidth,
          display: 'flex',
          flexDirection: 'row-reverse',
        }}
      >
        <Mesa state={pfamMesaState} />
      </div>
      <div
        style={{
          marginLeft: treeWidth,
          padding: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <RealTimeSearchBox
          searchTerm={searchQuery}
          onSearchTermChange={setSearchQuery}
          delayMs={0}
          className="wdk-RecordFilterSearchBox"
          placeholderText="Search this table..."
        />
        <RadioButtonGroup
          options={[...CorePeripheralFilterStates]}
          optionLabels={CorePeripheralFilterStates.map(
            (s) => CorePeripheralFilterStateLabels[s]
          )}
          selectedOption={corePeripheralFilterState}
          onOptionSelected={(newOption: string) =>
            setCorePeripheralFilterState(newOption as CorePeripheralFilterState)
          }
          capitalizeLabels={false}
        />
      </div>
      <TreeTable
        rowHeight={rowHeight}
        treeProps={treeProps}
        tableProps={mesaState}
        hideTree={!finalNewick}
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
