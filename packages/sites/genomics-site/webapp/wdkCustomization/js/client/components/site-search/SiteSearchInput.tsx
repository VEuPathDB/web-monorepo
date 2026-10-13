import React from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { DatasetParam } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { Props } from '@veupathdb/web-common/lib/components/SiteSearch/SiteSearchInput';

export function SiteSearchInput(DefaultComponent: React.ComponentType<Props>) {
  return function GenomicsSiteSearchInput(props: Props) {
    const placeholderText = useWdkService(async (wdkService) => {
      const placeholderPrefix = 'Site search, e.g. ';
      const trivialExample = '"binding protein"';

      // no real-world examples for guests
      const user = await wdkService.getCurrentUser().catch(() => undefined);
      if (!user || user.isGuest) return placeholderPrefix + trivialExample;

      const [idSearch, textSearch] = await Promise.all([
        wdkService
          .getQuestionAndParameters('GeneByLocusTag')
          .catch(() => undefined),
        wdkService
          .getQuestionAndParameters('GenesByText')
          .catch(() => undefined),
      ]);
      const id = idSearch?.parameters.find(
        (p): p is DatasetParam => p.name === 'ds_gene_ids'
      )?.defaultIdList;
      const text = textSearch?.parameters.find(
        (p) => p.name === 'text_expression'
      )?.initialDisplayValue;
      const examples = [id, text, trivialExample].filter((v) => v).join(' or ');
      return placeholderPrefix + examples;
    }, []);

    return <DefaultComponent {...props} placeholderText={placeholderText} />;
  };
}
