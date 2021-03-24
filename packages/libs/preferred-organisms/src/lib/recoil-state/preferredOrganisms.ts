import { debounce } from 'lodash';
import { DefaultValue, atom, selector } from 'recoil';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import { findAvailableOrganisms } from '../utils/configTrees';
import {
  fetchOrganismTree,
  fetchPreferredOrganisms,
  updatePreferredOrganisms,
} from '../utils/preferredOrganisms';

export function makePreferredOrganismsRecoilState(wdkService: WdkService) {
  const config = selector({
    key: 'wdk-service-config',
    get: () => wdkService.getConfig(),
  });

  const projectId = selector({
    key: 'project-id',
    get: ({ get }) => get(config).projectId,
  });

  const organismTree = selector({
    key: 'organism-tree',
    get: () => fetchOrganismTree(wdkService),
  });

  const availableOrganisms = selector({
    key: 'available-organisms',
    get: ({ get }) => findAvailableOrganisms(get(organismTree)),
  });

  const initialOrganismsPreference = selector({
    key: 'initial-organisms-preference',
    get: ({ get }) =>
      fetchPreferredOrganisms(wdkService, get(availableOrganisms)),
  });

  const initialPreferredOrganisms = selector({
    key: 'initial-preferred-organisms',
    get: ({ get }) => get(initialOrganismsPreference).organisms,
  });

  const preferredOrganisms = atom({
    key: 'preferred-organisms',
    default: initialPreferredOrganisms,
    effects_UNSTABLE: [
      ({ onSet }) => {
        function onPreferredOrganismsChange(params: string[] | DefaultValue) {
          if (!(params instanceof DefaultValue)) {
            updatePreferredOrganisms(wdkService, params);
          }
        }

        onSet(debounce(onPreferredOrganismsChange, 2000));
      },
    ],
  });

  return {
    availableOrganisms,
    organismTree,
    preferredOrganisms,
    projectId,
  };
}
