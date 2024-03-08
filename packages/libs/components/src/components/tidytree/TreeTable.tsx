import React, { useMemo } from 'react'; // import React seems to be needed
import {
  HorizontalDendrogram,
  HorizontalDendrogramProps,
} from '../../components/tidytree/HorizontalDendrogram';
import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import { MesaStateProps } from '../../../../coreui/lib/components/Mesa/types';
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
  const { rows } = props.tableProps;

  const rowStyleClassName = useMemo(
    () =>
      cx(
        classNameStyle`
          height: ${rowHeight}px;

          & td {
            max-width: 0;
            max-height: ${rowHeight}px; /* Match the row height for consistency */
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            /* Add a basic tooltip to encourage hover to reveal the 'title' attribute */
            &:hover {
              cursor: pointer;
              position: relative;
            }
          }
	`
      ),
    [rowHeight]
  );

  // tableState is just the tableProps with an extra CSS class
  // to make sure the height is consistent with the tree
  const tableState: MesaStateProps<RowType> = {
    ...props.tableProps,
    options: {
      ...props.tableProps.options,
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
      <div
        style={{
          flexGrow: 1,
          width: 1 /* arbitrary non-zero width seems necessary for flex */,
        }}
      >
        <Global
          styles={globalStyle`
	  .DataTable {
	    margin-bottom: 0px !important;
            width: 80%;
	  }
	`}
        />
        <Mesa state={tableState} />
      </div>
    </div>
  );
}
