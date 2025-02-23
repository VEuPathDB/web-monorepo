import React, { useEffect, useState } from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { Props } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';

import { DefaultSectionTitle } from '@veupathdb/wdk-client/lib/Views/Records/SectionTitle';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { isGenomicsService } from '../../wrapWdkService';
import {
  AiExpressionSummary,
  AiExpressionSummaryResponse,
} from '../../types/aiExpressionTypes';

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
            Click below to start an AI summary of this gene. It could take up to
            three minutes.
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

  return <div>🤖 Summarising... 🤖</div>;
}

function AiExpressionResult(props: Props & { summary: AiExpressionSummary }) {
  const headline = props.summary.headline;
  return (
    <div>
      Here are today's headlines:
      <br />
      {headline}
    </div>
  );
}

function useAiExpressionSummary(
  geneId: string,
  shouldPopulateCache: boolean
): AiExpressionSummaryResponse | undefined {
  return useWdkService(async (wdkService) => {
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
        shouldPopulateCache,
      },
    };
    return await wdkService.getAnswer<AiExpressionSummaryResponse>(
      answerSpec,
      formatting
    );
  });
}
