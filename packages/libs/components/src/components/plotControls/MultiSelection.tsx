import { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
// import Chip from '@material-ui/core/Chip';

interface MultiSelectionProps {
  labels: (string | undefined)[];
  setSelectedNodeLabels: (labels: (string | undefined)[]) => void;
  showNodeLabels: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
      maxWidth: 300,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  })
);

export default function MultiSelection(props: MultiSelectionProps) {
  const { labels, setSelectedNodeLabels, showNodeLabels } = props;
  const classes = useStyles();
  // default values are select all
  const [value, setValue] = useState<(string | undefined)[]>(labels);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setValue(event.target.value as string[]);
    setSelectedNodeLabels(event.target.value as string[]);
  };

  // set value as initial labels are most likely empty or undefined due to data request
  useEffect(() => {
    setValue(labels);
  }, [labels]);

  return (
    <div>
      <FormControl className={classes.formControl} disabled={!showNodeLabels}>
        <InputLabel id="demo-mutiple-checkbox-label">
          Select nodes...
        </InputLabel>
        <Select
          labelId="demo-mutiple-checkbox-label"
          id="demo-mutiple-checkbox"
          multiple
          value={value}
          onChange={handleChange}
          input={<Input />}
          renderValue={(selected) => (selected as string[]).join(', ')}
          MenuProps={{ variant: 'menu' }}
          autoWidth
        >
          {labels.map(
            (name) =>
              name != null && (
                <MenuItem key={name} value={name}>
                  <Checkbox
                    color="primary"
                    checked={value.indexOf(name) > -1}
                  />
                  <ListItemText primary={name} />
                </MenuItem>
              )
          )}
        </Select>
      </FormControl>
    </div>
  );
}
