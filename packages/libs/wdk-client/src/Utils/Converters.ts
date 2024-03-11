const scales = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Convert bytes to a human readable string
 */
export function bytesToHuman(numBytes: number) {
  return recurse(numBytes);
}

function recurse(size: number, scale = 0): string {
  return size < 1000 || scale === scales.length - 1
    ? `${size.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${
        scales[scale]
      }`
    : recurse(size / 1000, scale + 1);
}
