import { render, screen } from '@testing-library/react';
import { MarkerConfigurationSelector } from './MarkerConfigurationSelector';
import { useState } from 'react';

const markerTypes = [
  {
    name: 'Donuts',
    icon: () => {},
    renderConfigurationMenu: function DonutConfigurationMenu() {
      const [frostingSelection, setFrostingSelection] = useState('');
      return (
        <div>
          {frostingSelection.length > 0 ? (
            <p>A donut with {frostingSelection} frosting.</p>
          ) : (
            <></>
          )}
          <label htmlFor="frostingFlavor">
            Frosting flavor
            <select
              onChange={(event) => setFrostingSelection(event.target.value)}
              name="frostingFlavor"
              id="frostingFlavor"
            >
              <option value="">Unfrosted</option>
              <option value="strawberry">Strawberry</option>
              <option value="chocolate">Chocolate</option>
            </select>
          </label>
        </div>
      );
    },
  },
  {
    name: 'Bar plots',
    icon: () => {},
    renderConfigurationMenu: function BarPlotConfigurationMenu() {
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
    },
  },
];

describe('<MarkerConfigurationMenu />', () => {
  test('after a user selects a marker type, a marker-specific configuration panel appears', async () => {
    render(<MarkerConfigurationSelector markerTypes={markerTypes} />);

    screen.getByText('Donuts').click();
    screen.getByText('Frosting flavor');
    screen.getByText('Strawberry').click();

    expect(screen.getByText('A donut with strawberry frosting')).toBeVisible();

    screen.getByText('Bar plots').click();

    expect(
      screen.getByText('You will be plotting a novel at Cheers.')
    ).toBeVisible();
  });

  test('users can configure their marker selection', async () => {
    render(<MarkerConfigurationSelector markerTypes={markerTypes} />);

    screen.getByText('Bar plots').click();
    screen.getByLabelText('Bar options').click();
    screen.getByLabelText('The Blue Bar').click();

    expect(
      screen.getByText('You will be plotting a novel at The Blue Bar.')
    ).toBeVisible();
  });
});
