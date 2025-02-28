import React, { useState } from 'react';
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
import { scrollToAndOpenExpressionGraph } from './utils';

// Styles
import './AiExpressionSummary.scss';

/** Display AI Expression Summary UI and results in a collapsible section */
export function AiExpressionSummary(props: Props) {
  const { attribute, record, isCollapsed, onCollapsedChange, title } = props;
  const { displayName, help, name } = attribute;

  const headerContent = title ?? (
    <DefaultSectionTitle displayName={displayName} help={help} />
  );

  return (
    <CollapsibleSection
      id={name}
      className={`wdk-RecordAttributeSectionItem`}
      headerContent={headerContent}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <ErrorBoundary>
        <div style={{ minHeight: '8em' }}>
          {record.attributes['ai_expression'] == 'YES' ? (
            <AiSummaryGate {...props} />
          ) : (
            <div>Sorry, this feature is not currently available.</div>
          )}
        </div>
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

  if (aiExpressionSummary) {
    if (aiExpressionSummary[geneId]?.cacheStatus === 'hit') {
      const summary = aiExpressionSummary[geneId].expressionSummary;
      return <AiExpressionResult summary={summary} {...props} />;
    } else if (!shouldPopulateCache) {
      // Cache miss: render button to populate cache
      return (
        <div>
          <p>
            Click below to request an AI summary of this gene. It could take up
            to three minutes. When complete it will be cached for all users.
          </p>
          <button onClick={() => setShouldPopulateCache(true)}>
            Start AI Summary
          </button>

          {/* Debugging: Display cache miss reason if present */}
          {aiExpressionSummary[geneId]?.reason && (
            <p style={{ color: 'red' }}>
              Debug: Cache miss reason - {aiExpressionSummary[geneId].reason}
            </p>
          )}
        </div>
      );
    }
  }
  if (shouldPopulateCache) {
    return (
      <div>
        <p>🤖 Summarizing... (can take up to three minutes) 🤖</p>
        <Loading />
      </div>
    );
  } else {
    return <div>Loading...</div>;
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
            <ul>
              {rowData.summaries.map((summary) => {
                return (
                  <li
                    key={summary.dataset_id}
                    style={{
                      marginBottom: '0.5em',
                      marginLeft: '4em',
                      marginRight: '4em',
                    }}
                  >
                    <>
                      <a
                        className="javascript-link"
                        onClick={() =>
                          scrollToAndOpenExpressionGraph({
                            expressionGraphs: expressionGraphs,
                            findIndexFn: ({
                              dataset_id,
                            }: {
                              dataset_id: string;
                            }) => dataset_id === summary.dataset_id,
                            tableId: 'ExpressionGraphs',
                            updateSectionVisibility:
                              props.updateSectionVisibility,
                            updateTableState: props.updateTableState,
                            tableState: props.expressionGraphsTableState,
                          })
                        }
                      >
                        {experiments[summary.dataset_id].display_name as string}
                      </a>{' '}
                      ({experiments[summary.dataset_id].assay_type})
                      <br />
                      {safeHtml(summary.one_sentence_summary)}
                    </>
                  </li>
                );
              })}
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

function useAiExpressionSummary(
  geneId: string,
  shouldPopulateCache: boolean
): AiExpressionSummaryResponse | undefined {
  return useWdkService(
    async (wdkService) => {
      if (!isGenomicsService(wdkService)) throw new Error('nasty');
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
    [geneId, shouldPopulateCache]
  );
}
