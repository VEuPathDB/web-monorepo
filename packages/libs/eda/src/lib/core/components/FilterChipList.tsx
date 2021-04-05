import FilterChip from './FilterChip';
import { SessionState, StudyEntity } from '..';
import { VariableLink } from './VariableLink';

interface Props {
  sessionState: SessionState;
  entities: Array<StudyEntity>;
  selectedEntityId: string;
  selectedVariableId: string;
}

export default function FilterChipList(props: Props) {
  const session = props.sessionState.session;
  if (session && session.filters) {
    return (
      <div>
        {session.filters.map((f) => {
          // <div key={`${f.entityId}_${f.variableId}`}>
          //   <button
          //     type="button"
          //     onClick={() =>
          //       sessionState.setFilters(filters.filter((_f) => _f !== f))
          //     }
          //   >
          //     remove
          //   </button>
          //   <code>{JSON.stringify(f)}</code>
          // </div>
          const entity = props.entities.find((e) => e.id === f.entityId);
          const variable = entity?.variables.find((v) => v.id === f.variableId);

          if (entity && variable) {
            let filterValueDisplay: string;

            switch (f.type) {
              case 'stringSet':
                filterValueDisplay = f.stringSet.join(', ');
                break;
              case 'numberSet':
                filterValueDisplay = f.numberSet.join(', ');
                break;
              case 'dateSet':
                filterValueDisplay = f.dateSet.join(', ');
                break;
              case 'numberRange':
                filterValueDisplay = `from ${f.min} to ${f.max}`;
                break;
              case 'dateRange':
                filterValueDisplay = `from ${f.min} to ${f.max}`;
                break;
              default:
                filterValueDisplay = '';
            }

            return (
              <VariableLink
                entityId={entity.id}
                variableId={variable.id}
                replace={true}
              >
                <FilterChip
                  text={variable.displayName}
                  tooltipText={filterValueDisplay}
                  active={
                    entity?.id === props.selectedEntityId &&
                    variable?.id === props.selectedVariableId
                  }
                  onDelete={() =>
                    props.sessionState.setFilters(
                      session.filters.filter((_f) => _f !== f)
                    )
                  }
                />
              </VariableLink>
            );
          } else {
            return <></>;
          }
        })}
      </div>
    );
  } else {
    return <></>;
  }
}
