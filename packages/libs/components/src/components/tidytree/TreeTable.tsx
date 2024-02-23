import React, { useMemo } from 'react'; // import React seems to be needed
import {
  HorizontalDendrogram,
  HorizontalDendrogramProps,
} from '../../components/tidytree/HorizontalDendrogram';
import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaColumn,
  MesaStateProps,
} from '../../../../coreui/lib/components/Mesa/types';
import { css as classNameStyle, cx } from '@emotion/css';
import { css as globalStyle, Global } from '@emotion/react';

export interface TreeTableProps<RowType> {
  /**
   * number of pixels vertical space for each row of the table and tree
   * (for the table this is a minimum height, so make sure table content doesn't wrap)
   */
  rowHeight: number;
  /**
   * data and options for the tree
   */
  treeProps: Omit<
    HorizontalDendrogramProps,
    'leafCount' | 'options' | 'rowHeight'
  >;
  /**
   * data and options for the table
   */
  tableProps: MesaStateProps<RowType>;
}

/**
 * main props are
 *   data: string;    // Newick format tree
 *   rows: RowType[]; // array of row objects
 *   columns: MesaColumn[]; // column configurations (see Storybook story)
 *   width: number;   // width of the tree
 *   rowHeight: number; // height of rows in table and leaves in tree
 *
 * The tree should have the same number of leaf nodes as rows.length!
 * This is not currently validated by the component.
 *
 * Probably TO DO:
 * - allow additional Mesa props and options to be passed
 */
export default function TreeTable<RowType>(props: TreeTableProps<RowType>) {
  const { rowHeight } = props;
  const { rows, columns, options } = props.tableProps;

  const rowStyleClassName = useMemo(
    () =>
      cx(
        classNameStyle({
          height: rowHeight + 'px',
          background: 'yellow',
        })
      ),
    [rowHeight]
  );

  const tableState: MesaStateProps<RowType> = {
    rows,
    columns,
    options: {
      ...options,
      deriveRowClassName: (_) => rowStyleClassName,
    },
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'row' }}
    >
      <HorizontalDendrogram
        {...props.treeProps}
        rowHeight={rowHeight}
        leafCount={rows.length}
        options={{ margin: [0, 10, 0, 10] }}
      />
      <>
        <Global
          styles={globalStyle`
	  .DataTable {
	    margin-bottom: 0px !important;
	  }
	`}
        />
        <Mesa state={tableState} />
      </>
    </div>
  );
}
