import { useState } from 'react';
import { Tabs as MUITabs, Tab, AppBar } from '@material-ui/core';
import { TabPanel, TabContext } from '@material-ui/lab';

interface Props {
  items: Array<[string, React.ReactElement]>;
}

export default function Tabs(props: Props) {
  const [activeTab, setActiveTab] = useState('0');

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(String(newValue));
  };

  return (
    <div>
      <TabContext value={activeTab}>
        <AppBar position="static">
          <MUITabs value={Number(activeTab)} onChange={handleChange}>
            {props.items.map((item, index) => (
              <Tab key={index} label={item[0]} />
            ))}
          </MUITabs>
        </AppBar>
        {props.items.map((item, index) => (
          <TabPanel key={index} value={String(index)}>
            {item[1]}
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
}
