import React, { useState } from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
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
        {record.attributes['ai_expression'] == 'YES' ? (
          <AiSummaryGate {...props} />
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

  if (aiExpressionSummary) {
    if (aiExpressionSummary[geneId]?.cacheStatus === 'hit') {
      const summary = aiExpressionSummary[geneId].expressionSummary;
      return <AiExpressionResult summary={summary} {...props} />;
    } else {
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
    return <div>🤖 Summarising... 🤖</div>;
  } else {
    return <div>Loading...</div>;
  }
}

// Note that `safeHtml()` does NOT sanitise dangerous HTML elements and attributes.
// for example, this would render and the JavaScript will execute:
// const danger = `<img src="x" onerror="alert('XSS!')" />`;
// See https://github.com/VEuPathDB/web-monorepo/issues/1170

function AiExpressionResult(props: Props & { summary: AiExpressionSummary }) {
  const {
    record,
    summary: { headline, one_paragraph_summary, sections },
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

  const renderCell = (props: CellProps<AiExpressionSummarySection>) =>
    safeHtml(props.value.toString());

  // create the sections table
  const mesaState: MesaStateProps<AiExpressionSummarySection> = {
    rows: sections,
    columns: [
      {
        key: 'headline',
        name: 'Section',
        renderCell,
        style: { fontWeight: 'bold' },
      },
      {
        key: 'one_sentence_summary',
        name: 'Summary',
        renderCell,
      },
    ],
    options: {},
  };

  return (
    <div className="ai-generated">
      {safeHtml(headline, undefined, 'h4')}
      <div style={{ maxWidth: '40em' }}>
        {safeHtml(one_paragraph_summary, undefined, 'p')}
      </div>
      <p>
        <i>
          The AI has organized {expressionGraphs.length} experiments into{' '}
          {sections.length} sections, hopefully with the most biologically
          relevant first:
        </i>
      </p>
      <Mesa state={mesaState} />
    </div>
  );
}

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
