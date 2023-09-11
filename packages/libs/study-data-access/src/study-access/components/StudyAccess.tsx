import React from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { UserTableDialog } from './UserTableDialog';
import { UserTableSection } from './UserTableSection';
import {
  EndUserTableSectionConfig,
  HistoryTableSectionConfig,
  OpenDialogConfig,
  ProviderTableSectionConfig,
  StaffTableSectionConfig,
} from '../studyAccessHooks';

import './StudyAccess.scss';

interface Props {
  title: React.ReactNode;
  staffTableConfig: StaffTableSectionConfig;
  providerTableConfig: ProviderTableSectionConfig;
  endUserTableConfig: EndUserTableSectionConfig;
  historyTableConfig: HistoryTableSectionConfig;
  openDialogConfig?: OpenDialogConfig;
}

export const cx = makeClassNameHelper('StudyAccess');

export function StudyAccess({
  title,
  staffTableConfig,
  providerTableConfig,
  endUserTableConfig,
  historyTableConfig,
  openDialogConfig,
}: Props) {
  return (
    <div className={cx()}>
      <div className={cx('--TitleLine')}>
        <h1>{title}</h1>
      </div>
      <UserTableSection {...endUserTableConfig} />
      <UserTableSection {...providerTableConfig} />
      <UserTableSection {...historyTableConfig} />
      <UserTableSection {...staffTableConfig} />
      {openDialogConfig && <UserTableDialog {...openDialogConfig} />}
    </div>
  );
}
