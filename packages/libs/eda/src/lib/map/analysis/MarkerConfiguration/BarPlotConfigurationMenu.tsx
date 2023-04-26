import { H6 } from '@veupathdb/coreui';
import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';

interface Props extends InputVariablesProps {
  selectedPlotMode: string;
  onPlotSelected: (plotType: string) => void;
}

export function BarPlotConfigurationMenu({
  entities,
  onChange,
  onPlotSelected,
  selectedPlotMode,
  selectedVariables,
  starredVariables,
  toggleStarredVariable,
}: Props) {
  return (
    <div>
      <H6
        additionalStyles={{
          padding: '10px 25px 10px 25px',
          textAlign: 'center',
        }}
      >
        Configure Bar Plots:
      </H6>
      <p
        style={{
          paddingLeft: 7,
          margin: '5px 0 0 0',
          fontWeight: 'bold',
        }}
      >
        Color:
      </p>
      <InputVariables
        inputs={[{ name: 'overlay', label: 'Variable', titleOverride: ' ' }]}
        entities={entities}
        selectedVariables={selectedVariables}
        onChange={onChange}
        starredVariables={starredVariables}
        toggleStarredVariable={toggleStarredVariable}
      />
      <RadioButtonGroup
        containerStyles={{
          marginTop: 20,
        }}
        label="Plot mode"
        selectedOption={selectedPlotMode || 'count'}
        options={['count', 'proportion']}
        optionLabels={['Count', 'Proportion']}
        buttonColor={'primary'}
        margins={['0em', '0', '0', '1em']}
        onOptionSelected={onPlotSelected}
      />
    </div>
  );
}
