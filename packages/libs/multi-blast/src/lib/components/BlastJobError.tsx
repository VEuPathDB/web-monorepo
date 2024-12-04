import React from 'react';

import {
  Error as ErrorPage,
  Link,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';
import { LongJobResponse } from '../utils/ServiceTypes';
import { useBlastApi } from '../hooks/api';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

interface Props {
  job: LongJobResponse;
}

export function BlastJobError(props: Props) {
  const { job } = props;
  const blastApi = useBlastApi();
  const jobErrorResult = usePromise(() => {
    return blastApi.fetchJobError(job.id);
  }, [blastApi, job]);

  if (jobErrorResult.loading) {
    return <Loading />;
  }

  return (
    <ErrorPage>
      <div style={{ fontSize: 'larger' }}>
        {jobErrorResult.value && (
          <Banner
            banner={{
              type: 'error',
              message: jobErrorResult.value,
            }}
          />
        )}
        <p>
          Your job did not run successfully. Please{' '}
          <Link
            target="_blank"
            to={{
              pathname: '/contact-us',
              search: new URLSearchParams({
                ctx: 'multi-blast job ' + job.id,
              }).toString(),
            }}
          >
            contact us
          </Link>{' '}
          for support.
        </p>
      </div>
    </ErrorPage>
  );
}
