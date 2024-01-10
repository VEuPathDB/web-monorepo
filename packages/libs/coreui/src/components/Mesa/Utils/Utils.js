import { compose } from 'redux';

export function stringValue(value) {
  switch (typeof value) {
    case 'string':
      // HTML should not be parsed here.
      // if (isHtml(value)) {
      //   return htmlStringValue(value);
      // } else {
      //   return value;
      // }
      return value;
    case 'number':
    case 'boolean':
      return value.toString();
    case 'object':
      if (Array.isArray(value)) {
        return value.map(stringValue).join(', ');
      } else if (value === null) {
        return '';
      } else {
        return JSON.stringify(value);
      }
    case 'undefined':
    default:
      return '';
  }
}

export function isHtml(text, strict = false) {
  if (typeof text !== 'string') return false;
  if (strict && (text[0] !== '<' || text[text.length - 1] !== '>'))
    return false;

  const parser = new DOMParser().parseFromString(text, 'text/html');
  return Array.from(parser.body.childNodes).some((node) => node.nodeType === 1);
}

export function htmlStringValue(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function sortFactory(accessor) {
  accessor = typeof accessor == 'function' ? accessor : (value) => value;
  return function (a, b) {
    let A = accessor(a);
    let B = accessor(b);
    return A === B ? 0 : A < B ? 1 : -1;
  };
}

export const numericValue = (val) =>
  val ? parseFloat(`${val}`.replace('inf', 'Infinity')) : 0;

export function numberSort(_list, key, ascending = true) {
  const list = [..._list];
  const accessor = (val) => numericValue(val[key]);
  const result = list.sort(sortFactory(accessor));
  return ascending ? result.reverse() : result;
}

export const customSortFactory =
  (sortBy) =>
  (_list, key, ascending = true) => {
    const list = [..._list];
    const accessor = (val) => sortBy(val[key]);
    const result = list.sort(sortFactory(accessor));
    return ascending ? result.reverse() : result;
  };

export function arraysMatch(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return undefined;
  if (a.length !== b.length) return false;
  while (a.length) {
    if (a.shift() !== b.shift()) return false;
  }
  return true;
}

export function repositionItemInList(list, fromIndex, toIndex) {
  if (!list || !list.length) return list;
  if (fromIndex === toIndex) return list;
  if (fromIndex < 0 || toIndex < 0) return list;
  toIndex = toIndex < fromIndex ? toIndex + 1 : toIndex;
  const updatedList = [...list];
  const item = updatedList[fromIndex];
  updatedList.splice(fromIndex, 1);
  updatedList.splice(toIndex, 0, item);
  return [...updatedList];
}

export function textSort(_list, key, ascending = true) {
  const list = [..._list];
  const accessor = (val) =>
    typeof val[key] === 'string'
      ? val[key].trim().toLowerCase()
      : stringValue(val[key]).toLowerCase();
  const preSort = list.map(accessor);
  const sorted = list.sort(sortFactory(accessor));
  const postSort = sorted.map(accessor);
  const result = arraysMatch(preSort, postSort) ? list : sorted;
  return ascending ? result.reverse() : result;
}

export function makeClassifier(namespace, globalNamespace) {
  return (element, modifiers) => {
    if (Array.isArray(element)) element = element.join('-');
    let base =
      (globalNamespace ? globalNamespace + '-' : '') +
      (namespace ? namespace : '') +
      (element ? '-' + element : '');
    if (!modifiers || !modifiers.length) return base;
    if (!Array.isArray(modifiers)) modifiers = [modifiers];
    return modifiers.reduce((output, modifier) => {
      let addendum = ' ' + base + '--' + modifier;
      return output + addendum;
    }, base);
  };
}

export function randomize(low = 0, high = 99) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}

export function uid(len = 8) {
  let output = '';
  while (output.length < len) {
    let index = randomize(0, 35);
    if (index >= 10) output += String.fromCharCode(87 + index);
    else output += index.toString();
  }
  return output;
}

export const displayUnits = {
  px: /[0-9]+(px)?$/,
  vw: /[0-9]+vw$/,
  vw: /[0-9]+vw$/,
  em: /[0-9]+em$/,
  rem: /[0-9]+rem$/,
  percent: /[0-9]+%$/,
};

export function getUnitValue(size) {
  if (typeof size !== 'string')
    throw new TypeError('<getUnitValue>: invalid "size" string param:', size);
  return parseInt(size.match(/[0-9]+/)[0]);
}

export function combineWidths(...widths) {
  if (!Array.isArray(widths)) return null;
  if (widths.length === 1 && Array.isArray(widths[0])) widths = widths.shift();
  if (!Array.isArray(widths))
    throw new TypeError('<combineWidths>: invalid widths provided:', widths);

  const totals = {};

  widths.forEach((width) => {
    if (typeof width === 'number')
      return (totals.px =
        typeof totals.px === 'number' ? totals.px + width : width);
    if (typeof width !== 'string') return;
    else width = width.toLowerCase();

    Object.entries(displayUnits).forEach(([unit, pattern]) => {
      if (pattern.test(width)) {
        totals[unit] =
          typeof totals[unit] === 'number'
            ? totals[unit] + getUnitValue(width)
            : getUnitValue(width);
      }
    });
  });

  return Object.keys(totals).reduce((outputString, unit, index) => {
    if (!totals[unit]) return outputString;
    let displayUnit = unit === 'percent' ? '%' : unit;
    let value = totals[unit];
    if (index === 0) return value + displayUnit;
    else return `calc(${outputString} + ${value + displayUnit})`;
  }, '');
}
