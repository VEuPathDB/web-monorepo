export function getSearchIconByType (type = '') {
  switch (type.toLowerCase()) {
    case 'participant':
    case 'participants':
      return 'child';
    case 'household':
    case 'households':
      return 'home';
    case 'observation':
    case 'observations':
      return 'stethoscope';
    case 'vector':
    case 'vectors':
      return 'bug';
    default:
      return 'globe';
  }
}

export function getSearchNameByType (type) {
  switch (type.toLowerCase()) {
    case 'participant':
    case 'participants':
      return 'Participants';
    case 'household':
    case 'households':
      return 'Households';
    case 'observation':
    case 'observations':
      return 'Observations';
    case 'vector':
    case 'vectors':
      return 'Vectors';
    default:
      return type;
  }
}

export function getBodyClassByType (type = '') {
  switch (type.toLowerCase()) {
    case 'participant':
    case 'participants':
      return 'red-fade-bg';
    case 'household':
    case 'households':
      return 'yellow-fade-bg';
    case 'observation':
    case 'observations':
      return 'blue-fade-bg';
    case 'vector':
    case 'vectors':
      return 'green-fade-bg';
    default:
      return 'grey-fade-bg';
  }
}
