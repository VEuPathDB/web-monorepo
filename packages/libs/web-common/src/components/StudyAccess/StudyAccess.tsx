import React from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { UserTableDialog } from 'ebrc-client/components/StudyAccess/UserTableDialog';
import { UserTableSection } from 'ebrc-client/components/StudyAccess/UserTableSection';
import {
  EndUserTableSectionConfig,
  HistoryTableSectionConfig,
  OpenDialogConfig,
  ProviderTableSectionConfig,
  StaffTableSectionConfig
} from 'ebrc-client/hooks/studyAccess';

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
  openDialogConfig
}: Props) {
  return (
    <div className={cx()}>
      <div className={cx('--TitleLine')}>
        <h1>{title}</h1>
      </div>
      <UserTableSection {...endUserTableConfig} />
      <UserTableSection {...providerTableConfig} />
      <UserTableSection {...staffTableConfig} />
      <UserTableSection {...historyTableConfig} />
      {
        openDialogConfig &&
        <UserTableDialog {...openDialogConfig} />
      }
    </div>
  );
}
