export type QueryParams<T extends string> = Partial<
  Record<T, string | number | boolean>
>;

export function makeQueryString(params: QueryParams<string>): string {
  if (Object.keys(params).length === 0) return '';

  const paramList: string[] = [];

  for (const key of Object.keys(params)) {
    const param = params[key];

    if (param == null) continue;

    paramList.push(`${key}=${encodeURIComponent(param)}`);
  }

  return '?' + paramList.join('&');
}
