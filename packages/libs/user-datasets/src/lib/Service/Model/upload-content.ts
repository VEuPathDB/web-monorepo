import { ifDefined } from '../../Utils';

export interface UploadContentBase {
  readonly type: string;
  readonly name: string;

  toFile(): File;
}

export interface FileUploadContent extends UploadContentBase {
  readonly type: 'file';
  readonly file: File;
}

export interface TextUploadContent extends UploadContentBase {
  readonly type: 'text';
  readonly name: string;
  readonly value: string;
  readonly contentType?: string;
}

export type UploadContent = FileUploadContent | TextUploadContent;

export function newUploadContent(file: File): FileUploadContent
export function newUploadContent(text: string, name: string, contentType?: string): TextUploadContent
export function newUploadContent(
  content: string | File,
  name?: string,
  contentType?: string,
): UploadContent {
  return typeof content === 'string'
    ? {
      type: 'text',
      value: content,
      name,
      toFile: () => new File([content], name!, ifDefined(contentType, (it) => ({type: it}))),
    } as TextUploadContent
    : {
      type: 'file',
      file: content,
      name: content.name,
      toFile: () => content,
    } as FileUploadContent;
}
