import {Component} from 'react';
import {CollapsibleSection} from 'wdk-client/Components';
import {CompoundStructure} from '../common/Compound';
import {renderWithCustomElements} from '../customElements';

export function RecordOverview(props) {
  return renderWithCustomElements(props.record.overview);
}

export function RecordTable(props) {
  return props.table.name === 'Structures' ? <CompoundStructures {...props}/>
                                           : <props.DefaultComponent {...props}/>;
}

/**
 * Render Structures table as 2D drawings of structure.
 */
class CompoundStructures extends Component {
  constructor(props) {
    super(props);
    this.state = { otherVisible: false };
    this.toggleOther = () => {
      this.setState({ otherVisible: !this.state.otherVisible });
    };
  }

  render() {
    let [ primary, ...other ] = this.props.value;
    return (
      <div className="eupathdb-CompoundStructures">
        <div>
          <CompoundStructure>{primary.structure}</CompoundStructure>
        </div>
        {other.length > 0 && (
          <CollapsibleSection
            headerContent="Alternate compound structures"
            onCollapsedChange={this.toggleOther}
            isCollapsed={!this.state.otherVisible}
            className="eupathdb-OtherCompoundStructures"
          >
            {other.map(row => {
              return (
                <CompoundStructure key={row.struct_num}>{row.structure}</CompoundStructure>
              );
            })}
          </CollapsibleSection>
        )}
      </div>
    );
  }
}
