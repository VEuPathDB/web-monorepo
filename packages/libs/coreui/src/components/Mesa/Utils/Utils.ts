export function stringValue(value: unknown): string {
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

export function isHtml(text: unknown, strict = false): boolean {
  if (typeof text !== 'string') return false;
  if (strict && (text[0] !== '<' || text[text.length - 1] !== '>'))
    return false;

  const parser = new DOMParser().parseFromString(text, 'text/html');
  return Array.from(parser.body.childNodes).some((node) => node.nodeType === 1);
}

export function htmlStringValue(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function sortFactory<T>(
  accessor?: (value: T) => unknown
): (a: T, b: T) => number {
  const accessorFn =
    typeof accessor === 'function' ? accessor : (value: T) => value;
  return function (a: T, b: T) {
    const A = accessorFn(a);
    const B = accessorFn(b);
    // Using any for comparison as we're doing a generic sort
    return A === B ? 0 : (A as any) < (B as any) ? 1 : -1;
  };
}

export const numericValue = (val: unknown): number =>
  val ? parseFloat(`${val}`.replace('inf', 'Infinity')) : 0;

export function numberSort<T extends Record<string, unknown>>(
  _list: T[],
  key: string,
  ascending = true
): T[] {
  const list = [..._list];
  const accessor = (val: T) => numericValue(val[key]);
  const result = list.sort(sortFactory(accessor));
  return ascending ? result.reverse() : result;
}

export const customSortFactory =
  <T>(sortBy: (value: unknown) => unknown) =>
  (_list: T[], key: string, ascending = true): T[] => {
    const list = [..._list] as Record<string, unknown>[];
    const accessor = (val: Record<string, unknown>) => sortBy(val[key]);
    const result = list.sort(sortFactory(accessor)) as T[];
    return ascending ? result.reverse() : result;
  };

export function arraysMatch<T>(a: unknown, b: unknown): boolean | undefined {
  if (!Array.isArray(a) || !Array.isArray(b)) return undefined;
  if (a.length !== b.length) return false;
  const aCopy = [...a];
  const bCopy = [...b];
  while (aCopy.length) {
    if (aCopy.shift() !== bCopy.shift()) return false;
  }
  return true;
}

export function repositionItemInList<T>(
  list: T[],
  fromIndex: number,
  toIndex: number
): T[] {
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

export function textSort<T extends Record<string, unknown>>(
  _list: T[],
  key: string,
  ascending = true
): T[] {
  const list = [..._list];
  const accessor = (val: T) => {
    const value = val[key];
    return typeof value === 'string'
      ? value.trim().toLowerCase()
      : stringValue(value).toLowerCase();
  };
  const preSort = list.map(accessor);
  const sorted = list.sort(sortFactory(accessor));
  const postSort = sorted.map(accessor);
  const result = arraysMatch(preSort, postSort) ? list : sorted;
  return ascending ? result.reverse() : result;
}

export function makeClassifier(
  namespace?: string,
  globalNamespace?: string
): (element?: string | string[], modifiers?: string | string[]) => string {
  return (element?: string | string[], modifiers?: string | string[]) => {
    if (Array.isArray(element)) element = element.join('-');
    const base =
      (globalNamespace ? globalNamespace + '-' : '') +
      (namespace ? namespace : '') +
      (element ? '-' + element : '');
    if (!modifiers || !modifiers.length) return base;
    if (!Array.isArray(modifiers)) modifiers = [modifiers];
    return modifiers.reduce((output, modifier) => {
      const addendum = ' ' + base + '--' + modifier;
      return output + addendum;
    }, base);
  };
}

export function randomize(low = 0, high = 99): number {
  return Math.floor(Math.random() * (high - low + 1) + low);
}

export function uid(len = 8): string {
  let output = '';
  while (output.length < len) {
    const index = randomize(0, 35);
    if (index >= 10) output += String.fromCharCode(87 + index);
    else output += index.toString();
  }
  return output;
}

export const displayUnits = {
  px: /[0-9]+(px)?$/,
  vw: /[0-9]+vw$/,
  em: /[0-9]+em$/,
  rem: /[0-9]+rem$/,
  percent: /[0-9]+%$/,
};

export function getUnitValue(size: string): number {
  if (typeof size !== 'string')
    throw new TypeError('<getUnitValue>: invalid "size" string param:' + size);
  const match = size.match(/[0-9]+/);
  if (!match)
    throw new TypeError('<getUnitValue>: no numeric value found in size');
  return parseInt(match[0]);
}

export function combineWidths(...widths: (string | number)[]): string {
  if (!Array.isArray(widths)) return '';
  if (widths.length === 1 && Array.isArray(widths[0])) widths = widths[0];
  if (!Array.isArray(widths))
    throw new TypeError('<combineWidths>: invalid widths provided:' + widths);

  const totals: Record<string, number> = {};

  widths.forEach((width) => {
    if (typeof width === 'number')
      return (totals.px =
        typeof totals.px === 'number' ? totals.px + width : width);
    if (typeof width !== 'string') return;
    else width = width.toLowerCase();

    Object.entries(displayUnits).forEach(([unit, pattern]) => {
      if (pattern.test(width as string)) {
        totals[unit] =
          typeof totals[unit] === 'number'
            ? totals[unit] + getUnitValue(width as string)
            : getUnitValue(width as string);
      }
    });
  });

  return Object.keys(totals).reduce((outputString, unit, index) => {
    if (!totals[unit]) return outputString;
    const displayUnit = unit === 'percent' ? '%' : unit;
    const value = totals[unit];
    if (index === 0) return value + displayUnit;
    else return `calc(${outputString} + ${value + displayUnit})`;
  }, '');
}
