import React from 'react';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { DatasetParam } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { idListToArray } from '@veupathdb/wdk-client/lib/Views/Question/Params/DatasetParamUtils';

import { Props } from '@veupathdb/web-common/lib/components/SiteSearch/SiteSearchInput';

import { WrappedComponentProps } from 'ortho-client/records/Types';

export function SiteSearchInput(DefaultComponent: React.ComponentType<Props>) {
  return function OrthoSiteSearchInput(props: WrappedComponentProps<Props>) {
    const placeholderText = usePlaceholderText();

    return <DefaultComponent {...props} placeholderText={placeholderText} />;
  };
}

function usePlaceholderText() {
  return useWdkService(async wdkService => {
    const [ idExample, textExample ] = await Promise.all([
      fetchIdExample(wdkService).catch(_ => undefined),
      fetchTextExample(wdkService).catch(_ => undefined)
    ]);

    const examples = [ idExample, textExample, `"binding protein"` ].filter(v => v).join(' or ');
    return 'Site search, e.g. ' + examples;
  }, []);
}

async function fetchIdExample(wdkService: WdkService) {
  const groupIdSearch = await wdkService.getQuestionAndParameters('GroupsByNameList');

  const defaultIdList = groupIdSearch.parameters.find((p): p is DatasetParam => p.name === 'group_names')?.defaultIdList;

  const defaultIds = idListToArray(defaultIdList);

  return defaultIds[0];
}

async function fetchTextExample(wdkService: WdkService) {
  const accessionSearch = await wdkService.getQuestionAndParameters('ByAccession');

  const accessionExample = accessionSearch.parameters.find(p => p.name === 'accession')?.initialDisplayValue;

  return accessionExample == null || accessionExample.includes('*')
    ? accessionExample
    : `${accessionExample.slice(0, 10)}*`;
}
