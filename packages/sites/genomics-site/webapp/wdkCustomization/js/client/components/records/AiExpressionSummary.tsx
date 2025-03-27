import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  CollapsibleSection,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';
import { Props } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';

import { DefaultSectionTitle } from '@veupathdb/wdk-client/lib/Views/Records/SectionTitle';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { isGenomicsService } from '../../wrapWdkService';
import {
  AiExpressionSummary,
  AiExpressionSummaryResponse,
  AiExpressionSummarySection,
  AiExperimentSummary,
} from '../../types/aiExpressionTypes';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaStateProps,
  CellProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { RecordActions } from '@veupathdb/wdk-client/lib/Actions';
import { DEFAULT_TABLE_STATE } from '@veupathdb/wdk-client/lib/StoreModules/RecordStoreModule';
import { State as ReduxState } from '@veupathdb/wdk-client/lib/StoreModules/RecordStoreModule';
import { ExpressionChildRow as ExpressionGraph } from './GeneRecordClasses.GeneRecordClass';
import { Dialog } from '@veupathdb/wdk-client/lib/Components';

// Styles
import './AiExpressionSummary.scss';

const MIN_DATASETS_FOR_AI_SUMMARY = 5;
const POLL_TIME_MS = 5000;

/** Display AI Expression Summary UI and results in a collapsible section */
export function AiExpressionSummary(props: Props) {
  const { attribute, record, isCollapsed, onCollapsedChange, title } = props;
  const { displayName, help, name } = attribute;

  const headerContent = title ?? (
    <DefaultSectionTitle displayName={displayName} help={help} />
  );

  const microarrayDatasetCount = props.record.attributes[
    'microarray_dataset_count'
  ]
    ? Number(props.record.attributes['microarray_dataset_count'].toString())
    : 0;
  const rnaseqDatasetCount = props.record.attributes['rnaseq_dataset_count']
    ? Number(props.record.attributes['rnaseq_dataset_count'].toString())
    : 0;
  const datasetCount = microarrayDatasetCount + rnaseqDatasetCount;

  return (
    <CollapsibleSection
      id={name}
      className={`wdk-RecordAttributeSectionItem`}
      headerContent={headerContent}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <ErrorBoundary>
        {record.attributes['ai_expression'] == 'YES' ? (
          datasetCount < MIN_DATASETS_FOR_AI_SUMMARY ? (
            <div>
              The AI Expression Summary feature is not available for genes with
              fewer than {MIN_DATASETS_FOR_AI_SUMMARY} transcriptomics datasets.
            </div>
          ) : (
            <div style={{ minHeight: '8em' }}>
              <AiSummaryGate {...props} />
            </div>
          )
        ) : (
          <div>Sorry, this feature is not currently available.</div>
        )}
      </ErrorBoundary>
    </CollapsibleSection>
  );
}

// If the AI expression summary is cached, render it
// otherwise render a "gate" where the user is given some verbiage
// about the request taking a minute or two and a button to initiate
// the request.

function AiSummaryGate(props: Props) {
  const geneId = props.record.attributes['source_id']?.toString();
  if (geneId == null) throw new Error('geneId should not be missing');

  const [shouldPopulateCache, setShouldPopulateCache] = useState(false);

  const aiExpressionSummary = useAiExpressionSummary(
    geneId,
    shouldPopulateCache
  );
  const geneResponse = aiExpressionSummary?.[geneId];
  const completeExpressionSummary =
    geneResponse?.resultStatus === 'present' && geneResponse?.expressionSummary
      ? geneResponse.expressionSummary
      : undefined;

  const [pollingCounter, setPollingCounter] = useState(-1);
  const pollingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const pollingResponse = useAiExpressionSummary(geneId, false, pollingCounter);

  // update polling counter when the main request is active
  useEffect(() => {
    if (shouldPopulateCache && completeExpressionSummary == null) {
      pollingTimeout.current = setTimeout(
        () => setPollingCounter(pollingCounter + 1),
        POLL_TIME_MS
      );
    }
    return () => clearTimeout(pollingTimeout.current);
  }, [shouldPopulateCache, completeExpressionSummary, pollingCounter]);

  if (aiExpressionSummary == null) {
    return <div>Loading...</div>;
  } else if (completeExpressionSummary) {
    return (
      <AiExpressionResult summary={completeExpressionSummary} {...props} />
    );
  } else if (!shouldPopulateCache) {
    // Cache miss: render button to populate cache
    return (
      <div>
        <p>
          Click below to request an AI summary of this gene. It could take up to
          three minutes. When complete it will be cached for all users.
        </p>
        <button onClick={() => setShouldPopulateCache(true)}>
          Start AI Summary
        </button>

        {/* Debugging: Display cache miss reason if present */}
        <p style={{ color: 'red' }}>
          Debug: resultStatus = {geneResponse?.resultStatus}
        </p>
      </div>
    );
  } else {
    const { numExperiments, numExperimentsComplete } =
      pollingResponse?.[geneId] ?? {};
    const progressString =
      numExperiments != null && numExperimentsComplete != null
        ? `${numExperimentsComplete}/${numExperiments + 1}`
        : '🤖';
    return (
      <div>
        <p>Summarizing...</p>
        <Loading radius={25} className="AiExpressionResult-Loading">
          <span>{progressString}</span>
        </Loading>
      </div>
    );
  }
}

