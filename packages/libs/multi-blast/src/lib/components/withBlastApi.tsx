import { useBlastApi } from '../hooks/api';
import { BlastApi } from '../utils/api';

export function withBlastApi<P extends { blastApi: BlastApi }>(
  ComponentWithBlastApi: React.ComponentType<P>
): React.ComponentType<Omit<P, 'blastApi'>> {
  return function ComponentWithoutBlastApi(props: any) {
    const blastApi = useBlastApi();

    return blastApi == null ? null : (
      <ComponentWithBlastApi {...props} blastApi={blastApi} />
    );
  };
}
