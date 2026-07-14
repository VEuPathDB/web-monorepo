export function sanitizeFileName(file: File): File {
  return new File([file], file.name.replace(/\s+/g, '_'), file);
}