type RowType = AiExpressionSummarySection & { rowId: number };

// Jump through some hoops to connect the redux store
const mapState = (record: ReduxState) => ({
  expressionGraphsTableState:
    record.tableStates?.ExpressionGraphs ?? DEFAULT_TABLE_STATE,
});
const mapDispatch = {
  updateSectionVisibility: RecordActions.updateSectionVisibility,
  updateTableState: RecordActions.updateTableState,
};
const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type AiExpressionResultProps = Props & {
  summary: AiExpressionSummary;
} & PropsFromRedux;

const AiExpressionResult = connector((props: AiExpressionResultProps) => {
  const {
    record,
    summary: { headline, one_paragraph_summary, topics },
  } = props;

  // make a lookup from dataset_id to the experiment info (display_name, assay_type) etc
  const expressionGraphs = record.tables['ExpressionGraphs'];
  const experiments = expressionGraphs.reduce<
    Record<string, Record<string, AttributeValue>>
  >((result, current) => {
    const dataset_id = current['dataset_id'] as string;
    result[dataset_id] = { ...current };
    return result;
  }, {});

  // make another lookup for dataset_id -> topics[].summaries[]
  const summaries = topics
    .flatMap((topic) => topic.summaries)
    .reduce<Record<string, AiExperimentSummary>>((result, current) => {
      const dataset_id = current['dataset_id'] as string;
      result[dataset_id] = { ...current };
      return result;
    }, {});

  // pre-open the main expression table so the links to it work reliably
  useEffect(() => {
    props.updateSectionVisibility('ExpressionGraphs', true);
  }, []);

  // custom renderer (to handle <i>, <ul>, <li> and <strong> tags, mainly)
  // and provide click to toggle row expansion functionality

  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const RenderCellWithHtmlAndClickHandler = (props: CellProps<RowType>) => {
    const myRowId = props.row.rowId;
    const handleClick = () => {
      setExpandedRows(
        (prevRows) =>
          prevRows.includes(myRowId)
            ? prevRows.filter((id) => id !== myRowId) // Remove if already expanded
            : [...prevRows, myRowId] // Add if not expanded
      );
    };
    return <div onClick={handleClick}>{safeHtml(props.value.toString())}</div>;
  };

  // modal management
  const [modalDatasetId, setModalDatasetId] = useState<string>();

  // Note that `safeHtml()` does NOT sanitise dangerous HTML elements and attributes.
  // for example, this would render and the JavaScript will execute:
  // const danger = `<img src="x" onerror="alert('XSS!')" />`;
  // See https://github.com/VEuPathDB/web-monorepo/issues/1170

  const numberedTopics = topics.map((topic, index) => ({
    ...topic,
    rowId: index,
  }));

  // create the topics table
  const mainTableState: MesaStateProps<RowType> = {
    rows: numberedTopics,
    columns: [
      {
        key: 'headline',
        name: 'Topic',
        renderCell: RenderCellWithHtmlAndClickHandler,
        style: { fontWeight: 'bold' },
      },
      {
        key: 'one_sentence_summary',
        name: 'Summary',
        renderCell: RenderCellWithHtmlAndClickHandler,
        //	style: { maxWidth: '30em' },
      },
      {
        key: 'summaries',
        name: `#\u00A0Datasets`, // non-breaking space
        renderCell: (cellProps) => cellProps.row.summaries.length,
        style: { textAlign: 'right' },
      },
    ],
    options: {
      childRow: (badProps) => {
        // NOTE: the typing of `ChildRowProps` seems wrong
        // as it is called with two args, not one, see
        // https://github.com/VEuPathDB/web-monorepo/blob/d1d03fcd051cd7a54706fe879e4af4b1fc220d88/packages/libs/coreui/src/components/Mesa/Ui/DataCell.jsx#L26
        const rowIndex = badProps as unknown as number;
        const rowData = topics[rowIndex];
        return (
          <ErrorBoundary>
            <div className="ai-topic-heading">
              <span
                className="badge"
                title={`AI-estimated biological importance`}
                aria-label={`Column heading for AI-estimated importance score`}
              >
                Relevance
              </span>
            </div>
            <ul className="ai-topic">
              {rowData.summaries.map(
                ({
                  dataset_id,
                  biological_importance,
                  one_sentence_summary,
                }) => {
                  return (
                    <li key={dataset_id}>
                      <>
                        <a
                          className="javascript-link"
                          onClick={() => setModalDatasetId(dataset_id)}
                        >
                          {experiments[dataset_id].display_name as string}
                        </a>{' '}
                        ({experiments[dataset_id].assay_type})
                        <AiExperimentSummary
                          {...{ biological_importance, one_sentence_summary }}
                        />
                      </>
                    </li>
                  );
                }
              )}
            </ul>
          </ErrorBoundary>
        );
      },
      getRowId: (row) => row.rowId,
    },
    eventHandlers: {
      onExpandedRowsChange: (rowIndexes) => setExpandedRows(rowIndexes),
    },
    uiState: {
      expandedRows,
    },
  };

  return (
    <div className="ai-generated">
      <ExpressionGraphModal
        open={modalDatasetId != null}
        onClose={() => setModalDatasetId(undefined)}
        experiments={experiments}
        summaries={summaries}
        datasetId={modalDatasetId}
      />
      <div
        className="ai-summary"
        style={{ marginLeft: '15px', maxWidth: '50em' }}
      >
        {safeHtml(headline, undefined, 'h4')}
        {safeHtml(one_paragraph_summary, undefined, 'p')}
        <p>
          <i>
            The results from {expressionGraphs.length} experiments have been
            organized into the {topics.length} topics below. The AI was
            instructed to present the most biologically relevant information
            first. As this method is still evolving, results may vary.
          </i>
        </p>
      </div>
      <Mesa state={mainTableState} />
    </div>
  );
});

