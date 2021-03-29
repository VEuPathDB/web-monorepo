import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { memoize } from 'lodash';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { makePreferredOrganismsRecoilState } from '../utils/preferredOrganisms';

const memoizedPreferredOrganismsRecoilStateMaker = memoize(
  makePreferredOrganismsRecoilState
);

export function useAvailableOrganisms() {
  const { availableOrganisms } = usePreferredOrganismsRecoilState();

  return useRecoilValue(availableOrganisms);
}

export function useOrganismTree() {
  const { organismTree } = usePreferredOrganismsRecoilState();

  return useRecoilValue(organismTree);
}

export function useProjectId() {
  const { projectId } = usePreferredOrganismsRecoilState();

  return useRecoilValue(projectId);
}

export function usePreferredOrganismsState() {
  const { preferredOrganisms } = usePreferredOrganismsRecoilState();

  return useRecoilState(preferredOrganisms);
}

export function usePreferredOrganismsRecoilState() {
  const wdkDependencies = useContext(WdkDepdendenciesContext);

  return memoizedPreferredOrganismsRecoilStateMaker(wdkDependencies);
}
