import React from 'react';
import { RouteComponentProps } from 'react-router';

import UserCommentFormController from './controllers/UserCommentFormController';
import UserCommentShowController from './controllers/UserCommentShowController';

import { RouteEntry, parseQueryString } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

export const userCommentRoutes: RouteEntry[] = [
    {
        path: '/user-comments/add',
        requiresLogin: true,
        component: (props: RouteComponentProps<{}>) => {
          const parsedProps = parseUserCommentQueryString(props);
          return (
            <UserCommentFormController {...parsedProps} />
          );
        }
    },

    {
        path: '/user-comments/edit',
        requiresLogin: true,
        component: (props: RouteComponentProps<{}>) => {
          const parsedProps = parseUserCommentQueryString(props);
          return (
            <UserCommentFormController {...parsedProps} />
          );
        }
      },
    
      {
        path: '/user-comments/show',
        component: (props: RouteComponentProps<{}>) => {
          const { stableId = '', commentTargetId = '' } = parseQueryString(props);
          const initialCommentId = parseInt((props.location.hash || '#').slice(1)) || undefined;
    
          return (
            <UserCommentShowController
              targetId={stableId}
              targetType={commentTargetId}
              initialCommentId={initialCommentId}
            />
          );
        }
      },
];
  
function parseUserCommentQueryString(props: RouteComponentProps<{}>) {
    const {
      commentId: stringCommentId,
      commentTargetId: targetType,
      stableId: targetId,
      externalDbName,
      externalDbVersion,
      organism,
      locations,
      contig,
      strand
    } = parseQueryString(props);
  
    const commentId = parseInt(stringCommentId || '') || undefined;
    const target = targetId && targetType
      ? { id: targetId, type: targetType }
      : undefined;
    const externalDatabase = externalDbName && externalDbVersion
      ? { name: externalDbName, version: externalDbVersion }
      : undefined;
  
    return {
      commentId,
      target,
      externalDatabase,
      organism,
      locations,
      contig,
      strand
    };
  }