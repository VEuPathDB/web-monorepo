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

export function getCategoryName (category = '') {
  switch (category.toLowerCase()) {
    case 'malarial':
    case 'malaria':
      return <span>A <b>Malaria</b> Study</span>;
    case 'enteric':
      return <span>An <b>Enteric</b> Disease Study</span>;
    default:
      return <span>An <b>Epidemiological</b> Study</span>;
  }
};
