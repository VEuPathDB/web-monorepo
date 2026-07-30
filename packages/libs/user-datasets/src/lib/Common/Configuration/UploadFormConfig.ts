import { ReactElement, ReactNode } from 'react';

export interface UploadConfig {
  readonly enabled: boolean;
  readonly renderOverride?: (inputField: ReactElement) => ReactNode;
  readonly helpText?: ReactNode;
}

interface EnabledConfig extends UploadConfig {
  readonly enabled: true;
}

interface DisabledConfig extends UploadConfig {
  readonly enabled: false;
}

/** One data file input. Position in `slots` maps to position in `dataFiles`. */
export interface DataFileSlot {
  readonly label: string;
  readonly buttonText: string;
  readonly required: boolean;
}

export interface FileUploadConfig extends UploadConfig {
  /**
   * Labelled data file inputs. Declaring two or more renders one input per
   * slot; otherwise the single default input is rendered.
   *
   * NOTE: the current renderer (`DualFileInput`) handles **exactly two** slots
   * — it reads indices 0 and 1 only, so a third would be silently ignored.
   * Supporting more means generalising that component, or narrowing this to a
   * `readonly [DataFileSlot, DataFileSlot]` tuple so the compiler says so.
   */
  readonly slots?: readonly DataFileSlot[];

  /** `accept` attribute override. Defaults to the data type's extensions. */
  readonly accept?: string;
}

export type EnabledFileUploadConfig = EnabledConfig & FileUploadConfig;
export type DisabledFileUploadConfig = DisabledConfig &
  Partial<FileUploadConfig>;

export type OptionalFileUploadConfig =
  | EnabledFileUploadConfig
  | DisabledFileUploadConfig;

export interface UrlUploadConfig extends UploadConfig {}

export type EnabledUrlUploadConfig = EnabledConfig & UrlUploadConfig;
export type DisabledUrlUploadConfig = DisabledConfig & Partial<UrlUploadConfig>;

export type OptionalUrlUploadConfig =
  | EnabledUrlUploadConfig
  | DisabledUrlUploadConfig;

export interface DataInputConfig {
  readonly file?: OptionalFileUploadConfig;
  readonly url?: OptionalUrlUploadConfig;

  // TODO: is this needed?  It was unused in the previous iteration of the
  //       vdi-based user dataset upload form, but it is not clear whether this
  //       was a planned feature or a defunct feature.
  readonly result?: any;

  readonly helpText?: () => ReactElement;
}
