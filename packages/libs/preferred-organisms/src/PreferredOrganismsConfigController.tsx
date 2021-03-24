import { useRecoilState, useRecoilValue } from 'recoil';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from './lib/components/PreferredOrganismsConfig';

import {
  organismTreeRecoilValue,
  preferredOrganismsRecoilState,
  projectIdRecoilValue,
} from './index';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('Configure My Organisms');

  const organismTreeValue = useRecoilValue(organismTreeRecoilValue);

  const [preferredOrganismsState, setPreferredOrganismsState] = useRecoilState(
    preferredOrganismsRecoilState
  );

  const projectIdValue = useRecoilValue(projectIdRecoilValue);

  return (
    <PreferredOrganismsConfig
      configSelection={preferredOrganismsState}
      organismTree={organismTreeValue}
      projectId={projectIdValue}
      setConfigSelection={setPreferredOrganismsState}
    />
  );
}
