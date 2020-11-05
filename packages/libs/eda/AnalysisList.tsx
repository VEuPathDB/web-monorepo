import * as React from 'react';
import { useHistory } from 'react-router';
import { AnalysisStore } from 'ebrc-client/modules/eda-workspace-core/hooks/useAnalysis';
import { useStudy } from 'ebrc-client/modules/eda-workspace-core/hooks/useStudy';
import { Link } from 'wdk-client/Components';
import Mesa from 'wdk-client/Components/Mesa';
import { Analysis } from 'ebrc-client/modules/eda-workspace-core/types/analysis';

export interface Props {
  analysisStore: AnalysisStore;
}

export function AnalysisList(props: Props) {
  const { analysisStore } = props;
  const { studyRecord } = useStudy();
  const studyId = studyRecord.id.map(part => part.value).join('/');
  const [analysisList, setAnalysisList] = React.useState<Analysis[]>();
  const history = useHistory();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const updateAnalysisList = React.useCallback(async () => {
    const list = await analysisStore.getAnalyses();
    setAnalysisList(list.filter(a => a.studyId === studyId));
  }, [analysisStore, studyId]);
  React.useEffect(() => { updateAnalysisList() }, [updateAnalysisList]);
  const createNewAnalysis = React.useCallback(async () => {
    const newId = await analysisStore.createAnalysis({
      name: 'Unnamed Analysis',
      studyId,
      filters: [],
      starredVariables: [],
      derivedVariables: [],
      visualizations: [],
      variableUISettings: {},
    });
    const newLocation = {
      ...history.location,
      pathname: history.location.pathname +
        (history.location.pathname.endsWith('/') ? '' : '/') +
        newId
    }
    history.push(newLocation);
  }, [analysisStore]);
  const deleteAnalyses = React.useCallback((analysisIds: Iterable<string>) => {
    for (const analysisId of analysisIds) analysisStore.deleteAnalysis(analysisId);
    updateAnalysisList();
  }, [updateAnalysisList]);
  const tableState = React.useMemo(() => ({
    options: {
      isRowSelected: (analysis: Analysis) => selected.has(analysis.id)
    },
    eventHandlers: {
      onRowSelect: (analysis: Analysis) => setSelected(set => {
        const newSet = new Set(set);
        newSet.add(analysis.id);
        return newSet;
      }),
      onRowDeselect: (analysis: Analysis) => setSelected(set => {
        const newSet = new Set(set);
        newSet.delete(analysis.id);
        return newSet;
      }),
      onMultipleRowSelect: (analyses: Analysis[]) => setSelected(set => {
        const newSet = new Set(set);
        for (const analysis of analyses) newSet.add(analysis.id);
        return newSet;
      }),
      onMultipleRowDeselect: (analyses: Analysis[]) => setSelected(set => {
        const newSet = new Set(set);
        for (const analysis of analyses) newSet.delete(analysis.id);
        return newSet;
      }),
    },
    actions: [
      {
        selectionRequired: true,
        element: <button type="button" className="btn" onClick={() => deleteAnalyses(selected)}>Delete selected analyses</button>
      },
      {
        selectionRequired: false,
        element: <button type="button" className="btn" onClick={createNewAnalysis}>Start a new analysis</button>
      }
    ],
    rows: analysisList,
    columns: [
      { key: 'name', name: 'Name', renderCell: (data: { row: Analysis }) => <Link to={data.row.id}>{data.row.name}</Link> },
      { key: 'created', name: 'Created' },
      { key: 'modified', name: 'Modified' },
    ]
  }), [analysisList, createNewAnalysis, deleteAnalyses, selected]);
  if (analysisList == null) return null;
  return (
    <Mesa state={tableState} />
  )
}
