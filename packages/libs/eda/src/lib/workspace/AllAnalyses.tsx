import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { map, orderBy } from 'lodash';
import Path from 'path';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { isVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';

import {
  Button,
  Checkbox as MaterialCheckbox,
  FormControlLabel,
  Icon,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';
import {
  Loading,
  Mesa,
  SaveableTextEditor,
} from '@veupathdb/wdk-client/lib/Components';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  safeHtml,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { confirm } from '@veupathdb/wdk-client/lib/Utils/Platform';
import { OverflowingTextCell } from '@veupathdb/wdk-client/lib/Views/Strategy/OverflowingTextCell';

import {
  AnalysisClient,
  AnalysisSummary,
  useAnalysisList,
  usePinnedAnalyses,
} from '../core';
import SubsettingClient from '../core/api/SubsettingClient';
import { useDebounce } from '../core/hooks/debouncing';
import { useWdkStudyRecords } from '../core/hooks/study';
import {
  ANALYSIS_NAME_MAX_LENGTH,
  makeCurrentProvenanceString,
  makeOnImportProvenanceString,
} from '../core/utils/analysis';
import { convertISOToDisplayFormat } from '../core/utils/date-conversion';
import ShareFromAnalysesList from './sharing/ShareFromAnalysesList';
import { Checkbox, Toggle, Tooltip, colors } from '@veupathdb/coreui';
import {
  getStudyAccess,
  getStudyId,
} from '@veupathdb/study-data-access/lib/shared/studies';

import { diyUserDatasetIdToWdkRecordId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';

interface AnalysisAndDataset {
  analysis: AnalysisSummary & {
    displayNameAndProvenance: string;
    creationTimeDisplay: string;
    modificationTimeDisplay: string;
  };
  dataset?: {
    id: string;
    displayName: string;
    studyAccess?: string;
    searchString: string;
    canMakePublic: boolean;
  };
}

interface Props {
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  exampleAnalysesAuthors?: number[];
  /**
   * When provided, the table is filtered to the study,
   * and the study column is not displayed.
   */
  studyId?: string | null;
  /**
   * If the analysis with this ID is displayed,
   * indicate it is "active"
   */
  activeAnalysisId?: string;
  /**
   * Determines if the search term is stored as a query
   * param in the url
   */
  synchronizeWithUrl?: boolean;
  /**
   * Determines if the document title is updated
   */
  updateDocumentTitle?: boolean;
  /**
   * A callback to open a login form.
   * This is passed down through several component layers. */
  showLoginForm: () => void;
}

const useStyles = makeStyles({
  root: {
    '& .ActionToolbar-Item': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .MesaComponent td': {
      verticalAlign: 'middle',
    },
  },
});

const UNKNOWN_DATASET_NAME = 'Unknown study';
const WDK_STUDY_RECORD_ATTRIBUTES = ['study_access'];

export function AllAnalyses(props: Props) {
  const {
    analysisClient,
    exampleAnalysesAuthors,
    showLoginForm,
    studyId,
    synchronizeWithUrl,
    updateDocumentTitle,
    activeAnalysisId,
    subsettingClient,
  } = props;
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  const searchTextQueryParam = useMemo(() => {
    if (!synchronizeWithUrl) return '';
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('s') ?? '';
    return stripHTML(searchParam); // matches stripHTML(dataset.displayName) below
  }, [location.search, synchronizeWithUrl]);

  const [searchText, setSearchText] = useState(searchTextQueryParam);

  const debouncedSearchText = useDebounce(searchText, 250);

  useEffect(() => {
    if (!synchronizeWithUrl) return;
    const queryParams = searchText
      ? '?s=' + encodeURIComponent(searchText)
      : '';
    history.replace(location.pathname + queryParams);
  }, [history, location.pathname, searchText, synchronizeWithUrl]);

  const onFilterFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    [setSearchText]
  );

  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(
    new Set()
  );

  const [sortPinned, setSortPinned] = useSessionBackedState<boolean>(
    true,
    'eda::allAnalysesPinned',
    JSON.stringify,
    JSON.parse
  );

  const [tableSort, setTableSort] = useSessionBackedState<
    [string, 'asc' | 'desc']
  >(['modified', 'desc'], 'eda::allAnalysesSort', JSON.stringify, JSON.parse);

  const {
    pinnedAnalyses,
    isPinnedAnalysis,
    addPinnedAnalysis,
    removePinnedAnalysis,
  } = usePinnedAnalyses(analysisClient);

  const datasets = useWdkStudyRecords(subsettingClient, {
    attributes: WDK_STUDY_RECORD_ATTRIBUTES,
  });

  const [ownUserDatasets, communityDatasets] =
    useWdkService(async (wdkService) => {
      if (isVdiCompatibleWdkService(wdkService)) {
        return Promise.all([
          wdkService.getCurrentUserDatasets(),
          wdkService.getCommunityDatasets(),
        ]);
      }
      return [];
    }, []) ?? [];

  const { analyses, deleteAnalyses, updateAnalysis, loading, error } =
    useAnalysisList(analysisClient);

  type Entry = [string, AnalysisAndDataset['dataset']];
  const analysesAndDatasets: AnalysisAndDataset[] | undefined = useMemo(() => {
    const datasetsById = new Map<Entry[0], Entry[1]>([
      ...map(
        datasets,
        (dataset): Entry => [
          getStudyId(dataset)!,
          {
            id: getStudyId(dataset)!,
            displayName: dataset.displayName,
            studyAccess: getStudyAccess(dataset),
            searchString: stripHTML(dataset.displayName),
            canMakePublic: true,
          },
        ]
      ),
      ...map(
        communityDatasets,
        (userDataset): Entry => [
          diyUserDatasetIdToWdkRecordId(userDataset.datasetId),
          {
            id: diyUserDatasetIdToWdkRecordId(userDataset.datasetId),
            displayName: userDataset.name,
            searchString: userDataset.name,
            canMakePublic: true,
          },
        ]
      ),
      ...map(
        ownUserDatasets,
        (userDataset): Entry => [
          diyUserDatasetIdToWdkRecordId(userDataset.datasetId),
          {
            id: diyUserDatasetIdToWdkRecordId(userDataset.datasetId),
            displayName: userDataset.name,
            searchString: userDataset.name,
            canMakePublic: userDataset.visibility === 'public',
          },
        ]
      ),
    ]);

    return analyses?.map((analysis) => {
      const dataset = datasetsById.get(analysis.studyId);

      return {
        analysis: {
          ...analysis,
          displayNameAndProvenance:
            analysis.provenance == null
              ? analysis.displayName
              : `${analysis.displayName}\0${makeOnImportProvenanceString(
                  analysis.creationTime,
                  analysis.provenance
                )}\0${makeCurrentProvenanceString(analysis.provenance)}`,
          creationTimeDisplay: convertISOToDisplayFormat(analysis.creationTime),
          modificationTimeDisplay: convertISOToDisplayFormat(
            analysis.modificationTime
          ),
        },
        dataset,
      };
    });
  }, [analyses, communityDatasets, datasets, ownUserDatasets]);

  const searchableAnalysisColumns = useMemo(
    () =>
      [
        'displayNameAndProvenance',
        'description',
        'creationTimeDisplay',
        'modificationTimeDisplay',
      ] as const,
    []
  );

  const filteredAnalysesAndDatasets = useMemo(() => {
    if (!debouncedSearchText && !studyId) return analysesAndDatasets;
    const lowerSearchText = debouncedSearchText.toLowerCase();

    return analysesAndDatasets?.filter(({ analysis, dataset }) => {
      const matchesStudyId = !studyId || dataset?.id === studyId;
      if (!matchesStudyId) return false;
      if (!debouncedSearchText) return true;
      return (
        searchableAnalysisColumns.some((columnKey) =>
          analysis[columnKey]?.toLowerCase().includes(lowerSearchText)
        ) ||
        dataset?.searchString.toLowerCase().includes(lowerSearchText) ||
        (dataset == null &&
          UNKNOWN_DATASET_NAME.toLowerCase().includes(lowerSearchText))
      );
    });
  }, [
    searchableAnalysisColumns,
    debouncedSearchText,
    analysesAndDatasets,
    studyId,
  ]);

  const removeUnpinned = useCallback(() => {
    if (filteredAnalysesAndDatasets == null) return;
    const idsToRemove = filteredAnalysesAndDatasets
      .map(({ analysis }) => analysis.analysisId)
      .filter((id) => !isPinnedAnalysis(id));
    deleteAnalyses(idsToRemove);
  }, [filteredAnalysesAndDatasets, deleteAnalyses, isPinnedAnalysis]);

  const [sharingModalVisible, setSharingModalVisible] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] =
    useState<string | undefined>(undefined);

  const tableState = useMemo(
    () => ({
      rows: sortPinned
        ? orderBy(
            filteredAnalysesAndDatasets,
            [
              ({ analysis }) => (isPinnedAnalysis(analysis.analysisId) ? 0 : 1),
              ({ analysis }) => {
                const columnKey = tableSort[0];
                switch (columnKey) {
                  case 'study':
                    return (
                      datasets?.find((d) => d.id[0].value === analysis.studyId)
                        ?.displayName ?? UNKNOWN_DATASET_NAME
                    );
                  case 'name':
                    return analysis.displayNameAndProvenance;
                  case 'description':
                    return analysis.description;
                  case 'isPublic':
                    return analysis.isPublic;
                  case 'modificationTime':
                    return analysis.modificationTime;
                  case 'creationTime':
                    return analysis.creationTime;
                }
              },
            ],
            ['asc', tableSort[1]]
          )
        : filteredAnalysesAndDatasets ?? [],
      options: {
        renderEmptyState: () => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
              fontSize: '2em',
            }}
          >
            <div>
              {analyses == null
                ? 'You do not have any analyses. Get started by choosing a study'
                : 'There are no analyses that match your search'}
              .
            </div>
          </div>
        ),
        deriveRowClassName: ({ analysis }: AnalysisAndDataset) => {
          return isPinnedAnalysis(analysis.analysisId)
            ? 'pinned'
            : 'not-pinned';
        },
        isRowSelected: ({ analysis }: AnalysisAndDataset) =>
          selectedAnalyses.has(analysis.analysisId),
      },
      actions: [
        {
          element: (
            <Button
              type="button"
              startIcon={<Icon color="action" className="fa fa-trash" />}
              onClick={async () => {
                const answer = await confirm(
                  'Delete selected analyses',
                  'Are you sure you want to delete selected analyses?'
                );
                if (answer) {
                  deleteAnalyses(selectedAnalyses);
                  setSelectedAnalyses(new Set());
                }
              }}
              disabled={selectedAnalyses.size === 0}
            >
              Delete selected analyses
            </Button>
          ),
        },
        {
          element: (
            <Button
              type="button"
              startIcon={<Icon color="action" className="fa fa-trash" />}
              onClick={async () => {
                const answer = await confirm(
                  'Delete selected analyses',
                  'Are you sure you want to delete selected analyses?'
                );
                if (answer) {
                  removeUnpinned();
                }
              }}
              disabled={pinnedAnalyses.length === 0}
            >
              Delete unpinned analyses
            </Button>
          ),
        },
        {
          element: (
            <Toggle
              label="Sort pinned to top"
              labelPosition="right"
              value={sortPinned}
              onChange={setSortPinned}
              disabled={pinnedAnalyses.length === 0}
              styleOverrides={{ container: { marginLeft: '1em' } }}
              themeRole="primary"
            />
          ),
        },
      ],
      eventHandlers: {
        onSort: (column: any, direction: any) => {
          setTableSort([column.key, direction]);
        },
        onRowSelect: ({ analysis }: AnalysisAndDataset) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            newSet.add(analysis.analysisId);
            return newSet;
          }),
        onRowDeselect: ({ analysis }: AnalysisAndDataset) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            newSet.delete(analysis.analysisId);
            return newSet;
          }),
        onMultipleRowSelect: (entries: AnalysisAndDataset[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const entry of entries) newSet.add(entry.analysis.analysisId);
            return newSet;
          }),
        onMultipleRowDeselect: (entries: AnalysisAndDataset[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const entry of entries)
              newSet.delete(entry.analysis.analysisId);
            return newSet;
          }),
      },
      uiState: {
        sort: {
          columnKey: tableSort[0],
          direction: tableSort[1],
        },
      },
      columns: [
        {
          key: 'id',
          name: ' ',
          width: '2.75em',
          renderCell: (data: { row: AnalysisAndDataset }) => (
            <Tooltip
              title={
                isPinnedAnalysis(data.row.analysis.analysisId)
                  ? 'Remove from pinned analyses'
                  : 'Add to pinned analyses'
              }
            >
              <FormControlLabel
                control={
                  <MaterialCheckbox
                    size="small"
                    icon={
                      <Icon
                        style={{ color: '#aaa' }}
                        className="fa fa-thumb-tack"
                      />
                    }
                    checkedIcon={
                      <Icon color="primary" className="fa fa-thumb-tack" />
                    }
                    checked={isPinnedAnalysis(data.row.analysis.analysisId)}
                    onChange={(e) => {
                      if (e.target.checked)
                        addPinnedAnalysis(data.row.analysis.analysisId);
                      else removePinnedAnalysis(data.row.analysis.analysisId);
                    }}
                  />
                }
                label=""
              />
            </Tooltip>
          ),
        },
        ...(studyId
          ? []
          : [
              {
                key: 'study',
                name: 'Study',
                sortable: true,
                renderCell: (data: { row: AnalysisAndDataset }) => {
                  const { dataset } = data.row;
                  if (dataset == null) return UNKNOWN_DATASET_NAME;
                  return safeHtml(dataset.displayName);
                },
              },
            ]),
        {
          key: 'name',
          name: 'Analysis',
          sortable: true,
          style: { maxWidth: '200px' },
          renderCell: (data: { row: AnalysisAndDataset }) => {
            const analysisId = data.row.analysis.analysisId;
            const displayName = data.row.analysis.displayName;

            return (
              <div style={{ display: 'block', maxWidth: '100%' }}>
                <SaveableTextEditor
                  key={analysisId}
                  value={displayName}
                  displayValue={(value) => (
                    <Link
                      to={
                        studyId
                          ? data.row.analysis.analysisId
                          : Path.join(
                              history.location.pathname,
                              data.row.analysis.studyId,
                              data.row.analysis.analysisId
                            )
                      }
                    >
                      {value}
                    </Link>
                  )}
                  onSave={(newName) => {
                    if (newName) {
                      updateAnalysis(analysisId, { displayName: newName });
                    }
                  }}
                  maxLength={ANALYSIS_NAME_MAX_LENGTH}
                />
                {data.row.analysis.analysisId === activeAnalysisId ? (
                  <>
                    &nbsp;&nbsp;<em>(currently viewing)</em>
                  </>
                ) : null}
                {data.row.analysis.provenance != null && (
                  <>
                    <br />
                    <br />
                    {makeOnImportProvenanceString(
                      data.row.analysis.creationTime,
                      data.row.analysis.provenance
                    )}
                    <br />
                    <br />
                    {makeCurrentProvenanceString(data.row.analysis.provenance)}
                  </>
                )}
              </div>
            );
          },
        },
        {
          key: 'description',
          name: 'Description',
          sortable: true,
          style: { maxWidth: '300px' },
          renderCell: (data: { row: AnalysisAndDataset }) => {
            const analysisId = data.row.analysis.analysisId;
            const descriptionStr = data.row.analysis.description || '';

            return user &&
              exampleAnalysesAuthors &&
              exampleAnalysesAuthors.includes(user.id) ? (
              <div style={{ display: 'block', maxWidth: '100%' }}>
                <SaveableTextEditor
                  key={analysisId}
                  multiLine
                  rows={Math.max(2, descriptionStr.length / 30)}
                  value={descriptionStr}
                  onSave={(newDescription) => {
                    updateAnalysis(analysisId, { description: newDescription });
                  }}
                />
              </div>
            ) : (
              <OverflowingTextCell key={analysisId} value={descriptionStr} />
            );
          },
        },
        {
          key: 'isPublic',
          name: 'Public',
          width: 100,
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) => {
            const isPublic = data.row.analysis.isPublic;
            const studyAccessLevel = data.row.dataset?.studyAccess;
            const offerPublicityToggle =
              data.row.dataset?.canMakePublic &&
              (studyAccessLevel === 'public' ||
                studyAccessLevel === 'protected' ||
                studyAccessLevel === 'controlled' ||
                studyAccessLevel == null);

            return (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip
                  title={
                    !offerPublicityToggle
                      ? 'This study cannot be added to Public Analyses'
                      : isPublic
                      ? 'Remove this analysis from Public Analyses'
                      : 'Add this analysis to Public Analyses'
                  }
                >
                  <span>
                    {!offerPublicityToggle ? (
                      <InfoIcon htmlColor={colors.gray['300']} />
                    ) : (
                      <Checkbox
                        selected={isPublic}
                        themeRole="primary"
                        onToggle={(selected) => {
                          if (selected) {
                            setSelectedAnalysisId(data.row.analysis.analysisId);
                            setSharingModalVisible(true);
                          } else {
                            updateAnalysis(data.row.analysis.analysisId, {
                              isPublic: false,
                            });
                          }
                        }}
                        styleOverrides={{ size: 16 }}
                      />
                    )}
                  </span>
                </Tooltip>
              </div>
            );
          },
        },
        {
          key: 'creationTime',
          name: 'Created',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) =>
            data.row.analysis.creationTimeDisplay,
        },
        {
          key: 'modificationTime',
          name: 'Modified',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) =>
            data.row.analysis.modificationTimeDisplay,
        },
      ],
    }),
    [
      sortPinned,
      filteredAnalysesAndDatasets,
      tableSort,
      selectedAnalyses,
      pinnedAnalyses.length,
      isPinnedAnalysis,
      datasets,
      analyses,
      deleteAnalyses,
      updateAnalysis,
      removeUnpinned,
      setSortPinned,
      setTableSort,
      history.location.pathname,
      addPinnedAnalysis,
      removePinnedAnalysis,
      exampleAnalysesAuthors,
      user,
      studyId,
      activeAnalysisId,
    ]
  );

  useSetDocumentTitle(updateDocumentTitle ? 'My Analyses' : document.title);

  return (
    <div className={classes.root}>
      <ShareFromAnalysesList
        analysis={
          analysesAndDatasets?.find(
            (potentialMatch) =>
              potentialMatch.analysis.analysisId === selectedAnalysisId
          )?.analysis
        }
        updateAnalysis={updateAnalysis}
        visible={sharingModalVisible}
        toggleVisible={setSharingModalVisible}
        showLoginForm={showLoginForm}
      />

      <h1>My Analyses</h1>
      {(loading || datasets == null || analyses == null || user == null) && (
        <Loading style={{ position: 'absolute', left: '50%', top: '1em' }} />
      )}
      {error && <ContentError>{error}</ContentError>}
      {analyses && datasets && user ? (
        <Mesa.Mesa state={tableState}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1ex',
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              label="Search analyses"
              inputProps={{ size: 50 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear search text"
                      onClick={() => setSearchText('')}
                      style={{
                        visibility:
                          debouncedSearchText.length > 0 ? 'visible' : 'hidden',
                      }}
                      edge="end"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={searchText}
              onChange={onFilterFieldChange}
            />
            <span>
              Showing {filteredAnalysesAndDatasets?.length} of {analyses.length}{' '}
              analyses
            </span>
          </div>
        </Mesa.Mesa>
      ) : null}
    </div>
  );
}
