import { H6, Paragraph } from '@veupathdb/coreui';
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
      <H6>Configure Donuts</H6>
      <Paragraph
        styleOverrides={{
          padding: 0,
          margin: 0,
          fontWeight: 'bold',
        }}
      >
        Color:
      </Paragraph>
      <InputVariables
        inputs={[{ name: 'overlay', label: 'Variable' }]}
        entities={entities}
        selectedVariables={selectedVariables}
        onChange={onChange}
        starredVariables={starredVariables}
        toggleStarredVariable={toggleStarredVariable}
      />
    </div>
  );
}
