import React from 'react';

import { OrthoDataTable } from 'ortho-client/components/OrthoDataTable';
import {
  DataTableColumnKey,
  DataTableColumns,
} from 'ortho-client/utils/dataTables';

interface Props<R, C extends DataTableColumnKey<R>> {
  containerClassName?: string;
  header: React.ReactNode;
  rows: R[];
  columns: DataTableColumns<R, C>;
  columnOrder: readonly C[];
}

export function ReleaseSummaryPage<R, C extends DataTableColumnKey<R>>({
  containerClassName,
  header,
  ...tableProps
}: Props<R, C>) {
  const className = containerClassName
    ? `ReleaseSummary ${containerClassName}`
    : 'ReleaseSummary';

  return (
    <div className={className}>
      <h1>{header}</h1>
      <OrthoDataTable {...tableProps} />
    </div>
  );
}
