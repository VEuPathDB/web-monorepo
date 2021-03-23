import { debounce } from 'lodash';
import { DefaultValue, atom, selector } from 'recoil';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';

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

  const initialOrganismsPreference = selector({
    key: 'initial-organisms-preference',
    get: ({ get }) => fetchPreferredOrganisms(wdkService, get(organismTree)),
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
    organismTree,
    preferredOrganisms,
    projectId,
  };
}
