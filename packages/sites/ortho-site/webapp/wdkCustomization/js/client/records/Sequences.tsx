import React, {
  CSSProperties,
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from 'react';
import TreeTable from '@veupathdb/components/lib/components/tidytree/TreeTable';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { useOrthoService } from 'ortho-client/hooks/orthoService';
import { Loading, Link } from '@veupathdb/wdk-client/lib/Components';
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
import PopoverButton, {
  PopoverButtonHandle,
} from '@veupathdb/coreui/lib/components/buttons/PopoverButton/PopoverButton';
import { PfamDomain } from 'ortho-client/components/pfam-domains/PfamDomain';
import {
  FilledButton,
  FloatingButton,
  NoteBox,
  OutlinedButton,
  SelectList,
  Undo,
  useDeferredState,
} from '@veupathdb/coreui';
import { RecordTable_TaxonCounts_Filter } from './RecordTable_TaxonCounts_Filter';
import { formatAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { RecordFilter } from '@veupathdb/wdk-client/lib/Views/Records/RecordTable/RecordFilter';
import {
  areTermsInStringRegexString,
  parseSearchQueryString,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

type RowType = Record<string, AttributeValue>;

const treeWidth = 200;
const maxColumnWidth = 200;
const maxArchitectureLength = maxColumnWidth - 10 - 10 - 1; // 10px padding each side plus a 1px border
const MIN_SEQUENCES_FOR_TREE = 3;
const MAX_SEQUENCES_FOR_TREE = 1000;

const PFAM_ARCH_COLUMN_KEY = 'pfamArchitecture';

const highlightColor = '#feb640';
const highlightColor50 = highlightColor + '7f';

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const [searchQuery, setSearchQuery] = useState('');
  const safeSearchRegexp = useDeferredValue(
    useMemo(() => createSafeSearchRegExp(searchQuery), [searchQuery])
  );

  const [resetCounter, setResetCounter] = useState(0); // used for forcing re-render of filter buttons

  const [proteinFilterIds, setProteinFilterIds, volatileProteinFilterIds] =
    useDeferredState<string[]>([]);

  const [selectedSpecies, setSelectedSpecies, volatileSelectedSpecies] =
    useDeferredState<string[]>([]);

  const [pfamFilterIds, setPfamFilterIds, volatilePfamFilterIds] =
    useDeferredState<string[]>([]);

  const [
    corePeripheralFilterValue,
    setCorePeripheralFilterValue,
    volatileCorePeripheralFilterValue,
  ] = useDeferredState<('core' | 'peripheral')[]>([]);

  const groupName = props.record.id.find(
    ({ name }) => name === 'group_name'
  )?.value;

  if (!groupName) {
    throw new Error('groupName is required but was not found in the record.');
  }

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  const mesaRows = props.value;
  const pfamRows = props.record.tables['PFams'];

  const numSequences = mesaRows.length;

  const treeResponse = useOrthoService(
    (orthoService) => {
      if (numSequences < MIN_SEQUENCES_FOR_TREE)
        return Promise.resolve(undefined);
      return orthoService.getGroupTree(groupName);
    },
    [groupName, numSequences]
  );

  const treeUrl = useOrthoService(
    async (orthoService) => orthoService.getGroupTreeUrl(groupName),
    [groupName]
  );

  // deal with Pfam domain architectures
  const proteinPfams = props.record.tables['ProteinPFams'];
  const rowsByAccession = useMemo(
    () => groupBy(proteinPfams, 'full_id'),
    [proteinPfams]
  );

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

  const mesaColumns = useMemo((): MesaColumn<RowType>[] => {
    const mesaColumnsFromAttrs: MesaColumn<RowType>[] = props.table.attributes
      .filter(({ isDisplayable }) => isDisplayable)
      .map(({ name, displayName, type }) => ({
        key: name,
        name: displayName,
        type: type === 'link' ? 'wdkLink' : type,
      }));

    return [
      {
        key: PFAM_ARCH_COLUMN_KEY,
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
      },
      ...mesaColumnsFromAttrs,
    ];
  }, [
    maxProteinLength,
    pfamIdToDescription,
    props.table.attributes,
    rowsByAccession,
  ]);

  const [tablePageNumber, setTablePageNumber] = useState(1);

  const { tree, leaves, sortedRows } = useMemo(() => {
    const tree = treeResponse == null ? undefined : parseNewick(treeResponse);
    const leaves = tree && getLeaves(tree);
    const sortedRows = leaves ? sortRows(leaves, mesaRows) : mesaRows;
    return { tree, leaves, sortedRows };
  }, [treeResponse, mesaRows]);

  // do some validation on the tree w.r.t. the table

  // filter the rows of the table based on
  // 1. user-entered text search
  // 2. core-peripheral radio button
  // 3. checked boxes in the Pfam legend

  const [
    selectedColumnFilters,
    setSelectedColumnFilters,
    volatileSelectedColumnFilters,
  ] = useDeferredState<string[]>([]);

  const filteredRows = useMemo(() => {
    if (
      safeSearchRegexp != null ||
      corePeripheralFilterValue.length > 0 ||
      pfamFilterIds.length > 0 ||
      selectedSpecies.length > 0 ||
      proteinFilterIds.length > 0
    ) {
      return sortedRows?.filter((row) => {
        const rowCorePeripheral = (
          (row['core_peripheral'] as string) ?? ''
        ).toLowerCase();
        const rowFullId = row['full_id'] as string;
        const rowPfamIdsSet = accessionToPfamIds.get(rowFullId);

        const searchMatch =
          safeSearchRegexp == null ||
          rowMatch(row, safeSearchRegexp, selectedColumnFilters);
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
        const proteinMatch =
          proteinFilterIds.length === 0 ||
          proteinFilterIds.some((proteinId) => rowFullId === proteinId);

        return (
          searchMatch &&
          corePeripheralMatch &&
          pfamIdMatch &&
          speciesMatch &&
          proteinMatch
        );
      });
    }
    return sortedRows;
  }, [
    selectedColumnFilters,
    safeSearchRegexp,
    sortedRows,
    corePeripheralFilterValue,
    accessionToPfamIds,
    pfamFilterIds,
    selectedSpecies,
    proteinFilterIds,
  ]);

  // now filter the tree if needed - takes a couple of seconds for large trees
  const filteredTree = useMemo(() => {
    if (
      leaves == null ||
      tree == null ||
      filteredRows == null ||
      filteredRows.length === 0
    )
      return;

    if (filteredRows.length < leaves.length) {
      const filteredRowIds = new Set(
        filteredRows.map(({ full_id }) => full_id as string)
      );

      // must work on a copy of the tree because it's destructive
      const treeCopy = tree.clone();
      let leavesRemoved = false;
      do {
        const leavesCopy = treeCopy.getLeaves();
        leavesRemoved = false; // Reset flag for each iteration

        for (const leaf of leavesCopy) {
          if (!filteredRowIds.has(leaf.id)) {
            leaf.remove(true); // remove leaf and remove any dangling ancestors
            leavesRemoved = true; // A leaf was removed, so set flag to true
          }
        }
      } while (leavesRemoved); // Continue looping if any leaf was removed
      return treeCopy;
    }

    return tree;
  }, [tree, leaves, filteredRows]);

  // make a newick string from the filtered tree if needed
  const finalNewick = useMemo(() => {
    if (treeResponse != null) {
      if (filteredTree != null) {
        if (filteredTree === tree) {
          return treeResponse; // no filtering so return what we read from the back end
        } else {
          return filteredTree.toNewick(); // make new newick data from the filtered tree
        }
      }
    }
    return;
  }, [filteredTree, treeResponse, tree]);

  // list of column keys and display names to show in the checkbox dropdown in the table text search box (RecordFilter)
  const filterAttributes = useMemo(
    () =>
      mesaColumns
        .map(({ key, name }) => ({
          value: key,
          display: name ?? 'Unknown column',
        }))
        .filter(({ value }) => value !== PFAM_ARCH_COLUMN_KEY),
    [mesaColumns]
  );

  const handleSpeciesSelection = useCallback(
    (species: string[]) => {
      setSelectedSpecies(species);
      setTablePageNumber(1);
    },
    [setSelectedSpecies, setTablePageNumber]
  );

  const firstRowIndex = (tablePageNumber - 1) * MAX_SEQUENCES_FOR_TREE;

  const mesaState: MesaStateProps<RowType> | undefined = useMemo(() => {
    if (sortedRows == null) return;
    return {
      options: {
        isRowSelected: (row: RowType) =>
          highlightedNodes.includes(row.full_id as string),
        useStickyHeader: true,
        tableBodyMaxHeight: 'calc(100vh - 200px)', // 200px accounts for header/footer
      },
      uiState: {
        pagination: {
          currentPage: tablePageNumber,
          rowsPerPage: MAX_SEQUENCES_FOR_TREE,
          totalRows: filteredRows?.length ?? 0,
        },
      },
      rows: sortedRows,
      filteredRows: filteredRows?.slice(
        firstRowIndex,
        firstRowIndex + MAX_SEQUENCES_FOR_TREE
      ),
      columns: mesaColumns,
      eventHandlers: {
        onRowSelect: (row: RowType) =>
          setHighlightedNodes((prev) => [...prev, row.full_id as string]),
        onRowDeselect: (row: RowType) =>
          setHighlightedNodes((prev) =>
            prev.filter((id) => id !== row.full_id)
          ),
        onPageChange: (page: number) => setTablePageNumber(page),
      },
    };
  }, [
    sortedRows,
    filteredRows,
    highlightedNodes,
    tablePageNumber,
    firstRowIndex,
    mesaColumns,
    setHighlightedNodes,
    setTablePageNumber,
  ]);

  const treeProps = useMemo(
    () => ({
      data: finalNewick,
      width: treeWidth,
      highlightMode: 'monophyletic' as const,
      highlightColor,
      highlightedNodeIds: highlightedNodes,
    }),
    [finalNewick, treeWidth, highlightColor, highlightedNodes]
  );

  const proteinFilterButtonRef = useRef<PopoverButtonHandle>(null);

  // None shall pass! (hooks, at least)

  if (!mesaState || !sortedRows || !tree || !treeResponse) {
    return <Loading />;
  }

  if (
    numSequences >= MIN_SEQUENCES_FOR_TREE &&
    mesaRows != null &&
    sortedRows != null &&
    (mesaRows.length !== sortedRows.length ||
      mesaRows.length !== leaves?.length)
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
          message: (
            <span>
              A data processing error has occurred on our end. We apologize for
              the inconvenience. If this problem persists, please{' '}
              <Link target="_blank" to="/contact-us">
                contact us
              </Link>
              .
            </span>
          ),
        }}
      />
    );
  }

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
      value={volatilePfamFilterIds}
      onChange={(ids) => {
        setPfamFilterIds(ids);
        setTablePageNumber(1);
      }}
      instantUpdate={true}
    />
  );

  const corePeripheralFilter = (
    <SelectList<'core' | 'peripheral'>
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
      value={volatileCorePeripheralFilterValue}
      onChange={(value) => {
        setCorePeripheralFilterValue(value);
        setTablePageNumber(1);
      }}
      instantUpdate={true}
    />
  );

  const taxonFilter =
    props.record.tables.TaxonCounts?.length > 0 ? (
      // eslint-disable-next-line react/jsx-pascal-case
      <RecordTable_TaxonCounts_Filter
        key={`taxonFilter-${resetCounter}`}
        selectedSpecies={volatileSelectedSpecies}
        onSpeciesSelected={handleSpeciesSelection}
        record={props.record}
        recordClass={props.recordClass}
        table={props.recordClass.tablesMap.TaxonCounts}
        value={props.record.tables.TaxonCounts}
        DefaultComponent={props.DefaultComponent}
      />
    ) : null;

  const resetProteinFilterButton = (
    <OutlinedButton
      text="Reset protein filter"
      onPress={() => {
        proteinFilterButtonRef.current?.close();
        setProteinFilterIds([]);
        setTablePageNumber(1);
      }}
    />
  );

  const updateProteinFilterIds = () => {
    proteinFilterButtonRef.current?.close();
    setProteinFilterIds(highlightedNodes);
    setHighlightedNodes([]);
    setTablePageNumber(1);
  };

  const proteinFilter = (
    <PopoverButton
      ref={proteinFilterButtonRef}
      buttonDisplayContent={`Proteins${
        volatileProteinFilterIds.length > 0
          ? ` (${volatileProteinFilterIds.length})`
          : ''
      }${highlightedNodes.length > 0 ? '*' : ''}`}
    >
      <div
        style={{
          margin: '1em',
          display: 'flex',
          flexDirection: 'column',
          gap: '1em',
          maxWidth: '300px',
        }}
      >
        {highlightedNodes.length === 0 ? (
          volatileProteinFilterIds.length === 0 ? (
            <div>
              Select some proteins using the checkboxes in the table below.
            </div>
          ) : (
            <>
              <div>
                You are filtering on{' '}
                {volatileProteinFilterIds.length.toLocaleString()} proteins.
              </div>
              {resetProteinFilterButton}
            </>
          )
        ) : volatileProteinFilterIds.length === 0 ? (
          <>
            <div>
              * You have checked {highlightedNodes.length.toLocaleString()}{' '}
              proteins in the table.
            </div>
            <FilledButton
              text="Filter to keep only these proteins"
              onPress={updateProteinFilterIds}
            />
          </>
        ) : highlightedNodes.length < volatileProteinFilterIds.length ? (
          <>
            <div>
              * You have checked {highlightedNodes.length.toLocaleString()}{' '}
              proteins in the table that is already filtered on{' '}
              {volatileProteinFilterIds.length.toLocaleString()} proteins.
            </div>
            <FilledButton
              text="Refine filter to keep only checked proteins"
              onPress={updateProteinFilterIds}
            />
            {resetProteinFilterButton}
          </>
        ) : (
          <>
            <div>
              You have checked all the proteins that are currently being
              filtered on. Either uncheck one or more proteins or reset the
              filter entirely using the button below.
            </div>
            {resetProteinFilterButton}
          </>
        )}
      </div>
    </PopoverButton>
  );

  const resetButton = (
    <FloatingButton
      text={''}
      ariaLabel={'Reset filters'}
      tooltip={'Reset filters'}
      disabled={
        pfamFilterIds.length +
          corePeripheralFilterValue.length +
          selectedSpecies.length +
          proteinFilterIds.length ===
          0 && searchQuery === ''
      }
      icon={Undo}
      size={'medium'}
      themeRole={'primary'}
      onPress={() => {
        setSearchQuery('');
        setProteinFilterIds([]);
        setPfamFilterIds([]);
        setCorePeripheralFilterValue([]);
        setSelectedSpecies([]);
        setResetCounter((prev) => prev + 1);
        setTablePageNumber(1);
      }}
    />
  );

  if (filteredRows == null) return null;

  const warningText =
    numSequences >= MIN_SEQUENCES_FOR_TREE &&
    (filteredRows.length > MAX_SEQUENCES_FOR_TREE ||
      filteredRows.length < MIN_SEQUENCES_FOR_TREE) ? (
      <span>
        To see a phylogenetic tree please use a filter to display between{' '}
        {MIN_SEQUENCES_FOR_TREE.toLocaleString()} and{' '}
        {MAX_SEQUENCES_FOR_TREE.toLocaleString()} sequences
      </span>
    ) : filteredRows.length < sortedRows.length ? (
      <span>
        Note: The ortholog group's phylogeny has been pruned to display only the
        currently filtered proteins. This may differ from a tree constructed{' '}
        <i>de novo</i> using only these sequences.
      </span>
    ) : undefined;

  return (
    <div
      style={
        {
          '--row-hl-bg-color': highlightColor50,
        } as CSSProperties
      }
    >
      {warningText && <NoteBox type="error">{warningText}</NoteBox>}
      <div
        style={{
          padding: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1em',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <RecordFilter
          key={`text-search-${resetCounter}`}
          searchTerm={searchQuery}
          onSearchTermChange={setSearchQuery}
          recordDisplayName="Proteins"
          filterAttributes={filterAttributes}
          selectedColumnFilters={volatileSelectedColumnFilters}
          onColumnFilterChange={(keys) => setSelectedColumnFilters(keys)}
        />
        <div className="MesaComponent" style={{ marginRight: 'auto' }}>
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
            marginLeft: 'auto',
          }}
        >
          <strong>Filters: </strong>
          {proteinFilter}
          {pfamFilter}
          {corePeripheralFilter}
          {taxonFilter}
          {resetButton}
        </div>
      </div>
      {filteredRows && filteredRows?.length > Infinity ? (
        <div>
          Sorry, too many proteins selected:{' '}
          {filteredRows.length.toLocaleString()}. Please use filters to select
          up to {MAX_SEQUENCES_FOR_TREE.toLocaleString()}
        </div>
      ) : (
        <>
          <TreeTable
            rowHeight={rowHeight}
            treeProps={treeProps}
            tableProps={mesaState}
            hideTree={
              filteredRows?.length > MAX_SEQUENCES_FOR_TREE ||
              filteredRows?.length < MIN_SEQUENCES_FOR_TREE
            }
            maxColumnWidth={maxColumnWidth}
          ></TreeTable>
          <form action="/cgi-bin/msaOrthoMCL" target="_blank" method="post">
            <input type="hidden" name="project_id" value="OrthoMCL" />
            {highlightedNodes.map((id) => (
              <input type="hidden" name="msa_full_ids" value={id} key={id} />
            ))}
            <p>
              Please note: selecting a large number of proteins will take
              several minutes to align.
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
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
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
      )}
      <p>
        <a href={treeUrl}>
          <i className="fa fa-download"></i> Download raw newick file
        </a>
      </p>
    </div>
  );
}

function rowMatch(row: RowType, query: RegExp, keys?: string[]): boolean {
  // Get the values to search in based on the optionally provided keys
  const valuesToSearch =
    keys && keys.length > 0 ? keys.map((key) => row[key]) : Object.values(row);

  return (
    valuesToSearch.find((value) => {
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

function createSafeSearchRegExp(input: string): RegExp | undefined {
  if (input === '') return undefined;
  const queryTerms = parseSearchQueryString(input);
  const searchTermRegex = areTermsInStringRegexString(queryTerms);
  return new RegExp(searchTermRegex, 'i');
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

function getLeaves(tree: Branch): Branch[] {
  return tree.getLeaves();
}

function sortRows(leaves: Branch[], mesaRows: TableValue): TableValue {
  if (leaves == null) return mesaRows;

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

  return leaves
    .map(({ id }) => rowMap.get(id))
    .filter((row): row is RowType => row != null);
}
