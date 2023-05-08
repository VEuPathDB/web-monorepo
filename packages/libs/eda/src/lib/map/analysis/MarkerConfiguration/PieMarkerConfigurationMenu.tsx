import { H6 } from '@veupathdb/coreui';
import {
  InputVariables,
  Props as InputVariablesProps,
} from '../../../core/components/visualizations/InputVariables';
import { VariableDescriptor } from '../../../core/types/variable';
import { VariablesByInputName } from '../../../core/utils/data-element-constraints';

interface MarkerConfiguration<T extends string> {
  type: T;
}
export interface PieMarkerConfiguration extends MarkerConfiguration<'pie'> {
  selectedVariable: VariableDescriptor;
}
interface Props
  extends Omit<
    InputVariablesProps,
    'onChange' | 'selectedVariables' | 'selectedPlotMode' | 'onPlotSelected'
  > {
  onChange: (configuration: PieMarkerConfiguration) => void;
  configuration: PieMarkerConfiguration;
}

export function PieMarkerConfigurationMenu({
  entities,
  configuration,
  onChange,
  starredVariables,
  toggleStarredVariable,
}: Props) {
  function handleInputVariablesOnChange(selection: VariablesByInputName) {
    if (!selection.overlay) {
      console.error(
        `Expected overlay to defined but got ${typeof selection.overlay}`
      );
      return;
    }

    onChange({
      ...configuration,
      selectedVariable: selection.overlay,
    });
  }

  return (
    <div>
      <H6
        additionalStyles={{
          margin: '15px 12px',
        }}
      >
        Configure Donuts:
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
        showClearSelectionButton={false}
        inputs={[{ name: 'overlay', label: 'Variable', titleOverride: ' ' }]}
        entities={entities}
        selectedVariables={{ overlay: configuration.selectedVariable }}
        onChange={handleInputVariablesOnChange}
        starredVariables={starredVariables}
        toggleStarredVariable={toggleStarredVariable}
      />
    </div>
  );
}
