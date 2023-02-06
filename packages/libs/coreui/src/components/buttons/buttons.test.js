import { screen, render, fireEvent } from "@testing-library/react";

import { FilledButton } from "./";

describe("Buttons", () => {
  it("should handle click event", async () => {
    const mockOnPressHandler = jest.fn();
    render(<FilledButton text="Button Text" onPress={mockOnPressHandler} />);

    fireEvent.click(screen.getByText("Button Text"));
    fireEvent.click(screen.getByText("Button Text"));

    expect(mockOnPressHandler).toBeCalledTimes(2);
  });
});
