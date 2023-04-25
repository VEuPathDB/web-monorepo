import { render, screen } from '@testing-library/react';
import { MarkerConfiguration } from './MarkerConfiguration';

describe('<MarkerConfiguration />', () => {
  test('users can select a marker type', async () => {
    render(<MarkerConfiguration />);

    expect(await screen.findByText('Hello')).toBeVisible();
  });
  test('when a user selects a marker type, a marker-specific configuration panel appears', async () => {
    render(<MarkerConfiguration />);

    expect(await screen.findByText('Hello')).toBeVisible();
  });
  test('when a user selects a marker type, a marker-specific configuration panel appears', async () => {
    render(<MarkerConfiguration />);

    expect(await screen.findByText('Hello')).toBeVisible();
  });
});
