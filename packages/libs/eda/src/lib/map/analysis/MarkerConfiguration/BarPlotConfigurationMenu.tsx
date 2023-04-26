import { H6, Paragraph } from '@veupathdb/coreui';
import {
  InputVariables,
  Props,
} from '../../../core/components/visualizations/InputVariables';

export function BarPlotConfigurationMenu({
  entities,
  selectedVariables,
  onChange,
  starredVariables,
  toggleStarredVariable,
}: Props) {
  return (
    <div style={{ minWidth: 300 }}>
      <H6>Configure Bar Plots</H6>
      <Paragraph
        styleOverrides={{
          padding: 0,
          margin: 0,
          fontWeight: 500,
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
