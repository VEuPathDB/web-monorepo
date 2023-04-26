import { H6 } from '@veupathdb/coreui';
import {
  InputVariables,
  Props,
} from '../../../core/components/visualizations/InputVariables';

export function DonutConfigurationMenu({
  entities,
  selectedVariables,
  onChange,
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
        inputs={[{ name: 'overlay', label: 'Variable', titleOverride: ' ' }]}
        entities={entities}
        selectedVariables={selectedVariables}
        onChange={onChange}
        starredVariables={starredVariables}
        toggleStarredVariable={toggleStarredVariable}
      />
    </div>
  );
}
