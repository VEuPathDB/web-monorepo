import { grey, blue } from '@material-ui/core/colors';
import { FilledSwitch } from '@veupathdb/coreui';
import { SwitchStyleSpecSubset } from '@veupathdb/coreui/dist/components/widgets/switch';

interface SwitchProps {
  selectedOption: boolean;
  disabled?: boolean;
  onOptionChange?: (selection: boolean) => void;
  labels?: {
    left?: string;
    right?: string;
  };
  size?: 'small' | 'medium';
  styleOverrides?: SwitchStyleSpecSubset;
}

export const Switch = ({
  selectedOption,
  disabled,
  onOptionChange,
  labels,
  size = 'medium',
  styleOverrides,
}: SwitchProps) => {
  return (
    <FilledSwitch
      options={[false, true]}
      labels={labels}
      selectedOption={selectedOption}
      disabled={disabled}
      onOptionChange={onOptionChange ?? (() => {})}
      styleOverrides={{
        default: [
          { backgroundColor: grey[500] },
          { backgroundColor: blue[800], knobColor: 'white' },
        ],
        hover: [
          { backgroundColor: grey[500] },
          { backgroundColor: blue[800], knobColor: 'white' },
        ],
        disabled: { backgroundColor: grey[300] },
        size: size,
        ...styleOverrides,
      }}
    />
  );
};
