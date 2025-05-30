// Utils

export function parseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}
