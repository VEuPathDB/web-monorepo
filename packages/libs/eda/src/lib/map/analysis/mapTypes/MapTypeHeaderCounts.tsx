import { CSSProperties } from 'react';
import { makeEntityDisplayName } from '../../../core/utils/study-metadata';
import { useStudyEntities } from '../../../core';

interface Props {
  outputEntityId: string;
  totalEntityCount?: number;
  totalEntityInSubsetCount?: number;
  visibleEntityCount?: number;
}

const { format } = new Intl.NumberFormat();

export function MapTypeHeaderCounts(props: Props) {
  const {
    outputEntityId,
    totalEntityCount = 0,
    totalEntityInSubsetCount = 0,
    visibleEntityCount = 0,
  } = props;
  const entities = useStudyEntities();
  const outputEntity = entities.find((entity) => entity.id === outputEntityId);
  if (outputEntity == null) return null;
  return (
    <div
      css={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '1.5rem',
        fontSize: '15px',
        th: {
          borderWidth: 0,
          padding: 0,
          margin: 0,
        },
        td: {
          margin: 0,
          padding: '0 0 0 10px',
        },
        'tbody tr td:first-child': {
          textAlign: 'left',
        },
        'tbody tr td:nth-child(2)': {
          textAlign: 'right',
        },
        'tbody tr td:first-child:after': {
          content: '":"',
        },
      }}
      className="MapTypeHeaderCounts"
    >
      <p>{makeEntityDisplayName(outputEntity, true)}</p>
      <LeftBracket
        styles={{
          // Bring closer the content of the righthand side of
          // the bracket.
          marginLeft: 10,
        }}
      />
      <table>
        <thead>
          <tr>{/* <th colSpan={2}>{entityDisplayName}</th> */}</tr>
        </thead>
        <tbody>
          <tr
            title={`There are ${format(
              totalEntityCount
            )} ${makeEntityDisplayName(
              outputEntity,
              totalEntityCount > 1
            )} in the dataset.`}
          >
            <td>All</td>
            <td>{format(totalEntityCount)}</td>
          </tr>
          <tr
            title={`After filtering, there are ${format(
              totalEntityInSubsetCount
            )} ${makeEntityDisplayName(
              outputEntity,
              totalEntityInSubsetCount > 1
            )} in the subset.`}
          >
            <td>Filtered</td>
            <td>{format(totalEntityInSubsetCount)}</td>
          </tr>
          <tr
            title={`${format(visibleEntityCount)} ${makeEntityDisplayName(
              outputEntity,
              visibleEntityCount > 1
            )} are in the current viewport, and have data for the variable displayed on the markers.`}
          >
            <td>View</td>
            <td>{format(visibleEntityCount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type LeftBracketProps = {
  /** Should you need to adjust anything! */
  styles?: CSSProperties;
};
function LeftBracket(props: LeftBracketProps) {
  return (
    <div
      style={{
        border: '1px solid black',
        borderRight: 'none',
        height: '75%',
        width: 5,
        ...props.styles,
      }}
      aria-hidden
    ></div>
  );
}
