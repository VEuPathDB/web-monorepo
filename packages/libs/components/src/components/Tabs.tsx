import { useState } from 'react';
import { Tabs as MUITabs, Tab, Box } from '@material-ui/core';
import { TabPanel, TabContext } from '@material-ui/lab';

interface Props {
  tabs: Array<{
    name: string;
    content: React.ReactElement;
  }>;
}

export default function Tabs(props: Props) {
  const [activeTab, setActiveTab] = useState('0');

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(String(newValue));
  };

  return (
    <div>
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: '1px solid #ccc' }}>
          <MUITabs value={Number(activeTab)} onChange={handleChange}>
            {props.tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.name}
                style={{ textTransform: 'none' }}
              />
            ))}
          </MUITabs>
        </Box>
        {props.tabs.map((tab, index) => (
          <TabPanel key={index} value={String(index)}>
            {tab.content}
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
}
