import React, { useEffect, useMemo, useState } from 'react';
import TreeTable from '@veupathdb/components/lib/components/tidytree/TreeTable';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { useOrthoService } from 'ortho-client/hooks/orthoService';
import {
  Loading,
  RealTimeSearchBox,
} from '@veupathdb/wdk-client/lib/Components';
import { Branch, parseNewick } from 'patristic';
import {
  AttributeValue,
  TableValue,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { groupBy, difference } from 'lodash';
import { PfamDomainArchitecture } from 'ortho-client/components/pfam-domains/PfamDomainArchitecture';
import { extractPfamDomain } from 'ortho-client/records/utils';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { RowCounter } from '@veupathdb/coreui/lib/components/Mesa';
import { PfamDomain } from 'ortho-client/components/pfam-domains/PfamDomain';
import { FloatingButton, SelectList, Undo } from '@veupathdb/coreui';
import { RecordTable_TaxonCounts_Filter } from './RecordTable_TaxonCounts_Filter';
import { css, cx } from '@emotion/css';
import { formatAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

type RowType = Record<string, AttributeValue>;

const treeWidth = 200;
const maxColumnWidth = 200;
const maxArchitectureLength = maxColumnWidth - 10 - 10 - 1; // 10px padding each side plus a 1px border
const MIN_SEQUENCES_FOR_TREE = 3;
const MAX_SEQUENCES_FOR_TREE = 9999;

const highlightColor = '#feb640';
const highlightColor50 = highlightColor + '7f';

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const [searchQuery, setSearchQuery] = useState('');
  const safeSearchRegexp = useMemo(
    () => createSafeSearchRegExp(searchQuery),
    [searchQuery]
  );

  const [resetCounter, setResetCounter] = useState(0); // used for forcing re-render of filter buttons
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [pfamFilterIds, setPfamFilterIds] = useState<string[]>([]);
  const [corePeripheralFilterValue, setCorePeripheralFilterValue] = useState<
    ('core' | 'peripheral')[]
  >([]);

  const groupName = props.record.id.find(
    ({ name }) => name === 'group_name'
  )?.value;

  if (!groupName) {
    throw new Error('groupName is required but was not found in the record.');
  }

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  const mesaColumns: MesaColumn<RowType>[] = props.table.attributes
    .map(({ name, displayName, type }) => ({
      key: name,
      name: displayName,
      type: type === 'link' ? 'wdkLink' : type,
    }))
    // and remove a raw HTML checkbox field - we'll use Mesa's built-in checkboxes for this
    // and an object-laden 'sequence_link' field - the ID seems to be replicated in the full_id field
    .filter(
      ({ key }) =>
        key !== 'clustalInput' && key !== 'full_id' && key !== 'taxon_abbrev'
    )
    // rename some headings (shouldn't this be done on the back end?)
    .map((column) => ({
      ...column,
      name: column.name === 'Taxon' ? 'Clade' : column.name,
    }));

  const mesaRows = props.value;
  const pfamRows = props.record.tables['PFams'];

  const numSequences = mesaRows.length;

  const treeResponse = useOrthoService(
    numSequences >= MIN_SEQUENCES_FOR_TREE &&
      numSequences <= MAX_SEQUENCES_FOR_TREE
      ? (orthoService) => orthoService.getGroupTree(groupName)
      : () => Promise.resolve(undefined), // avoid making a request we know will fail and cause a "We're sorry, something went wrong." modal
    [groupName, numSequences]
  );

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

  const pfamIdToDescription = useMemo(
    () =>
      pfamRows.reduce((map, row) => {
        const pfamId = row.accession as string;
        const description = row.description as string;
        return map.set(pfamId, description);
      }, new Map<string, string>()),
    [pfamRows]
  );

  const maxProteinLength = useMemo(
    () =>
      mesaRows.reduce((max, row) => {
        const length = Number(row['length'] || ('0' as string));
        return length > max ? length : max;
      }, 0),
    [mesaRows]
  );

  mesaColumns.unshift({
    key: 'pfamArchitecture',
    name: 'Domain architecture',
    renderCell: (cellProps) => {
      const proteinId = cellProps.row.full_id as string;
      const flatPfamData = rowsByAccession[proteinId];
      if (flatPfamData && flatPfamData.length > 0) {
        const pfamDomains = flatPfamData.flatMap(extractPfamDomain);
        const proteinLength = Number(
          flatPfamData[0]['protein_length'] as string
        );
        const architectureLength = Math.floor(
          (maxArchitectureLength * proteinLength) / maxProteinLength
        );
        return (
          <PfamDomainArchitecture
            style={{ width: `${architectureLength}px`, top: '10px' }}
            length={proteinLength}
            domains={pfamDomains}
            pfamDescriptions={pfamIdToDescription}
          />
        );
      } else {
        return <span>no PFAM domains</span>;
      }
    },
  });

  // parse the tree and other expensive processing asynchronously
  const [tree, setTree] = useState<Branch>();
  const [leaves, setLeaves] = useState<Branch[]>();
  // default unsorted `sortedRows`!
  const [sortedRows, setSortedRows] = useState<TableValue>(mesaRows);

  useEffect(() => {
    if (!treeResponse) return;

    let isMounted = true;

    const fetchTree = async () => {
      try {
        // TO DO: these do not actually "do stuff in the background"
        const parsedTree = await parseNewickAsync(treeResponse.newick);
        const leaves = await getLeavesAsync(parsedTree);
        const sortedRows = await sortRowsAsync(leaves, mesaRows);
        if (isMounted) {
          setTree(parsedTree);
          setLeaves(leaves);
          setSortedRows(sortedRows);
        }
      } catch (error) {
        console.error('Error parsing Newick:', error);
      }
    };

    fetchTree();

    return () => {
      isMounted = false;
    };
  }, [treeResponse, mesaRows]);

  // do some validation on the tree w.r.t. the table

  // filter the rows of the table based on
  // 1. user-entered text search
  // 2. core-peripheral radio button
  // 3. checked boxes in the Pfam legend
  const filteredRows = useMemo(() => {
    if (
      searchQuery !== '' ||
      corePeripheralFilterValue != null ||
      pfamFilterIds.length > 0 ||
      selectedSpecies.length > 0
    ) {
      return sortedRows?.filter((row) => {
        const rowCorePeripheral = (
          (row['core_peripheral'] as string) ?? ''
        ).toLowerCase();
        const rowFullId = row['full_id'] as string;
        const rowPfamIdsSet = accessionToPfamIds.get(rowFullId);

        const searchMatch =
          searchQuery === '' || rowMatch(row, safeSearchRegexp);
        const corePeripheralMatch =
          corePeripheralFilterValue.length === 0 ||
          corePeripheralFilterValue.includes(
            rowCorePeripheral.toLowerCase() as any
          );
        const pfamIdMatch =
          pfamFilterIds.length === 0 ||
          pfamFilterIds.some((pfamId) => rowPfamIdsSet?.has(pfamId));
        const speciesMatch =
          selectedSpecies.length === 0 ||
          selectedSpecies.some((specie) => row.taxon_abbrev === specie);

        return (
          searchMatch && corePeripheralMatch && pfamIdMatch && speciesMatch
        );
      });
    }
    return undefined;
  }, [
    searchQuery,
    safeSearchRegexp,
    sortedRows,
    corePeripheralFilterValue,
    accessionToPfamIds,
    pfamFilterIds,
    selectedSpecies,
  ]);

  // now filter the tree if needed - takes a couple of seconds for large trees
  const filteredTree = useMemo(() => {
    if (leaves == null || tree == null || filteredRows?.length === 0) return;

    if (filteredRows != null && filteredRows.length < leaves.length) {
      const filteredRowIds = new Set(
        filteredRows.map(({ full_id }) => full_id as string)
      );

      // must work on a copy of the tree because it's destructive
      const treeCopy = tree.clone();
      let leavesRemoved = false;
      do {
        const leavesCopy = treeCopy.getLeaves();
        leavesRemoved = false; // Reset flag for each iteration

        leavesCopy.forEach((leaf) => {
          if (!filteredRowIds.has(leaf.id)) {
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

  if (
    !sortedRows ||
    (numSequences >= MIN_SEQUENCES_FOR_TREE &&
      numSequences <= MAX_SEQUENCES_FOR_TREE &&
      (tree == null || treeResponse == null))
  ) {
    return (
      <>
        <div>Loading...</div>
        <Loading />
      </>
    ); // The loading spinner does not show :-(
  }

  if (
    mesaRows != null &&
    sortedRows != null &&
    mesaRows.length !== sortedRows.length
  ) {
    console.log(
      'Tree and protein list mismatch. A=Tree, B=Table. Summary below:'
    );
    logIdMismatches(
      (leaves ?? []).map((leaf) => leaf.id),
      mesaRows.map((row) =>
        truncate_full_id_for_tree_comparison(row.full_id as string)
      )
    );
    return (
      <Banner
        banner={{
          type: 'warning',
          message:
            'Tree and protein list mismatch. Please contact the helpdesk',
        }}
      />
    );
  }

  const highlightedRowClassName = cx(
    css`
      & td {
        background-color: ${highlightColor50} !important;
      }
    `
  );

  const mesaState: MesaStateProps<RowType> = {
    options: {
      isRowSelected: (row: RowType) =>
        highlightedNodes.includes(row.full_id as string),
      deriveRowClassName: (row: RowType) =>
        highlightedNodes.includes(row.full_id as string)
          ? highlightedRowClassName
          : undefined,
    },
    uiState: {},
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
    highlightColor,
    highlightedNodeIds: highlightedNodes,
  };

  const rowHeight = 45;
  const clustalDisabled =
    highlightedNodes == null || highlightedNodes.length < 2;

  const rowCount = (filteredRows ?? sortedRows).length;

  const pfamFilter = pfamRows.length > 0 && (
    <SelectList
      key={`pfamFilter-${resetCounter}`}
      defaultButtonDisplayContent="Pfam domains"
      items={pfamRows.map((row) => ({
        display: (
          <div
            style={{
              display: 'flex',
              margin: '.25em 0',
              alignItems: 'center',
              gap: '1em',
              verticalAlign: 'middle',
              width: '100%',
            }}
          >
            <PfamDomain
              style={{ width: 100 }}
              pfamId={row.accession as string}
            />
            <div>{formatAttributeValue(row.accession)}</div>
            <div>{formatAttributeValue(row.description)}</div>
            <div style={{ marginLeft: 'auto' }}>
              {formatAttributeValue(row.num_proteins)} proteins
            </div>
          </div>
        ),
        value: formatAttributeValue(row.accession),
      }))}
      value={pfamFilterIds}
      onChange={setPfamFilterIds}
      instantUpdate={true}
    />
  );

  const corePeripheralFilter = (
    <SelectList
      key={`corePeripheralFilter-${resetCounter}`}
      defaultButtonDisplayContent="Core/Peripheral"
      items={[
        {
          display: 'Core',
          value: 'core',
        },
        {
          display: 'Peripheral',
          value: 'peripheral',
        },
      ]}
      value={corePeripheralFilterValue}
      onChange={setCorePeripheralFilterValue}
      instantUpdate={true}
    />
  );

  const taxonFilter =
    props.record.tables.TaxonCounts?.length > 0 ? (
      <RecordTable_TaxonCounts_Filter
        key={`taxonFilter-${resetCounter}`}
        selectedSpecies={selectedSpecies}
        onSpeciesSelected={setSelectedSpecies}
        record={props.record}
        recordClass={props.recordClass}
        table={props.recordClass.tablesMap.TaxonCounts}
        value={props.record.tables.TaxonCounts}
        DefaultComponent={props.DefaultComponent}
      />
    ) : null;

  const resetButton = (
    <FloatingButton
      text={''}
      ariaLabel={'Reset filters'}
      tooltip={'Reset filters'}
      disabled={
        pfamFilterIds.length +
          corePeripheralFilterValue.length +
          selectedSpecies.length ===
        0
      }
      icon={Undo}
      size={'medium'}
      themeRole={'primary'}
      onPress={() => {
        setPfamFilterIds([]);
        setCorePeripheralFilterValue([]);
        setSelectedSpecies([]);
        setResetCounter((prev) => prev + 1);
      }}
    />
  );

  return (
    <>
      {numSequences > MAX_SEQUENCES_FOR_TREE && (
        <div>
          <strong>
            Note: no phylogenetic tree is displayed because this group has more
            than {MAX_SEQUENCES_FOR_TREE.toLocaleString()} sequences.
          </strong>
        </div>
      )}
      <div
        style={{
          padding: '10px',
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
        <div className="MesaComponent">
          <div className="TableToolbar-Info">
            <RowCounter
              rows={sortedRows}
              uiState={{
                filteredRowCount: numSequences - rowCount, // num rows filtered **away**
              }}
              eventHandlers={{}}
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1em',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
          }}
        >
          <strong>Filters: </strong>
          {pfamFilter}
          {corePeripheralFilter}
          {taxonFilter}
          {resetButton}
        </div>
      </div>
      <TreeTable
        rowHeight={rowHeight}
        treeProps={treeProps}
        tableProps={mesaState}
        hideTree={!finalNewick}
        maxColumnWidth={maxColumnWidth}
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

function logIdMismatches(A: string[], B: string[]) {
  const inAButNotB = difference(A, B);
  const inBButNotA = difference(B, A);

  console.log(`Total unique IDs in A: ${new Set(A).size}`);
  console.log(`Total unique IDs in B: ${new Set(B).size}`);

  console.log(`Number of IDs in A but not in B: ${inAButNotB.length}`);
  console.log(
    `First few IDs in A but not in B: ${inAButNotB.slice(0, 5).join(', ')}`
  );

  console.log(`Number of IDs in B but not in A: ${inBButNotA.length}`);
  console.log(
    `First few IDs in B but not in A: ${inBButNotA.slice(0, 5).join(', ')}`
  );
}

function truncate_full_id_for_tree_comparison(full_id: string): string {
  const truncated_id = (full_id as string).split(':')[0];
  return truncated_id;
}

async function parseNewickAsync(treeResponse: string): Promise<Branch> {
  return new Promise((resolve) => {
    const result = parseNewick(treeResponse);
    resolve(result);
  });
}

async function getLeavesAsync(tree: Branch): Promise<Branch[]> {
  return new Promise((resolve) => {
    const result = tree.getLeaves();
    resolve(result);
  });
}

async function sortRowsAsync(
  leaves: Branch[],
  mesaRows: TableValue
): Promise<TableValue> {
  if (leaves == null) return mesaRows;

  return new Promise((resolve) => {
    // Some full_ids end in :RNA
    // However, the Newick files seem to be omitting the colon and everything following it.
    // (Colons are part of Newick format.)
    // So we remove anything after a ':' and hope it works!
    // This is the only place where we use the IDs from the tree file.

    // make a map for performance
    const rowMap = new Map(
      mesaRows.map((row) => [
        truncate_full_id_for_tree_comparison(row.full_id as string),
        row,
      ])
    );

    const result = leaves
      .map(({ id }) => rowMap.get(id))
      .filter((row): row is RowType => row != null);

    resolve(result);
  });
}
