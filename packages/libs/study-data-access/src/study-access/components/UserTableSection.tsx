import React from 'react';

import { cx } from './StudyAccess';
import {
  UserTable,
  UserTableColumnKey,
  Props as UserTableProps
} from './UserTable';

export type Props<R, C extends UserTableColumnKey<R>> =
  | {
      status: 'loading';
    }
  | {
      status: 'error';
      message: string;
    }
  | {
      status: 'unavailable';
    }
  | {
      status: 'success';
      title: React.ReactNode;
      value: UserTableProps<R, C>;
    };

export function UserTableSection<R, C extends UserTableColumnKey<R>>(props: Props<R, C>) {
  return props.status === 'loading' || props.status === 'unavailable'
    ? null
    : props.status === 'error'
    ? <p>{props.message}</p>
    : <details className={cx('--UserTableSection')} open>
        <summary>{props.title}</summary>
        <UserTable {...props.value} />
      </details>;
}
