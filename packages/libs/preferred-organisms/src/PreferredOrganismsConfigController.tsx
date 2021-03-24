import { useRecoilState, useRecoilValue } from 'recoil';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { PreferredOrganismsConfig } from './lib/components/PreferredOrganismsConfig';

import { organismTree, preferredOrganisms, projectId } from './index';

export function PreferredOrganismsConfigController() {
  useSetDocumentTitle('Configure My Organisms');

  const organismTreeValue = useRecoilValue(organismTree);

  const [preferredOrganismsState, setPreferredOrganismsState] = useRecoilState(
    preferredOrganisms
  );

  const projectIdValue = useRecoilValue(projectId);

  return (
    <PreferredOrganismsConfig
      configSelection={preferredOrganismsState}
      organismTree={organismTreeValue}
      projectId={projectIdValue}
      setConfigSelection={setPreferredOrganismsState}
    />
  );
}
