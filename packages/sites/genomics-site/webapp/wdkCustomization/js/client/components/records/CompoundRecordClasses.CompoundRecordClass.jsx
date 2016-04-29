import {Component} from 'react';
import {CollapsibleSection} from 'wdk-client/Components';
import {CompoundStructure} from '../common/Compound';

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
    return (
      <div className="eupathdb-CompoundStructures">
        <div>
          <CompoundStructure moleculeText={this.props.value[0].structure}/>
        </div>
        <CollapsibleSection
          headerContent="Alternate compound structures"
          onCollapsedChange={this.toggleOther}
          isCollapsed={!this.state.otherVisible}
          className="eupathdb-OtherCompoundStructures"
        >
          {this.props.value.slice(1).map(value => {
            return (
              <CompoundStructure key={value.struct_num} moleculeText={value.structure}/>
            );
          })}
          </CollapsibleSection>
      </div>
    );
  }
}
