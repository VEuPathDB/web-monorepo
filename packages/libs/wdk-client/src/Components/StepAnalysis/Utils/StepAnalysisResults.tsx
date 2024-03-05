import React from 'react';
import { numericValue } from '@veupathdb/coreui/lib/components/Mesa/Utils/Utils';
import { WDKClientTooltip } from '../../../Components';

export const numberRenderFactory =
  (exponential: boolean) =>
  (precision: number) =>
  (key: string) =>
  ({ row }: { row: Record<string, string> }) =>
    (
      <div>
        {exponential ? (
          <WDKClientTooltip content={row[key]}>
            <div>{numericValue(row[key]).toExponential(precision)}</div>
          </WDKClientTooltip>
        ) : (
          numericValue(row[key]).toFixed(precision)
        )}
      </div>
    );

export const decimalCellFactory = numberRenderFactory(false);
export const integerCell = decimalCellFactory(0);
export const scientificCellFactory = numberRenderFactory(true);
