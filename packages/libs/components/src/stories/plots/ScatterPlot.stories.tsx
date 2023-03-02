import React, { useState } from 'react';
import ScatterPlot, { ScatterPlotProps } from '../../plots/ScatterPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
// test to use RadioButtonGroup directly instead of ScatterPlotControls
import RadioButtonGroup from '../../components/widgets/RadioButtonGroup';
import { FacetedData, ScatterPlotData } from '../../types/plots';
import FacetedScatterPlot from '../../plots/facetedPlots/FacetedScatterPlot';
import SliderWidget, {
  SliderWidgetProps,
} from '../../components/widgets/Slider';
// Import scatterplot data
import {
  dataSetSequentialGradient,
  dataSet,
  dateStringDataSet,
  processInputData,
} from './ScatterPlot.storyData';

export default {
  title: 'Plots/ScatterPlot',
  component: ScatterPlot,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/41310',
  },
} as Meta;

/*
  Testing scatter, line, and density plots
  Case 1: number string; Case 2: date string
  Note that all plots will display smoothed mean line and confidence interval
    :it is because only single dataset is commonly used in this story
  uncomment Case (line starting with const { dataSetProcess, yMin, yMax }) to test each case
  Did not try to make it separate because each case requires the same function, processInputData
**/
// Case 1. X and Y: number string cases
const independentValueType = 'number';
const dependentValueType = 'number';
// Case 1-1) checking scatter plot: raw data with smoothed mean and confidence interval
const { dataSetProcess, yMin, yMax } = processInputData(
  dataSet,
  'scatterplot',
  'markers',
  independentValueType,
  dependentValueType,
  true
);
const { dataSetProcess: dataSetProcessDefaultColors } = processInputData(
  dataSet,
  'scatterplot',
  'markers',
  independentValueType,
  dependentValueType,
  false
);

const { dataSetProcess: dataSetProcessSequentialGradient } = processInputData(
  dataSetSequentialGradient,
  'scatterplot',
  'markers',
  independentValueType,
  dependentValueType,
  false
);

// Case 1-2) checking line plot: raw data with line
// const { dataSetProcess, yMin, yMax } = processInputData(
//   dataSet,
//   'lineplot',
//   'lines',
//   independentValueType,
//   dependentValueType
// );
// Case 1-3) checking density plot: raw data with filled area
// const { dataSetProcess, yMin, yMax } = processInputData(dataSet, 'densityplot', 'lines', independentValueType, dependentValueType);

// // // Case 2. X or Y : date string (yyyy-mm-dd) case
// // Case 2-1
// const independentValueType = 'date';
// const dependentValueType = 'number';
// // Case 2-2
// const independentValueType = 'number';
// const dependentValueType = 'date';
// const { dataSetProcess, yMin, yMax } = processInputData(dateStringDataSet, 'scatterplot', 'markers', independentValueType, dependentValueType, false);

// set some default props
const plotWidth = 1000;
const plotHeight = 600;
const independentAxisLabel = 'independent axis label';
const dependentAxisLabel = 'dependent axis label';
const plotTitle = '';

export const MultipleDataDefaultColors = () => {
  return (
    <ScatterPlot
      data={dataSetProcessDefaultColors}
      independentAxisLabel={independentAxisLabel}
      dependentAxisLabel={dependentAxisLabel}
      // not to use independentAxisRange
      // independentAxisRange={[xMin, xMax]}
      dependentAxisRange={{ min: yMin, max: yMax }}
      title={plotTitle}
      // width height is replaced with containerStyles
      containerStyles={{
        width: plotWidth,
        height: plotHeight,
      }}
      // staticPlot is changed to interactive
      interactive={true}
      // check enable/disable legend and built-in controls
      displayLegend={true}
      displayLibraryControls={true}
      // margin={{l: 50, r: 10, b: 20, t: 10}}
      // add legend title
      legendTitle={'legend title example'}
      independentValueType={independentValueType}
      dependentValueType={dependentValueType}
    />
  );
};

export const EmptyData = () => {
  return (
    <ScatterPlot
      data={undefined}
      // independentAxisLabel={independentAxisLabel}
      // dependentAxisLabel={dependentAxisLabel}
      // not to use independentAxisRange
      // independentAxisRange={[xMin, xMax]}
      dependentAxisRange={{ min: yMin, max: yMax }}
      title={plotTitle}
      // width height is replaced with containerStyles
      containerStyles={{
        width: plotWidth,
        height: plotHeight,
      }}
      // staticPlot is changed to interactive
      interactive={true}
      // check enable/disable legend and built-in controls
      displayLegend={false}
      displayLibraryControls={false}
      // margin is replaced with spacingOptions: testing here
      spacingOptions={{
        marginTop: 100,
        marginRight: 100,
        marginBottom: 100,
        marginLeft: 100,
      }}
    />
  );
};

export const EmptyDataLoading = () => {
  return (
    <ScatterPlot
      data={undefined}
      dependentAxisRange={{ min: yMin, max: yMax }}
      title={plotTitle}
      // width height is replaced with containerStyles
      containerStyles={{
        width: plotWidth,
        height: plotHeight,
      }}
      // staticPlot is changed to interactive
      interactive={false}
      // check enable/disable legend and built-in controls
      displayLegend={false}
      displayLibraryControls={false}
      // margin={{l: 50, r: 10, b: 20, t: 10}}
      showSpinner={true}
    />
  );
};

