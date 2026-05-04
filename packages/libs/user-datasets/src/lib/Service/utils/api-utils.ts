export type QueryParams<T extends string> = {
  [K in T]: string | number | boolean;
};

export function makeQueryString(params: QueryParams<string>): string {
  if (Object.keys(params).length === 0) return '';

  const paramList: string[] = [];

  for (let key in Object.keys(params)) {
    paramList.push(`${key}=${encodeURIComponent(params[key])}`);
  }

  return '?' + paramList.join('&');
}
