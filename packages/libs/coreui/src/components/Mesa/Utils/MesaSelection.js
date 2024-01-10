import { fail, badType, missingFromState } from './Errors';

export const createSelection = (_selection = []) => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    );
  const selection = new Set(_selection);
  return [...selection];
};

export const selectionFromRows = (rows, idAccessor) => {
  if (typeof idAccessor !== 'function')
    return badType(
      'selectionFromRows',
      'idAccessor',
      'function',
      typeof idAccessor
    );
  const idList = mapListToIds(rows, idAccessor);
  return createSelection(idList);
};

export const addRowToSelection = (_selection, row, idAccessor) => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    );
  if (typeof idAccessor !== 'function')
    return badType(
      'addRowToSelection',
      'idAccessor',
      'function',
      typeof idAccessor
    );
  const id = idAccessor(row);
  return addIdToSelection(_selection, id);
};

export const addIdToSelection = (_selection = [], id) => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    );
  const selection = new Set(_selection);
  selection.add(id);
  return [...selection];
};

export const addIdsToSelection = (_selection = [], ids) => {
  if (!Array.isArray(_selection))
    return badType(
      'addIdToSelection',
      '_selection',
      'array',
      typeof _selection
    );
  if (!Array.isArray(ids))
    return badType('addIdToSelection', 'ids', 'array', typeof ids);
  const selection = new Set([..._selection, ...ids]);
  return [...selection];
};

export const removeRowFromSelection = (_selection, row, idAccessor) => {
  if (!Array.isArray(_selection))
    return badType(
      'removeRowFromSelection',
      '_selection',
      'array',
      typeof _selection
    );
  if (typeof idAccessor !== 'function')
    return badType(
      'removeRowFromSelection',
      'idAccessor',
      'function',
      typeof idAccessor
    );
  const id = idAccessor(row);
  return removeIdFromSelection(_selection, id);
};

export const removeIdFromSelection = (_selection, id) => {
  if (!Array.isArray(_selection))
    return badType(
      'removeIdFromSelection',
      '_selection',
      'array',
      typeof _selection
    );
  const selection = new Set(Array.isArray(_selection) ? _selection : []);
  selection.delete(id);
  return [...selection];
};

export const removeIdsFromSelection = (_selection, ids) => {
  if (!Array.isArray(_selection))
    return badType(
      'removeIdsFromSelection',
      '_selection',
      'array',
      typeof _selection
    );
  if (!Array.isArray(ids))
    return badType('removeIdsFromSelection', 'ids', 'array', typeof ids);
  const selection = new Set(_selection);
  const removable = new Set(ids);
  return [...selection].filter((item) => !removable.has(item));
};

export const isRowSelected = (selection, row, idAccessor) => {
  if (typeof idAccessor !== 'function')
    return badType(
      'isRowSelected',
      'idAccessor',
      'function',
      typeof idAccessor
    );
  const id = idAccessor(row);
  return selection.includes(id);
};

export const mapListToIds = (list, idAccessor) => {
  if (typeof idAccessor !== 'function')
    return badType('mapListToIds', 'idAccessor', 'function', typeof idAccessor);
  return list.map(idAccessor);
};

export const intersectSelection = (_selection, _list, idAccessor) => {
  if (typeof idAccessor !== 'function')
    return badType(
      'intersectSelection',
      'idAccessor',
      'function',
      typeof idAccessor
    );
  const idList = mapListToIds(_list);
  const selection = new Set(Array.isArray(_selection) ? _selection : []);
  const intersection = new Set(idList);
  return [...selection].filter((item) => intersection.has(item));
};