// test plot mode control to directly access RadioButtonGroup
// also, test for disabling radio item(s)
export const PlotModeControl = () => {
  const [valueSpec, setValueSpec] = useState('Raw');

  const onValueSpecChange = (value: string) => {
    setValueSpec(value);
  };

  return (
    <RadioButtonGroup
      label="Plot Modes"
      // following plotOptions
      options={['Raw', 'Smoothed mean with raw', 'Best fit line with raw']}
      // this will be used to disable radio options (grayed out)
      disabledList={['Smoothed mean with raw', 'Best fit line with raw']}
      selectedOption={valueSpec}
      onOptionSelected={onValueSpecChange}
      orientation={'horizontal'}
      labelPlacement={'end'}
      buttonColor={'primary'}
      margins={['5em', '0', '0', '5em']}
      itemMarginRight={50}
    />
  );
};

const Template = (args: any) => <ScatterPlot {...args} />;

const disableDataControl = {
  data: { control: { disable: true } },
};

// adding storybook control
export const WithStorybookControl: Story<any> = Template.bind({});
// set default values for args that use default storybook control
WithStorybookControl.args = {
  data: dataSetProcess,
  interactive: true,
  displayLegend: true,
  displayLibraryControls: true,
  showSpinner: false,
  legendTitle: 'Legend title example',
  independentAxisLabel: 'Floor material',
  dependentAxisLabel: 'Sleeping rooms in dwelling',
  containerStyles: {
    width: plotWidth,
    height: plotHeight,
  },
};
// Don't show "data" in storybook controls because it's impractical to edit it
WithStorybookControl.argTypes = disableDataControl;

/**
 * FACETING
 */

const facetedData: FacetedData<ScatterPlotData> = {
  facets: [
    {
      label: 'Facet 1',
      data: dataSetProcess,
    },
    {
      label: 'Facet 2',
      data: dataSetProcess,
    },
    {
      label: 'Facet 3',
      data: dataSetProcess,
    },
    {
      label: 'Facet 400',
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<ScatterPlotData>;
  componentProps: ScatterPlotProps;
  modalComponentProps: ScatterPlotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  componentProps,
  modalComponentProps,
}) => (
  <FacetedScatterPlot
    data={data}
    componentProps={componentProps}
    modalComponentProps={modalComponentProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  componentProps: {
    title: 'Faceted ScatterPlot',
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

export const opacitySlider = () => {
  const disabled = false;
  const [markerBodyOpacity, setMarkerBodyOpacity] = useState(0);
  const containerStyles = {
    height: 100,
    width: 425,
    marginLeft: 75,
  };

  // gradient color
  const colorSpecProps: SliderWidgetProps['colorSpec'] = {
    type: 'gradient',
    tooltip: '#aaa',
    knobColor: '#aaa',
    trackGradientStart: '#fff',
    trackGradientEnd: '#000',
  };

  return (
    <>
      <ScatterPlot
        data={dataSetProcess}
        independentAxisLabel={independentAxisLabel}
        dependentAxisLabel={dependentAxisLabel}
        // not to use independentAxisRange
        // independentAxisRange={[xMin, xMax]}
        dependentAxisRange={{ min: yMin, max: yMax }}
        title={'General color'}
        // width height is replaced with containerStyles
        containerStyles={{
          width: plotWidth,
          height: plotHeight,
        }}
        // staticPlot is changed to interactive
        interactive={true}
        // check enable/disable legend and built-in controls
        displayLegend={true}
        displayLibraryControls={true}
        // margin={{l: 50, r: 10, b: 20, t: 10}}
        // add legend title
        legendTitle={'legend title example'}
        independentValueType={independentValueType}
        dependentValueType={dependentValueType}
        markerBodyOpacity={markerBodyOpacity}
      />

      {/* Sequential gradient color   */}
      <ScatterPlot
        data={dataSetProcessSequentialGradient}
        independentAxisLabel={independentAxisLabel}
        dependentAxisLabel={dependentAxisLabel}
        // not to use independentAxisRange
        // independentAxisRange={[xMin, xMax]}
        dependentAxisRange={{ min: yMin, max: yMax }}
        title={'Sequential gradient color'}
        // width height is replaced with containerStyles
        containerStyles={{
          width: plotWidth,
          height: plotHeight,
        }}
        // staticPlot is changed to interactive
        interactive={true}
        // check enable/disable legend and built-in controls
        displayLegend={true}
        displayLibraryControls={true}
        // margin={{l: 50, r: 10, b: 20, t: 10}}
        // add legend title
        legendTitle={'legend title example'}
        independentValueType={independentValueType}
        dependentValueType={dependentValueType}
        markerBodyOpacity={markerBodyOpacity}
      />

      <SliderWidget
        minimum={0}
        maximum={1}
        // hide text form
        // showTextInput={true}
        step={0.1}
        value={0}
        debounceRateMs={250}
        onChange={(newValue: number) => {
          setMarkerBodyOpacity(newValue);
        }}
        containerStyles={containerStyles}
        showLimits={true}
        label={'Marker opacity'}
        disabled={disabled}
        // test gradient color
        colorSpec={colorSpecProps}
      />
    </>
  );
};
