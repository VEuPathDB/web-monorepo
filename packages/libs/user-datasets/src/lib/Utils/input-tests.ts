export const needsFile = (input: HTMLInputElement) =>
  input.files != null && input.files.length > 0;

export const needsSelection = (input: HTMLSelectElement) =>
  input.selectedOptions != null && input.selectedOptions.length > 0;