import { useCallback, useContext } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { makePreferredOrganismsRecoilState } from '../utils/preferredOrganisms';

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

export function useNewOrganisms() {
  const { newOrganisms } = usePreferredOrganismsRecoilState();

  return useRecoilValue(newOrganisms);
}

export function usePreferredSpecies() {
  const { preferredSpecies } = usePreferredOrganismsRecoilState();

  return useRecoilValue(preferredSpecies);
}

export function useSavePreferredOrganisms(newPreferredOrganisms: string[]) {
  const {
    buildNumber,
    organismPreference,
  } = usePreferredOrganismsRecoilState();

  const buildNumberValue = useRecoilValue(buildNumber);
  const setOrganismPreference = useSetRecoilState(organismPreference);

  return useCallback(() => {
    setOrganismPreference({
      organisms: newPreferredOrganisms,
      buildNumber: buildNumberValue,
    });
  }, [buildNumberValue, newPreferredOrganisms, setOrganismPreference]);
}

export function usePreferredOrganismsEnabledState() {
  const { preferredOrganismsEnabled } = usePreferredOrganismsRecoilState();

  return useRecoilState(preferredOrganismsEnabled);
}

export function useTogglePreferredOrganisms() {
  const { preferredOrganismsEnabled } = usePreferredOrganismsRecoilState();

  const setPreferredOrganismsEnabled = useSetRecoilState(
    preferredOrganismsEnabled
  );

  return useCallback(() => {
    setPreferredOrganismsEnabled(
      (preferredOrganismsEnabled) => !preferredOrganismsEnabled
    );
  }, [setPreferredOrganismsEnabled]);
}

export function usePreferredOrganismsRecoilState() {
  const wdkDependencies = useContext(WdkDepdendenciesContext);

  return makePreferredOrganismsRecoilState(wdkDependencies);
}
