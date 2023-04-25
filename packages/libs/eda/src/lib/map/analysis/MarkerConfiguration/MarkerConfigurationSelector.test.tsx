import { render, screen } from '@testing-library/react';
import {
  MarkerConfigurationSelector,
  MarkerConfiguration,
} from '../MarkerConfigurationSelector';
import { useState } from 'react';

const PlaceholderIcon = () => <svg />;

const markConfigurations: MarkerConfiguration[] = [
  {
    name: 'Donuts',
    icon: <PlaceholderIcon />,
    renderConfigurationMenu: <DonutConfigurationMenu />,
  },
  {
    name: 'Bar plots',
    icon: <PlaceholderIcon />,
    renderConfigurationMenu: <BarPlotConfigurationMenu />,
  },
];

describe('<MarkerConfigurationMenu />', () => {
  test('users can select a marker', () => {
    render(<ParentComponent />);

    expect(screen.getByText('No marker configuration selected.')).toBeVisible();
    screen.getByText('Donuts').click();
    screen.getByText('Selected marker configuration: Donuts.');

    screen.getByText('Bar plots').click();
    screen.getByText('Selected marker configuration: Bar plots.');
  });

  test('after a user selects a marker type, a marker-specific configuration panel appears', () => {
    render(<ParentComponent />);

    screen.getByText('Donuts').click();
    expect(screen.getByText('Donut configuration menu.')).toBeVisible();

    screen.getByText('Bar plots').click();
    expect(screen.getByText('Bar plots configuration menu.')).toBeVisible();
  });
});

function ParentComponent() {
  const [selectedMarkerConfigurationName, setSelectedMarkerConfigurationName] =
    useState('');

  return (
    <>
      {selectedMarkerConfigurationName.length ? (
        <p>Selected marker configuration: {selectedMarkerConfigurationName}.</p>
      ) : (
        <p>No marker configuration selected.</p>
      )}
      <MarkerConfigurationSelector
        markerConfigurations={markConfigurations}
        selectedMarkerConfigurationName={selectedMarkerConfigurationName}
        setSelectedMarkerConfigurationName={setSelectedMarkerConfigurationName}
      />
    </>
  );
}

function DonutConfigurationMenu() {
  return <div>Donut configuration menu.</div>;
}

function BarPlotConfigurationMenu() {
  return <div>Bar plots configuration menu.</div>;
}