interface AiExperimentSummaryProps {
  biological_importance: number;
  one_sentence_summary: string;
}

function AiExperimentSummary({
  biological_importance,
  one_sentence_summary,
}: AiExperimentSummaryProps) {
  return (
    <div>
      <span
        className="badge"
        title={`AI-estimated biological importance: ${biological_importance}/5`}
        aria-label={`Importance score: ${biological_importance} out of 5`}
      >
        {biological_importance}
      </span>
      <span className="ai-one-sentence-summary">
        {safeHtml(one_sentence_summary)}
      </span>
    </div>
  );
}

function useAiExpressionSummary(
  geneId: string,
  shouldPopulateCache: boolean,
  pollingCounter: number = 0
): AiExpressionSummaryResponse | undefined {
  return useWdkService(
    async (wdkService) => {
      if (!isGenomicsService(wdkService)) throw new Error('nasty');
      if (pollingCounter < 0) return undefined;
      const { projectId } = await wdkService.getConfig();
      const answerSpec = {
        searchName: 'single_record_question_GeneRecordClasses_GeneRecordClass',
        searchConfig: {
          parameters: {
            primaryKeys: `${geneId},${projectId}`,
          },
        },
      };
      const formatting = {
        format: 'aiExpression',
        formatConfig: {
          populateIfNotPresent: shouldPopulateCache,
        },
      };
      return await wdkService.getAnswer<AiExpressionSummaryResponse>(
        answerSpec,
        formatting
      );
    },
    [geneId, shouldPopulateCache, pollingCounter]
  );
}

interface ExpressionGraphModalProps {
  open: boolean;
  onClose: () => void;
  experiments: Record<string, Record<string, AttributeValue>>;
  summaries: Record<string, AiExperimentSummary>;
  datasetId: string | undefined;
}

export function ExpressionGraphModal({
  open,
  onClose,
  experiments,
  summaries,
  datasetId,
}: ExpressionGraphModalProps) {
  if (datasetId != null) {
    const rowData = experiments[datasetId];
    const title = rowData.display_name;
    const summary = summaries[datasetId];

    if (rowData != null && summary != null) {
      return (
        <Dialog
          open={open}
          resizable
          draggable
          onClose={onClose}
          title={<div className="ai-floater-header">{title?.toString()}</div>}
          className="ai-expression-graph-modal"
        >
          <section className="ai-generated">
            <h4>AI summary</h4>
            <AiExperimentSummary {...summary} />
          </section>
          <section>
            <h4>Experimental data</h4>
            <ExpressionGraph rowData={rowData} />
          </section>
        </Dialog>
      );
    }
  }
  return null;
}
