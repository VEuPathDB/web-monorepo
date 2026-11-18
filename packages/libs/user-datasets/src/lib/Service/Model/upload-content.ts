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

export interface PlaceholderContent extends UploadContentBase {
  readonly type: 'placeholder';
  readonly name: string;
}

export type UploadContent =
  | FileUploadContent
  | TextUploadContent
  | PlaceholderContent;

/**
 * Stands in for a file that is already stored on the server, so the update
 * form can show its name. It has no real content: it must never be uploaded
 * (see `isPlaceholder` and `newUpdateUploads`).
 */
export function isPlaceholder(content: UploadContent): boolean {
  return content.type === 'placeholder';
}

export function newUploadPlaceholder(name: string): PlaceholderContent {
  return {
    name,
    type: 'placeholder',
    toFile: () => {
      throw new Error('cannot make file of placeholder content!');
    },
  };
}

export function newUploadContent(file: File): FileUploadContent;
export function newUploadContent(
  text: string,
  name: string,
  contentType?: string,
): TextUploadContent;
export function newUploadContent(
  content: string | File,
  name?: string,
  contentType?: string,
): UploadContent {
  return typeof content === 'string'
    ? ({
        type: 'text',
        value: content,
        name,
        isPlaceholder,
        toFile: () =>
          new File(
            [content],
            name!,
            ifDefined(contentType, (it) => ({ type: it }))
          ),
      } as TextUploadContent)
    : ({
        type: 'file',
        file: content,
        name: content.name,
        toFile: () => content,
      } as FileUploadContent);
}
