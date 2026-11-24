import { CSSProperties } from 'react';
import { EarlierGroupMark } from '../../derivedVariables/GroupEditingContext';

/*
 * Marks for the Create variables group editor: they show what the groups
 * before the one being edited already select (design §3.1). The filter
 * widgets render these only inside that editor.
 */

const swatchStyle = (color: string): CSSProperties => ({
  display: 'inline-block',
  width: '0.8em',
  height: '0.8em',
  borderRadius: '2px',
  marginRight: '0.3em',
  verticalAlign: 'middle',
  backgroundColor: color,
});

const markStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  marginLeft: '0.6em',
  fontSize: '0.9em',
  color: '#555',
};

/** "in East", "in West" beside a value an earlier group already selects. */
export function EarlierGroupValueMarks({
  marks,
}: {
  marks: EarlierGroupMark[] | undefined;
}) {
  if (marks == null || marks.length === 0) return null;
  return (
    <>
      {marks.map(({ label, color }, index) => (
        <span
          key={`${index}/${label}`}
          style={markStyle}
          title={`Selected by the earlier group ${label}`}
        >
          <span style={swatchStyle(color)} />
          in {label}
        </span>
      ))}
    </>
  );
}

/** A one-line key to the earlier groups' colours on a plot or map. */
export function EarlierGroupsLegend({
  text,
  groups,
}: {
  text: string;
  groups: EarlierGroupMark[];
}) {
  if (groups.length === 0) return null;
  return (
    <div style={{ fontSize: '0.9em', color: '#555' }}>
      {text}{' '}
      {groups.map(({ label, color }, index) => (
        <span
          key={`${index}/${label}`}
          style={{ whiteSpace: 'nowrap', marginRight: '0.8em' }}
        >
          <span style={swatchStyle(color)} />
          {label}
        </span>
      ))}
    </div>
  );
}
