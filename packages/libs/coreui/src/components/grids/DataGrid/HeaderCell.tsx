import { ReactNode } from 'react';
import { pickBy } from 'lodash';
import { HeaderGroup } from 'react-table';

import CaretDownIcon from '../../../assets/icons/CaretDown';
import CaretUpIcon from '../../../assets/icons/CaretUp';
import typography from '../../../styleDefinitions/typography';

import { DataGridStyleSpec } from './stylePresets';

type HeaderCellProps = {
  headerGroup: HeaderGroup;
  styleSpec: DataGridStyleSpec;
  sortable: boolean;
  extraHeaderControls?: Array<(headerGroup: HeaderGroup) => ReactNode>;
};

/** Render an individual header cell. */
export default function HeaderCell({
  headerGroup,
  styleSpec,
  sortable,
  extraHeaderControls = [],
}: HeaderCellProps) {
  const borderCSSOverrides = pickBy(
    styleSpec.headerCells,
    (value, key) => key.includes('border') || key.includes('background')
  );

  const otherCSSOverrides = pickBy(
    styleSpec.headerCells,
    (value, key) => !key.includes('border') && !key.includes('background')
  );

  /** Sorting controls are added to each column when requested by the user.*/
  const renderSortingControls = (column: HeaderGroup<object>) =>
    sortable && (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginLeft: 15,
        }}
      >
        <CaretUpIcon
          color={
            column.isSorted && !column.isSortedDesc
              ? styleSpec.icons.activeColor
              : styleSpec.icons.inactiveColor
          }
        />
        <CaretDownIcon
          extraCSS={{ marginTop: 2 }}
          color={
            column.isSorted && column.isSortedDesc
              ? styleSpec.icons.activeColor
              : styleSpec.icons.inactiveColor
          }
        />
      </div>
    );

  return (
    <th
      {...headerGroup.getHeaderProps()}
      {...(sortable && headerGroup.getSortByToggleProps({
        title: 'Click to toggle sorting and Shift-Click to multi-sort'
      }))}
      css={{
        padding: 0, verticalAlign: 'bottom', height: '100%', ...borderCSSOverrides
      }}
    >
      <div
        css={[
          typography.th,
          {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            textAlign: 'left',
            userSelect: 'none',
          },
          otherCSSOverrides,
          (headerGroup.id === 'selection' || extraHeaderControls.length) && {
            paddingLeft: 10,
            paddingRight: 10,
            margin: 0,
          },
        ]}
      >
        {headerGroup.render('Header')}
        {renderSortingControls(headerGroup)}
        {extraHeaderControls.map((component) => component(headerGroup))}
      </div>
    </th>
  );
}
