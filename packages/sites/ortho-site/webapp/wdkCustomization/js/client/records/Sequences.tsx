import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import TreeTable from '@veupathdb/components/lib/components/tidytree/TreeTable';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RecentSearchesDropdown } from '../components/RecentSearchesDropdown';
import { Branch } from 'patristic';
import {
  addBuiltTree,
  BuiltTree,
  makeBuiltTree,
  findBuiltTree,
} from '../util/builtTrees';
import { ClustalAlignmentForm } from '@veupathdb/web-common/lib/components';
import { rootUrl } from '@veupathdb/web-common/lib/config';
import { openTabAndSubmitMsaJob } from '@veupathdb/web-common/lib/util/msaJobSubmission';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import { MsaFormat } from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';
import { resolveProteinFeatures } from '../util/resolveProteinFeatures';
import {
  PROTEIN_SEQUENCE_TYPE,
  SEQUENCE_RETRIEVAL_BASE_URL,
} from '../util/computeJobConfig';
import { buildGeneTreeRequest, encodeTreeLabel } from '../util/geneTree';
import { useGeneTreeJob } from '../hooks/useGeneTreeJob';
import { JobStatusLine } from '@veupathdb/compute-platform-job/src/lib/Components/JobStatusLine';
import {
  AttributeValue,
  TableValue,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { countBy, groupBy } from 'lodash';
import { PfamDomainArchitecture } from 'ortho-client/components/pfam-domains/PfamDomainArchitecture';
import { extractPfamDomain } from 'ortho-client/records/utils';
import { RowCounter } from '@veupathdb/coreui/lib/components/Mesa';
import PopoverButton, {
  PopoverButtonHandle,
} from '@veupathdb/coreui/lib/components/buttons/PopoverButton/PopoverButton';
import { PfamDomain } from 'ortho-client/components/pfam-domains/PfamDomain';
import {
  Dimmable,
  FilledButton,
  FloatingButton,
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
const MAX_PROTEINS_FOR_MSA = 1000;

const PFAM_ARCH_COLUMN_KEY = 'pfamArchitecture';

const highlightColor = '#feb640';
const highlightColor50 = highlightColor + '7f';

type CoreOrPeripheral = 'core' | 'peripheral';

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const [searchQuery, setSearchQuery, volatileSearchQuery] =
    useDeferredState('');

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
  ] = useDeferredState<CoreOrPeripheral[]>([]);

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const [clustalOutFormat, setClustalOutFormat] =
    useState<MsaFormat>('clustal_guidetree');

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

  const api = useMemo(
    () =>
      SequenceRetrievalApi.getClient(SEQUENCE_RETRIEVAL_BASE_URL, wdkService),
    [wdkService]
  );
  const geneTreeJob = useGeneTreeJob(api, PROTEIN_SEQUENCE_TYPE);
  const [builtTrees, setBuiltTrees] = useState<BuiltTree[]>([]);
  // Keep every tree built on this page, so returning to an earlier filter
  // (or clearing it) shows the matching tree again without a new job.
  useEffect(() => {
    if (geneTreeJob.newick == null) return;
    const built = makeBuiltTree(geneTreeJob.newick);
    setBuiltTrees((trees) => addBuiltTree(trees, built));
  }, [geneTreeJob.newick]);

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

  // Rows matching the filters, in the table's original order. The organism
  // filter's own counts leave out the organism selection, so that picking a
  // species doesn't zero out every other species.
  const filterMesaRows = useCallback(
    (ignoreSpecies: boolean) => {
      if (
        searchQuery != null ||
        corePeripheralFilterValue.length > 0 ||
        pfamFilterIds.length > 0 ||
        (!ignoreSpecies && selectedSpecies.length > 0) ||
        proteinFilterIds.length > 0
      ) {
        // these two are likely to be selected in large numbers
        const selectedSpeciesSet = new Set(
          ignoreSpecies ? [] : selectedSpecies
        );
        const proteinFilterIdsSet = new Set(proteinFilterIds);

        const safeSearchRegexp = createSafeSearchRegExp(searchQuery);

        return mesaRows.filter((row) => {
          const rowCorePeripheral = (
            (row.core_peripheral as string) ?? ''
          ).toLowerCase();
          const rowFullId = row.full_id as string;
          const rowTaxon = row.taxon_abbrev as string;
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
            selectedSpeciesSet.size === 0 || selectedSpeciesSet.has(rowTaxon);
          const proteinMatch =
            proteinFilterIdsSet.size === 0 ||
            proteinFilterIdsSet.has(rowFullId);

          return (
            searchMatch &&
            corePeripheralMatch &&
            pfamIdMatch &&
            speciesMatch &&
            proteinMatch
          );
        });
      }
      return mesaRows;
    },
    [
      selectedColumnFilters,
      searchQuery,
      mesaRows,
      corePeripheralFilterValue,
      accessionToPfamIds,
      pfamFilterIds,
      selectedSpecies,
      proteinFilterIds,
    ]
  );

  // rows matching the filters, before ordering by whichever tree is shown
  const matchingRows = useMemo(() => filterMesaRows(false), [filterMesaRows]);

  const taxonCounts = useMemo(
    () => countBy(filterMesaRows(true), (row) => row.taxon_abbrev as string),
    [filterMesaRows]
  );

  // The table's rows have to follow the order of the tree's leaves, so which
  // tree is shown has to be settled before the rows are ordered.
  const activeTree = useMemo(
    () =>
      findBuiltTree(
        builtTrees,
        matchingRows.map(({ full_id }) => encodeTreeLabel(full_id as string))
      ),
    [builtTrees, matchingRows]
  );
  const leaves = activeTree?.leaves;
  const treeResponse = activeTree?.newick;

  const sortedRows = useMemo(
    () => (leaves ? sortRows(leaves, mesaRows) : mesaRows),
    [leaves, mesaRows]
  );
  const filteredRows = useMemo(() => {
    const matching = new Set(matchingRows);
    return sortedRows.filter((row) => matching.has(row));
  }, [sortedRows, matchingRows]);

  const newickDownloadUrl = useMemo(
    () =>
      treeResponse == null
        ? undefined
        : URL.createObjectURL(new Blob([treeResponse])),
    [treeResponse]
  );
  useEffect(
    () => () => {
      if (newickDownloadUrl) URL.revokeObjectURL(newickDownloadUrl);
    },
    [newickDownloadUrl]
  );
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

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setTablePageNumber(1);
  }, []);

  const handleSpeciesSelection = useCallback((species: string[]) => {
    setSelectedSpecies(species);
    setTablePageNumber(1);
  }, []);

  const handleCorePeripheralSelection = useCallback(
    (value: CoreOrPeripheral[]) => {
      setCorePeripheralFilterValue(value);
      setTablePageNumber(1);
    },
    []
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
      data: treeResponse,
      width: treeWidth,
      highlightMode: 'monophyletic' as const,
      highlightColor,
      highlightedNodeIds: highlightedNodes.map(encodeTreeLabel),
    }),
    [treeResponse, treeWidth, highlightColor, highlightedNodes]
  );

  const proteinFilterButtonRef = useRef<PopoverButtonHandle>(null);

  const onPfamFilterChange = useCallback((ids: string[]) => {
    setPfamFilterIds(ids);
    setTablePageNumber(1);
  }, []);

  // None shall pass! (hooks, at least)

  const isFiltering =
    pfamFilterIds !== volatilePfamFilterIds ||
    proteinFilterIds !== volatileProteinFilterIds ||
    corePeripheralFilterValue !== volatileCorePeripheralFilterValue ||
    selectedSpecies !== volatileSelectedSpecies ||
    searchQuery !== volatileSearchQuery ||
    (searchQuery !== '' &&
      selectedColumnFilters !== volatileSelectedColumnFilters);

  if (!mesaState || !sortedRows) {
    return <Loading />;
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
        // unexciting display for the popover button:
        altDisplay: formatAttributeValue(row.accession),
      }))}
      value={volatilePfamFilterIds}
      onChange={onPfamFilterChange}
      instantUpdate={true}
      deferPopoverClosing={isFiltering}
    />
  );

  const corePeripheralFilter = (
    <SelectList<CoreOrPeripheral>
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
      onChange={handleCorePeripheralSelection}
      instantUpdate={true}
      deferPopoverClosing={isFiltering}
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
        speciesCounts={taxonCounts}
        DefaultComponent={props.DefaultComponent}
        deferPopoverClosing={isFiltering}
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
      key={`proteinFilter-${resetCounter}`}
      buttonDisplayContent={`Proteins${
        volatileProteinFilterIds.length > 0
          ? ` (${volatileProteinFilterIds.length})`
          : ''
      }${highlightedNodes.length > 0 ? '*' : ''}`}
      deferClosing={isFiltering}
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
    builtTrees.length > 0 && treeResponse == null ? (
      <span>
        Note: No tree has been built for the rows now in the table. Build one,
        or restore an earlier filter.
      </span>
    ) : undefined;

  // We tried using a `<Loading />` spinner but its hardcoded 200ms delay
  // was causing problems. This looks great on top of the greyed out table though.
  const LOADING = (
    <span
      style={{
        fontSize: '3rem',
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 0.25)',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      LOADING
    </span>
  );

  const treeJobBusy =
    geneTreeJob.phase === 'submitting' || geneTreeJob.phase === 'running';
  const tooManyForTree = filteredRows.length > MAX_SEQUENCES_FOR_TREE;
  const tooFewForTree = filteredRows.length < MIN_SEQUENCES_FOR_TREE;

  const treePanel = numSequences >= MIN_SEQUENCES_FOR_TREE && (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
        <button
          type="button"
          disabled={treeJobBusy || tooManyForTree || tooFewForTree}
          onClick={() => geneTreeJob.start(buildGeneTreeRequest(filteredRows))}
        >
          Show phylogenetic tree
        </button>
        {geneTreeJob.phase === 'submitting' && <span>Submitting…</span>}
        {geneTreeJob.phase === 'running' && (
          <JobStatusLine
            status={geneTreeJob.status ?? 'queued'}
            job={geneTreeJob.job}
          />
        )}
        {geneTreeJob.phase === 'error' && (
          <span style={{ color: 'rgb(185, 28, 28)' }}>
            The tree could not be built: {geneTreeJob.error}
          </span>
        )}
      </div>
      <div style={{ marginTop: '.4em', opacity: 0.8 }}>
        May take seconds to minutes, depending on the number of sequences. Use
        the table filter to reduce the rows and speed the processing.
        {tooManyForTree &&
          ` Max ${MAX_SEQUENCES_FOR_TREE.toLocaleString()} proteins.`}
      </div>
    </div>
  );

  return (
    <div
      style={
        {
          '--row-hl-bg-color': highlightColor50,
        } as CSSProperties
      }
    >
      {warningText && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            borderLeft: '.2em solid rgb(225, 133, 133)',
            borderRight: '.2em solid rgb(225, 133, 133)',
            padding: '.5em 1em',
            background: 'rgb(255, 228, 228)',
            gap: '1em',
            marginBottom: '1em',
            fontWeight: 500,
          }}
        >
          {warningText}
        </div>
      )}
      {treePanel}
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
        <RecentSearchesDropdown
          searchTerm={volatileSearchQuery}
          onSelect={(term) => {
            handleSearchQueryChange(term);
            setResetCounter((n) => n + 1); // remounts the search box so it shows the term
          }}
        >
          <RecordFilter
            key={`text-search-${resetCounter}`}
            // volatile: the box only reads this on mount, and the deferred value lags a render behind
            searchTerm={volatileSearchQuery}
            onSearchTermChange={handleSearchQueryChange}
            recordDisplayName="Proteins"
            filterAttributes={filterAttributes}
            selectedColumnFilters={volatileSelectedColumnFilters}
            onColumnFilterChange={(keys) => setSelectedColumnFilters(keys)}
          />
        </RecentSearchesDropdown>
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
        <Dimmable dimmed={isFiltering} spinner={LOADING}>
          <TreeTable
            rowHeight={rowHeight}
            treeProps={treeProps}
            tableProps={mesaState}
            hideTree={treeResponse == null}
            maxColumnWidth={maxColumnWidth}
          ></TreeTable>
          <ClustalAlignmentForm
            action="/workspace/msa"
            sequenceCount={highlightedNodes.length}
            sequenceType="proteins"
            blockThreshold={MAX_PROTEINS_FOR_MSA}
            onConfirm={() =>
              openTabAndSubmitMsaJob({
                api: SequenceRetrievalApi.getClient(
                  SEQUENCE_RETRIEVAL_BASE_URL,
                  wdkService
                ),
                resolveFeatures: async () =>
                  resolveProteinFeatures(highlightedNodes, mesaRows),
                sequenceType: 'orthomcl',
                msaFormat: clustalOutFormat,
                resultRouteBase: `${rootUrl}/workspace/msa`,
                deflineFormat: 'QUERYONLY',
                paramsSummary: `${
                  highlightedNodes.length
                } Proteins, ${clustalOutFormat.toUpperCase()} output format`,
              })
            }
          >
            <h4>Multiple Sequence Alignment</h4>
            <div id="userOptions">
              <p>
                {highlightedNodes.length} out of {filteredRows.length} sequences
                selected
              </p>
              <p>
                Output format: &nbsp;
                <select
                  value={clustalOutFormat}
                  onChange={(e) =>
                    setClustalOutFormat(e.target.value as MsaFormat)
                  }
                >
                  <option value="clustal_guidetree">
                    Mismatches highlighted
                  </option>
                  <option value="fasta">FASTA</option>
                  <option value="phylip">PHYLIP</option>
                  <option value="stockholm">STOCKHOLM</option>
                  <option value="vienna">VIENNA</option>
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
          </ClustalAlignmentForm>
        </Dimmable>
      )}
      {newickDownloadUrl && (
        <p>
          <a href={newickDownloadUrl} download={`${groupName}.nwk`}>
            <i className="fa fa-download"></i> Download raw newick file
          </a>
        </p>
      )}
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

// Rows in the order of the tree's leaves, followed by any rows the tree
// doesn't have (it was built from whatever rows were showing at the time).
function sortRows(leaves: Branch[], mesaRows: TableValue): TableValue {
  const rowMap = new Map(
    mesaRows.map((row) => [encodeTreeLabel(row.full_id as string), row])
  );

  const inTreeOrder = leaves
    .map(({ id }) => rowMap.get(id))
    .filter((row): row is RowType => row != null);
  const inTree = new Set(inTreeOrder);

  return [...inTreeOrder, ...mesaRows.filter((row) => !inTree.has(row))];
}
