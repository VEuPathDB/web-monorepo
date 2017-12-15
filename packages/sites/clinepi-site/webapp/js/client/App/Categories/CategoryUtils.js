

export function getCategoryColor (category) {
  if (!category) return null;
  switch (category.toLowerCase()) {
    case 'enteric':
      return '#6738ff';
    case 'malarial':
      return '#ff6d0d';
    default:
      return '#9b9c9c';
  }
}
