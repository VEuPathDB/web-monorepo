import { badType } from './Errors';

export const createSelection = <T = string | number>(
  _selection: T[] = []
): T[] => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    ) as never;
  const selection = new Set(_selection);
  return [...selection];
};

export const selectionFromRows = <Row>(
  rows: Row[],
  idAccessor: (row: Row) => string | number
): (string | number)[] => {
  if (typeof idAccessor !== 'function')
    return badType(
      'selectionFromRows',
      'idAccessor',
      'function',
      typeof idAccessor
    ) as never;
  const idList = mapListToIds(rows, idAccessor);
  return createSelection(idList);
};

export const addRowToSelection = <Row>(
  _selection: (string | number)[],
  row: Row,
  idAccessor: (row: Row) => string | number
): (string | number)[] => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    ) as never;
  if (typeof idAccessor !== 'function')
    return badType(
      'addRowToSelection',
      'idAccessor',
      'function',
      typeof idAccessor
    ) as never;
  const id = idAccessor(row);
  return addIdToSelection(_selection, id);
};

export const addIdToSelection = <T = string | number>(
  _selection: T[] = [],
  id: T
): T[] => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    ) as never;
  const selection = new Set(_selection);
  selection.add(id);
  return [...selection];
};

export const addIdsToSelection = <T = string | number>(
  _selection: T[] = [],
  ids: T[]
): T[] => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    ) as never;
  if (!Array.isArray(ids))
    return badType('addIdToSelection', 'ids', 'array', typeof ids) as never;
  const selection = new Set([..._selection, ...ids]);
  return [...selection];
};

export const removeRowFromSelection = <Row>(
  _selection: (string | number)[],
  row: Row,
  idAccessor: (row: Row) => string | number
): (string | number)[] => {
  if (!Array.isArray(_selection))
    return badType(
      'removeRowFromSelection',
      '_selection',
      'array',
      typeof _selection
    ) as never;
  if (typeof idAccessor !== 'function')
    return badType(
      'removeRowFromSelection',
      'idAccessor',
      'function',
      typeof idAccessor
    ) as never;
  const id = idAccessor(row);
  return removeIdFromSelection(_selection, id);
};

export const removeIdFromSelection = <T = string | number>(
  _selection: T[],
  id: T
): T[] => {
  if (!Array.isArray(_selection))
    return badType(
      'removeIdFromSelection',
      '_selection',
      'array',
      typeof _selection
    ) as never;
  const selection = new Set(Array.isArray(_selection) ? _selection : []);
  selection.delete(id);
  return [...selection];
};

export const removeIdsFromSelection = <T = string | number>(
  _selection: T[],
  ids: T[]
): T[] => {
  if (!Array.isArray(_selection))
    return badType(
      'removeIdsFromSelection',
      '_selection',
      'array',
      typeof _selection
    ) as never;
  if (!Array.isArray(ids))
    return badType(
      'removeIdsFromSelection',
      'ids',
      'array',
      typeof ids
    ) as never;
  const selection = new Set(_selection);
  const removable = new Set(ids);
  return [...selection].filter((item) => !removable.has(item));
};

export const isRowSelected = <Row>(
  selection: (string | number)[],
  row: Row,
  idAccessor: (row: Row) => string | number
): boolean => {
  if (typeof idAccessor !== 'function')
    return badType(
      'isRowSelected',
      'idAccessor',
      'function',
      typeof idAccessor
    ) as never;
  const id = idAccessor(row);
  return selection.includes(id);
};

export const mapListToIds = <Row>(
  list: Row[],
  idAccessor: (row: Row) => string | number
): (string | number)[] => {
  if (typeof idAccessor !== 'function')
    return badType(
      'mapListToIds',
      'idAccessor',
      'function',
      typeof idAccessor
    ) as never;
  return list.map(idAccessor);
};

export const intersectSelection = <Row>(
  _selection: (string | number)[],
  _list: Row[],
  idAccessor: (row: Row) => string | number
): (string | number)[] => {
  if (typeof idAccessor !== 'function')
    return badType(
      'intersectSelection',
      'idAccessor',
      'function',
      typeof idAccessor
    ) as never;
  const idList = mapListToIds(_list, idAccessor);
  const selection = new Set(Array.isArray(_selection) ? _selection : []);
  const intersection = new Set(idList);
  return [...selection].filter((item) => intersection.has(item));
};
