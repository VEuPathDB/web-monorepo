import { useState } from 'react';
import { Tabs as MUITabs, Tab } from '@material-ui/core';
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
        <MUITabs
          value={Number(activeTab)}
          onChange={handleChange}
          style={{ borderBottom: '1px solid #ccc' }}
        >
          {props.tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.name}
              style={{ textTransform: 'none' }}
            />
          ))}
        </MUITabs>
        {props.tabs.map((tab, index) => (
          <TabPanel key={index} value={String(index)}>
            {tab.content}
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
}
