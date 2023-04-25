import { fireEvent, render, screen } from '@testing-library/react';
import {
  MarkerConfigurationSelector,
  MarkerConfiguration,
} from './MarkerConfigurationSelector';
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
  test('users can select a marker', async () => {
    render(<ParentComponent />);

    expect(screen.getByText('No marker configuration selected.')).toBeVisible();
    screen.getByText('Donuts').click();
    screen.getByText('Selected marker configuration: Donuts.');

    screen.getByText('Bar plots').click();
    screen.getByText('Selected marker configuration: Bar plots.');
  });

  test('after a user selects a marker type, a marker-specific configuration panel appears', async () => {
    render(<ParentComponent />);

    screen.getByText('Donuts').click();

    const select = screen.getByLabelText('Frosting flavor');
    fireEvent.change(select, { target: { value: 'strawberry' } });

    expect(screen.getByText("You've got one strawberry donut.")).toBeVisible();

    screen.getByText('Bar plots').click();

    expect(
      screen.getByText('You will be plotting a Novel at Cheers.')
    ).toBeVisible();
  });

  test('users can configure their marker selection', async () => {
    render(<ParentComponent />);

    screen.getByText('Bar plots').click();

    const select = screen.getByLabelText('Bar options');
    fireEvent.change(select, { target: { value: 'The Blue Bar' } });

    expect(
      screen.getByText('You will be plotting a Novel at The Blue Bar.')
    ).toBeVisible();
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
  const [frostingSelection, setFrostingSelection] = useState('Unfrosted');
  return (
    <div>
      <p>You've got one {frostingSelection} donut.</p>
      <label htmlFor="frostingFlavor">
        Frosting flavor
        <select
          onChange={(event) => setFrostingSelection(event.target.value)}
          name="frostingFlavor"
          id="frostingFlavor"
          value={frostingSelection}
        >
          <option value="Unfrosted">Unfrosted</option>
          <option value="strawberry">Strawberry</option>
          <option value="chocolate">Chocolate</option>
        </select>
      </label>
    </div>
  );
}

function BarPlotConfigurationMenu() {
  const [barSelection, setBarSelection] = useState('Cheers');
  const [plotSelection, setPlotSelection] = useState('Novel');

  function handleSelection(event: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;
    name === 'bar' ? setBarSelection(value) : setPlotSelection(value);
  }

  return (
    <div>
      <p>
        You will be plotting a {plotSelection} at {barSelection}.
      </p>

      <label htmlFor="bar">
        Bar options
        <select
          onChange={handleSelection}
          value={barSelection}
          name="bar"
          id="bar"
        >
          <option value="Cheers">Cheers (Bostom, MA)</option>
          <option value="The Blue Bar">The Blue Bar (NYC)</option>
          <option value="Harry's Bar">Harry's Bar (Venice, IT)</option>
        </select>
      </label>

      <label htmlFor="plot">
        Plot options
        <select
          onChange={handleSelection}
          value={plotSelection}
          name="plot"
          id="plot"
        >
          <option value="Novel">Novel</option>
          <option value="Bank Heist">Bank Heist</option>
          <option value="Points">Points on a graph</option>
        </select>
      </label>
    </div>
  );
}
