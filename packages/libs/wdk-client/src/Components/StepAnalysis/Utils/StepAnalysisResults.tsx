import React from 'react';
import { numericValue } from '@veupathdb/coreui/lib/components/Mesa/Utils/Utils';
import { Tooltip } from '@veupathdb/coreui';

export const numberRenderFactory =
  (exponential: boolean) =>
  (precision: number) =>
  (key: string) =>
  ({ row }: { row: Record<string, string> }) =>
    (
      <div>
        {exponential ? (
          <Tooltip title={row[key]}>
            <div>{numericValue(row[key]).toExponential(precision)}</div>
          </Tooltip>
        ) : (
          numericValue(row[key]).toFixed(precision)
        )}
      </div>
    );

export const decimalCellFactory = numberRenderFactory(false);
export const integerCell = decimalCellFactory(0);
export const scientificCellFactory = numberRenderFactory(true);
