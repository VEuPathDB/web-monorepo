import React from 'react';
import {
  CollapsibleSection,
  RecordAttribute,
} from '@veupathdb/wdk-client/lib/Components';
import { Props } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';

import { DefaultSectionTitle } from '@veupathdb/wdk-client/lib/Views/Records/SectionTitle';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { isGenomicsService } from '../../wrapWdkService';
import {
  AnswerSpec,
  StandardReportConfig,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { AiExpressionSummaryResponse } from '../../types/aiExpressionTypes';
import { AnswerFormatting } from '@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService';

/** Display AI Expression Summary UI and results in a collapsible section */
export function AiExpressionSummary(props: Props) {
  const {
    attribute,
    record,
    recordClass,
    isCollapsed,
    onCollapsedChange,
    title,
  } = props;
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
          <CacheGate {...props} />
        ) : (
          <div>Sorry, this feature is not currently available.</div>
        )}
      </ErrorBoundary>
    </CollapsibleSection>
  );
}

// if the AI expression summary is cached, render it
// otherwise render a "gate" where the user is given some verbiage
// about the request taking a minute or two and a button to initiate
// the request.

function CacheGate(props: Props) {
  const geneId = props.record.attributes['source_id']?.toString();
  if (geneId == null) return null;

  const cachedSummary = useAiExpression(geneId, false); // do not populate cache

  return <div>this is going to be the AI summary</div>;
}

function useAiExpression(
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
