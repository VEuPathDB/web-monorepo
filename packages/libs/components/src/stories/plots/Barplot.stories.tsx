import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import Barplot, { BarplotProps } from '../../plots/Barplot';
import { FacetedData, BarplotData } from '../../types/plots';
import FacetedBarplot from '../../plots/facetedPlots/FacetedBarplot';
import AxisRangeControl from '../../components/plotControls/AxisRangeControl';
import { NumberRange, NumberOrDateRange } from '../../types/general';
import { Toggle } from '@veupathdb/coreui';
import DraggablePanel, {
  HeightAndWidthInPixels,
} from '@veupathdb/coreui/lib/components/containers/DraggablePanel';

export default {
  title: 'Plots/Barplot',
  component: Barplot,
} as Meta;

const dataSet = {
  series: [
    {
      label: ['dogs', 'cats', 'monkeys'],
      value: [20, 14, 23],
      name: 'Yes',
    },
    {
      label: ['dogs', 'cats', 'monkeys'],
      value: [12, 18, 29],
      name: 'No',
    },
  ],
};

const Template: Story<BarplotProps> = (args) => <Barplot {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
  dependentAxisLabel: 'Awesomeness',
  independentAxisLabel: 'Animal',
  legendTitle: 'Domesticated',
  opacity: 0.75,
  title: 'Awesomeness of animals stratified by domestication',
};

export const EmptyData = Template.bind({});
EmptyData.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
};

export const EmptyDataLoading = Template.bind({});
EmptyDataLoading.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
  showSpinner: true,
};

export const NoDataOverlay = Template.bind({});
NoDataOverlay.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
  showNoDataOverlay: true,
  title: 'Awesomeness of animals stratified by domestication',
};

/**
 * FACETING
 */

const facetedData: FacetedData<BarplotData> = {
  facets: [
    {
      label: 'indoors',
      data: dataSet,
    },
    {
      label: 'outdoors',
      data: dataSet,
    },
    {
      label: 'indoors',
      data: dataSet,
    },
    {
      label: 'outdoors',
      data: dataSet,
    },
    {
      label: 'indoors',
      data: dataSet,
    },
    {
      label: 'outdoors',
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<BarplotData>;
  componentProps: BarplotProps;
  modalComponentProps: BarplotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  componentProps,
  modalComponentProps,
}) => (
  <FacetedBarplot
    data={data}
    componentProps={componentProps}
    modalComponentProps={modalComponentProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  componentProps: {
    title: 'Indoor and outdoor pets',
    independentAxisLabel: 'Pet',
    dependentAxisLabel: 'Count',
    containerStyles: {
      width: 300,
      height: 300,
      border: '1px solid #dadada',
    },
  },
  modalComponentProps: {
    containerStyles: {
      width: '85%',
      height: '100%',
      margin: 'auto',
    },
  },
};

const TemplateWithSelectedRangeControls: Story<Omit<BarplotProps, 'data'>> = (
  args
) => {
  const [dependentAxisRange, setDependentAxisRange] = useState<
    NumberRange | undefined
  >({ min: 1, max: 40 });
  const [dependentAxisLogScale, setDependentAxisLogScale] =
    useState<boolean | undefined>(false);

  const handleDependentAxisRangeChange = async (
    newRange?: NumberOrDateRange
  ) => {
    setDependentAxisRange(newRange as NumberRange);
  };

  const onDependentAxisLogScaleChange = async (value?: boolean) => {
    setDependentAxisLogScale(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Barplot
        data={dataSet}
        {...args}
        dependentAxisRange={dependentAxisRange}
        dependentAxisLogScale={dependentAxisLogScale}
      />
      <Toggle
        label="Log scale (will exclude values &le; 0):"
        value={dependentAxisLogScale ?? false}
        onChange={onDependentAxisLogScaleChange}
        styleOverrides={{ container: { marginLeft: '5em' } }}
      />
      <div style={{ height: 25 }} />
      <AxisRangeControl
        label="Y-axis range control"
        range={dependentAxisRange}
        onRangeChange={handleDependentAxisRangeChange}
        containerStyles={{ marginLeft: '5em' }}
      />
    </div>
  );
};

export const LogScale = TemplateWithSelectedRangeControls.bind({});
LogScale.args = {
  containerStyles: {
    height: '450px',
    width: '750px',
  },
};

// demo plot resize with draggable panel
export const PlotResizeWithDraggablePanel: Story<BarplotProps> = (args) => {
  const panelTitle = 'Panel 1';
  const draggablePanelHeight = 600;
  const draggablePanelWidth = 900;

  const [panelDimension, setPanelDimension] = useState<HeightAndWidthInPixels>({
    height: draggablePanelHeight,
    width: draggablePanelWidth,
  });

  return (
    <DraggablePanel
      defaultPosition={{ x: 200, y: 200 }}
      confineToParentContainer
      key={panelTitle}
      isOpen
      panelTitle={panelTitle}
      showPanelTitle={true}
      styleOverrides={{
        resize: 'both',
      }}
      onPanelResize={(dimensions: HeightAndWidthInPixels) => {
        setPanelDimension(dimensions);
      }}
    >
      <Barplot
        data={dataSet}
        dependentAxisLabel={'Awesomeness'}
        independentAxisLabel={'Animal'}
        displayLegend={false}
        containerStyles={{
          // perhaps plot height may be set to be proportional to to plot width
          // as mostly resize invloves the change of width
          // Otherwise, if DraggablePanel has other elements like InputVariables, Plot controls,
          // then, height should substract heights of those elements to be better represented
          height: panelDimension.height,
          width: panelDimension.width,
        }}
      />
    </DraggablePanel>
  );
};
