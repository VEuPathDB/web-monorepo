import React from 'react';

import { Redirect, RouteComponentProps } from 'react-router';

import { BlastWorkspace } from '@veupathdb/multi-blast/lib/components/BlastWorkspace';
import { BlastWorkspaceResult } from '@veupathdb/multi-blast/lib/components/BlastWorkspaceResult';
import { parseBlastResultSubpath } from '@veupathdb/multi-blast/lib/utils/routes';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

export const blastRoutes: RouteEntry[] = [
  {
    path: '/workspace/blast/:tab(new|all|help)?',
    component: BlastWorkspace,
    requiresLogin: true,
  },
  {
    path:
      '/workspace/blast/result/:jobId/:subPath(combined|individual/\\d+)?',
    component: (
      props: RouteComponentProps<{
        jobId: string;
        subPath: string | undefined;
      }>
    ) => {
      const selectedResult = parseBlastResultSubpath(
        props.match.params.subPath
      );

      return selectedResult != null && selectedResult.type === 'unknown' ? (
        <NotFoundController />
      ) : (
        <BlastWorkspaceResult
          jobId={props.match.params.jobId}
          selectedResult={selectedResult}
        />
      );
    },
    requiresLogin: true,
  },
  {
    path: '/search/transcript/GenesByMultiBlast',
    component: () => <Redirect to="/workspace/blast" />,
  }
];
