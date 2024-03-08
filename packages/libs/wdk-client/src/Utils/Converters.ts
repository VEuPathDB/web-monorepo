const scales = ['B', 'K', 'M', 'G'];

export function bytesToHuman(size: number, scale = 0): string {
  return size < 1000 || scale === scales.length - 1
    ? `${size.toFixed(2)} ${scales[scale]}`
    : bytesToHuman(size / 1000, scale + 1);
}
