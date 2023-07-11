// milliseconds to mm/dd/yyyy
export function millisecondTodate(value: number) {
  const date = new Date(value); // Date 2011-05-09T06:08:45.178Z
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}
