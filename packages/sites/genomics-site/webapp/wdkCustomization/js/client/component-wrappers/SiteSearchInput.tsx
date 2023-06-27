import React from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { DatasetParam } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { Props } from '@veupathdb/web-common/lib/components/SiteSearch/SiteSearchInput';
import { siteSearchServiceUrl } from '@veupathdb/web-common/lib/config';

export function SiteSearchInput(DefaultComponent: React.ComponentType<Props>) {
  return function () {
    const placeholderText = useWdkService(async (wdkService) => {
      const [idSearch, textSearch] = await Promise.all([
        wdkService.getQuestionAndParameters('GeneByLocusTag').catch(),
        wdkService.getQuestionAndParameters('GenesByText').catch(),
      ]);
      const id = idSearch?.parameters.find(
        (p): p is DatasetParam => p.name === 'ds_gene_ids'
      )?.defaultIdList;
      const text = textSearch?.parameters.find(
        (p) => p.name === 'text_expression'
      )?.initialDisplayValue;
      const examples = [id, text, `"binding protein"`]
        .filter((v) => v)
        .join(' or ');
      return 'Site search, e.g. ' + examples;
    }, []);

    return (
      <DefaultComponent
        placeholderText={placeholderText}
        siteSearchURL={siteSearchServiceUrl}
      />
    );
  };
}
