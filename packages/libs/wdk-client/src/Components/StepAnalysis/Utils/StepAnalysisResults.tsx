import React from 'react';
import { numericValue } from '../../Mesa/Utils/Utils';
import { Tooltip } from '../../../Components';

export const numberRenderFactory =
  (exponential: boolean) =>
  (precision: number) =>
  (key: string) =>
  ({ row }: { row: Record<string, string> }) =>
    (
      <div>
        {exponential ? (
          <Tooltip content={row[key]}>
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
