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
import {
  Checkbox,
  HelpIcon,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';
import {
  GroupCacheGate,
  useGroupBackedDeferredState,
  useGroupBackedState,
} from '../hooks/groupCache';
import {
  arrayOf,
  boolean,
  decodeOrElse,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { RecentSearchesDropdown } from '../components/RecentSearchesDropdown';
import { Branch } from 'patristic';
import {
  addBuiltTree,
  deserializeBuiltTrees,
  findEncompassingTree,
  pruneBuiltTree,
  withoutPrunedTrees,
  serializeBuiltTrees,
  BuiltTree,
  makeBuiltTree,
  findBuiltTree,
} from '../util/builtTrees';
import { RowCounter } from '@veupathdb/coreui/lib/components/Mesa';
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
import {
  estimateMsaSeconds,
  estimateTreeSeconds,
} from '../util/runTimeEstimate';
import {
  JobWarningDialog,
  SlowJobDialog,
  SlowJobWarning,
  slowJobDialogFor,
} from '../components/JobWarningDialog';
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
import {
  extractPfamDomain,
  SEQUENCES_TABLE_NAME,
} from 'ortho-client/records/utils';
import { downloadRecordTableFactory } from 'ortho-client/records/RecordTableSection';
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
} from '@veupathdb/coreui';
import { RecordTable_TaxonCounts_Filter } from './RecordTable_TaxonCounts_Filter';
import { formatAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { RecordFilter } from '@veupathdb/wdk-client/lib/Views/Records/RecordTable/RecordFilter';
import {
  areTermsInStringRegexString,
  parseSearchQueryString,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

type RowType = Record<string, AttributeValue>;

// stable identity, so memos keyed on a table that hasn't loaded yet don't rerun every render
const NO_ROWS: RowType[] = [];

type TreeDialog = { kind: 'tooMany' } | SlowJobDialog;
type MsaDialog = { kind: 'message'; text: string } | SlowJobDialog;

const treeWidth = 200;
const maxColumnWidth = 200;
const maxArchitectureLength = maxColumnWidth - 10 - 10 - 1; // 10px padding each side plus a 1px border
const MIN_SEQUENCES_FOR_TREE = 3;
const MAX_SEQUENCES_FOR_TREE = 1000;
const MIN_SEQUENCES_FOR_MSA = 2;
const MAX_PROTEINS_FOR_MSA = 1000;

const PFAM_ARCH_COLUMN_KEY = 'pfamArchitecture';

const highlightColor = '#feb640';
const highlightColor50 = highlightColor + '7f';

type CoreOrPeripheral = 'core' | 'peripheral';

const decodeStrings = (raw: string) => decodeOrElse(arrayOf(string), [], raw);

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const groupName = props.record.id.find(
    ({ name }) => name === 'group_name'
  )?.value;

  if (!groupName) {
    throw new Error('groupName is required but was not found in the record.');
  }

  return (
    <GroupCacheGate group={groupName}>
      <GroupSequencesTable groupName={groupName} {...props} />
    </GroupCacheGate>
  );
}

function GroupSequencesTable(
  props: WrappedComponentProps<RecordTableProps> & { groupName: string }
) {
  const { groupName } = props;

  const [searchQuery, setSearchQuery, volatileSearchQuery] =
    useGroupBackedDeferredState('search', '', JSON.stringify, (raw) =>
      decodeOrElse(string, '', raw)
    );

  // digits only; '' means no length filter (the box then shows the group's longest)
  const [maxLengthFilter, setMaxLengthFilter, volatileMaxLengthFilter] =
    useGroupBackedDeferredState('maxLength', '', JSON.stringify, (raw) =>
      decodeOrElse(string, '', raw)
    );

  // what's typed in the length box; the stored filter is '' while it's blank or at the longest
  const [lengthDraft, setLengthDraft] = useState<string | null>(null);
  const [treeDialog, setTreeDialog] = useState<TreeDialog>();
  const [msaDialog, setMsaDialog] = useState<MsaDialog>();

  const [resetCounter, setResetCounter] = useState(0); // used for forcing re-render of filter buttons
  // the search box also remounts to show a term picked from the history, which shouldn't touch the filters
  const [searchBoxCounter, setSearchBoxCounter] = useState(0);

  const [proteinFilterIds, setProteinFilterIds, volatileProteinFilterIds] =
    useGroupBackedDeferredState('proteins', [], JSON.stringify, decodeStrings);

  const [selectedSpecies, setSelectedSpecies, volatileSelectedSpecies] =
    useGroupBackedDeferredState('species', [], JSON.stringify, decodeStrings);

  const [pfamFilterIds, setPfamFilterIds, volatilePfamFilterIds] =
    useGroupBackedDeferredState('pfams', [], JSON.stringify, decodeStrings);

  const [
    corePeripheralFilterValue,
    setCorePeripheralFilterValue,
    volatileCorePeripheralFilterValue,
  ] = useGroupBackedDeferredState<CoreOrPeripheral[]>(
    'corePeripheral',
    [],
    JSON.stringify,
    (raw) =>
      decodeStrings(raw).filter(
        (v): v is CoreOrPeripheral => v === 'core' || v === 'peripheral'
      )
  );

  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const [clustalOutFormat, setClustalOutFormat] =
    useState<MsaFormat>('clustal_guidetree');

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  const mesaRows = props.value;
  const pfamRows = props.record.tables['PFams'] ?? NO_ROWS;

  const numSequences = mesaRows.length;

  const meanLength = useMemo(
    () =>
      numSequences === 0
        ? 0
        : Math.round(
            mesaRows.reduce((sum, row) => sum + rowLength(row), 0) /
              numSequences
          ),
    [mesaRows, numSequences]
  );

  const api = useMemo(
    () =>
      SequenceRetrievalApi.getClient(SEQUENCE_RETRIEVAL_BASE_URL, wdkService),
    [wdkService]
  );
  const [builtTrees, setBuiltTrees] = useGroupBackedState<BuiltTree[]>(
    'trees',
    [],
    serializeBuiltTrees,
    deserializeBuiltTrees
  );
  const [allowPruned, setAllowPruned] = useGroupBackedState(
    'allowPruned',
    true,
    JSON.stringify,
    (raw) => decodeOrElse(boolean, true, raw)
  );
  // Keep every tree built on this page, so returning to an earlier filter
  // (or clearing it) shows the matching tree again without a new job.
  const geneTreeJob = useGeneTreeJob(api, PROTEIN_SEQUENCE_TYPE, (newick) =>
    setBuiltTrees(addBuiltTree(builtTrees, makeBuiltTree(newick)))
  );

  // deal with Pfam domain architectures
  const proteinPfams = props.record.tables['ProteinPFams'] ?? NO_ROWS;
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
  ] = useGroupBackedDeferredState(
    'searchColumns',
    [],
    JSON.stringify,
    decodeStrings
  );

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
        proteinFilterIds.length > 0 ||
        maxLengthFilter !== ''
      ) {
        // these two are likely to be selected in large numbers
        const selectedSpeciesSet = new Set(
          ignoreSpecies ? [] : selectedSpecies
        );
        const proteinFilterIdsSet = new Set(proteinFilterIds);
        const maxLength =
          maxLengthFilter === '' ? null : Number(maxLengthFilter);

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

          const lengthMatch = maxLength == null || rowLength(row) <= maxLength;

          return (
            searchMatch &&
            corePeripheralMatch &&
            pfamIdMatch &&
            speciesMatch &&
            proteinMatch &&
            lengthMatch
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
      maxLengthFilter,
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

  const downloadSequencesTable = useMemo(
    () =>
      downloadRecordTableFactory(
        wdkService,
        props.record,
        SEQUENCES_TABLE_NAME
      ),
    [wdkService, props.record]
  );

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
    maxLengthFilter !== volatileMaxLengthFilter ||
    searchQuery !== volatileSearchQuery ||
    (searchQuery !== '' &&
      selectedColumnFilters !== volatileSelectedColumnFilters);

  if (!mesaState || !sortedRows) {
    return <Loading />;
  }

  const rowHeight = 45;
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

  const lengthBoxValue =
    lengthDraft ??
    (volatileMaxLengthFilter !== ''
      ? volatileMaxLengthFilter
      : String(maxProteinLength));
  const lengthBoxNumber = Number(lengthBoxValue);

  const lengthFilter = (
    <PopoverButton
      key={`lengthFilter-${resetCounter}`}
      buttonDisplayContent={`Length${
        volatileMaxLengthFilter !== '' ? ` ≤ ${volatileMaxLengthFilter}` : ''
      }`}
      deferClosing={isFiltering}
    >
      <div
        style={{
          margin: '.4em',
          display: 'flex',
          alignItems: 'center',
          gap: '.5em',
          fontSize: '1.3em',
        }}
      >
        Length &le;
        <input
          type="text"
          inputMode="numeric"
          size={7}
          style={{ fontSize: 'inherit' }}
          value={lengthBoxValue}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '');
            setLengthDraft(digits);
            // blank, or at/above the longest, filters nothing
            setMaxLengthFilter(
              digits === '' || Number(digits) >= maxProteinLength ? '' : digits
            );
            setTablePageNumber(1);
          }}
        />
        <span style={{ opacity: 0.8 }}>
          (
          {meanLength > 0 && lengthBoxNumber > 0
            ? (lengthBoxNumber / meanLength).toFixed(1)
            : '–'}{' '}
          x mean of {meanLength})
        </span>
        <button
          type="button"
          className="wdk-Link"
          style={{ fontSize: 'inherit' }}
          disabled={lengthBoxNumber === maxProteinLength}
          onClick={() => {
            setLengthDraft(null);
            setMaxLengthFilter('');
            setTablePageNumber(1);
          }}
        >
          Reset to longest: {maxProteinLength}
        </button>
      </div>
    </PopoverButton>
  );

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
          0 &&
        searchQuery === '' &&
        maxLengthFilter === ''
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
        setMaxLengthFilter('');
        setLengthDraft(null);
        setResetCounter((prev) => prev + 1);
        setSearchBoxCounter((prev) => prev + 1);
        setTablePageNumber(1);
      }}
    />
  );

  if (filteredRows == null) return null;

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

  const filtersApplied =
    searchQuery !== '' ||
    corePeripheralFilterValue.length > 0 ||
    pfamFilterIds.length > 0 ||
    selectedSpecies.length > 0 ||
    proteinFilterIds.length > 0 ||
    maxLengthFilter !== '';

  // a tree built for exactly these rows is already showing
  const treeIsShown = treeResponse != null;

  const estimatedSeconds = estimateTreeSeconds(
    filteredRows.length,
    Math.max(0, ...filteredRows.map(rowLength))
  );

  const startTree = (estimatedSeconds: number) =>
    geneTreeJob.start(buildGeneTreeRequest(filteredRows), estimatedSeconds);

  // A stored tree that covers these rows can stand in for a new job. The
  // pruned tree is stored under its own ids; the source is kept as the newest
  // so that adding the pruned one can't push it out.
  const showPrunedTree = (): boolean => {
    const ids = filteredRows.map(({ full_id }) =>
      encodeTreeLabel(full_id as string)
    );
    const source = findEncompassingTree(builtTrees, ids);
    if (source == null) return false;
    setBuiltTrees(
      addBuiltTree(
        addBuiltTree(builtTrees, pruneBuiltTree(source, ids)),
        source
      )
    );
    return true;
  };

  const treePanel = numSequences >= MIN_SEQUENCES_FOR_TREE && (
    <div style={{ padding: '10px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '.4em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5em' }}>
          <button
            type="button"
            disabled={treeJobBusy || tooFewForTree || treeIsShown}
            onClick={() => {
              if (allowPruned && showPrunedTree()) {
                // no job needed
              } else if (tooManyForTree) {
                setTreeDialog({ kind: 'tooMany' });
              } else {
                const slow = slowJobDialogFor(estimatedSeconds);
                if (slow) setTreeDialog(slow);
                else startTree(estimatedSeconds);
              }
            }}
          >
            {filtersApplied
              ? `Show phylogenetic tree (${filteredRows.length} sequences)`
              : 'Show phylogenetic tree'}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '.4em' }}>
            <Checkbox
              value={allowPruned}
              onChange={(allow) => {
                setAllowPruned(allow);
                // trees made by pruning go away when pruning is turned off
                if (!allow) setBuiltTrees(withoutPrunedTrees(builtTrees));
              }}
            />
            Allow pruned trees
            <HelpIcon>
              <div>
                For speed, do not generate a new tree when a pre-existing tree
                can be pruned to the selected proteins.
                <ul>
                  <li>
                    <b>Checked:</b> Prune a pre-existing tree, if available.
                  </li>
                  <li>
                    <b>Unchecked:</b> Generate a new tree.
                  </li>
                </ul>
              </div>
            </HelpIcon>
          </label>
        </div>
        {treeDialog?.kind === 'tooMany' && (
          <JobWarningDialog
            title="⚠️ Too many sequences"
            onClose={() => setTreeDialog(undefined)}
          >
            More than {MAX_SEQUENCES_FOR_TREE} sequences in the table. Please
            reduce to {MAX_SEQUENCES_FOR_TREE} or less by applying the available
            filters
          </JobWarningDialog>
        )}
        {(treeDialog?.kind === 'slow' || treeDialog?.kind === 'tooSlow') && (
          <SlowJobWarning
            dialog={treeDialog}
            onClose={() => setTreeDialog(undefined)}
            onRun={startTree}
          />
        )}
        {geneTreeJob.phase === 'submitting' && <span>Submitting…</span>}
        {geneTreeJob.phase === 'running' && (
          <JobStatusLine
            status={geneTreeJob.status ?? 'queued'}
            job={geneTreeJob.job}
            estimatedSeconds={geneTreeJob.estimatedSeconds}
          />
        )}
        {geneTreeJob.phase === 'error' && (
          <span style={{ color: 'rgb(185, 28, 28)' }}>
            The tree could not be built: {geneTreeJob.error}
          </span>
        )}
      </div>
    </div>
  );

  const runMsa = (estimatedSeconds: number) =>
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
      estimatedSeconds,
    }).catch(() =>
      setMsaDialog({
        kind: 'message',
        text: 'Something went wrong submitting your request. Please try again.',
      })
    );

  const msaForm = (
    <div style={{ padding: '10px', paddingLeft: '4em' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
        <button
          type="button"
          onClick={() => {
            if (
              highlightedNodes.length < MIN_SEQUENCES_FOR_MSA ||
              highlightedNodes.length > MAX_PROTEINS_FOR_MSA
            ) {
              setMsaDialog({
                kind: 'message',
                text: `Please use checkboxes to select between ${MIN_SEQUENCES_FOR_MSA} and ${MAX_PROTEINS_FOR_MSA} sequences in the table.`,
              });
              return;
            }
            const selected = new Set(highlightedNodes);
            const msaSeconds = estimateMsaSeconds(
              highlightedNodes.length,
              Math.max(
                0,
                ...mesaRows
                  .filter((row) => selected.has(row.full_id as string))
                  .map(rowLength)
              )
            );
            const slow = slowJobDialogFor(msaSeconds);
            if (slow) setMsaDialog(slow);
            else runMsa(msaSeconds);
          }}
        >
          {highlightedNodes.length > 0
            ? `Run Clustal Omega (${highlightedNodes.length} sequences)`
            : 'Run Clustal Omega'}
        </button>
        <label>
          Format:{' '}
          <select
            value={clustalOutFormat}
            onChange={(e) => setClustalOutFormat(e.target.value as MsaFormat)}
          >
            <option value="clustal_guidetree">Mismatches highlighted</option>
            <option value="fasta">FASTA</option>
            <option value="phylip">PHYLIP</option>
            <option value="stockholm">STOCKHOLM</option>
            <option value="vienna">VIENNA</option>
          </select>
        </label>
      </div>
      {msaDialog?.kind === 'message' && (
        <JobWarningDialog
          title="⚠️ Multiple sequence alignment"
          onClose={() => setMsaDialog(undefined)}
        >
          {msaDialog.text}
        </JobWarningDialog>
      )}
      {(msaDialog?.kind === 'slow' || msaDialog?.kind === 'tooSlow') && (
        <SlowJobWarning
          dialog={msaDialog}
          onClose={() => setMsaDialog(undefined)}
          onRun={runMsa}
        />
      )}
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
      <div
        style={{
          marginBottom: '1em',
          fontSize: '.8em',
          display: 'flex',
          gap: '1.5em',
        }}
      >
        <button
          type="button"
          className="wdk-Link"
          onClick={downloadSequencesTable}
        >
          <i className="fa fa-download"></i> Download table
        </button>
        {newickDownloadUrl && (
          <a href={newickDownloadUrl} download={`${groupName}.nwk`}>
            <i className="fa fa-download"></i> Download newick tree
          </a>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {treePanel}
        {msaForm}
      </div>
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
        <div style={{ marginRight: 'auto' }}>
          <RecentSearchesDropdown
            searchTerm={volatileSearchQuery}
            onSelect={(term) => {
              handleSearchQueryChange(term);
              setSearchBoxCounter((n) => n + 1); // remounts the search box so it shows the term
            }}
          >
            <RecordFilter
              key={`text-search-${searchBoxCounter}`}
              // volatile: the box only reads this on mount, and the deferred value lags a render behind
              searchTerm={volatileSearchQuery}
              onSearchTermChange={handleSearchQueryChange}
              recordDisplayName="Proteins"
              filterAttributes={filterAttributes}
              selectedColumnFilters={volatileSelectedColumnFilters}
              onColumnFilterChange={(keys) => setSelectedColumnFilters(keys)}
            />
          </RecentSearchesDropdown>
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
          {lengthFilter}
          {taxonFilter}
          {resetButton}
        </div>
      </div>
      <div
        className="MesaComponent"
        style={{
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5em',
        }}
      >
        <div className="TableToolbar-Info">
          <RowCounter
            rowNoun="sequence"
            rows={sortedRows}
            uiState={{
              filteredRowCount: numSequences - rowCount, // num rows filtered **away**
            }}
            eventHandlers={{}}
          />
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
        </Dimmable>
      )}
    </div>
  );
}

function rowLength(row: RowType): number {
  return Number(row['length']) || 0;
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
